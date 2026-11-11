import {DEFAULT_JOB_FILTERS, distanceKm, filterJobs, JOB_SOURCE_CACHE_MS, loadJobSearch, validateJobFilters} from '../src/utils/jobFilters';
import type {Job} from '../src/slices/types';

const center = {latitude: 0, longitude: 0};
const now = Date.parse('2026-11-10T12:00:00Z');
const job = (id: number, overrides: Partial<Job> = {}): Job => ({
  id, title: 'Repair a tap', latitude: '0', longitude: '0.1', budget: '100',
  created_at: '2026-11-10 10:00:00', ...overrides,
} as Job);

it('measures real kilometres including across the date line', () => {
  expect(distanceKm(job(1), center)).toBeCloseTo(11.119, 2);
  expect(distanceKm(job(1, {longitude: '-179.9'}), {latitude: 0, longitude: 179.9})).toBeCloseTo(22.239, 2);
  expect(distanceKm(job(1, {latitude: '90', longitude: '180'}), {latitude: 90, longitude: 0})).toBeCloseTo(0);
});

it('excludes distant jobs and missing or invalid coordinates while accepting zero coordinates', () => {
  const jobs = [job(1), job(2, {latitude: '0', longitude: '0'}),
    job(3, {latitude: ''}), job(4, {longitude: 'not-a-number'}),
    job(5, {latitude: '91'}), job(6, {longitude: '1'})];
  expect(filterJobs(jobs, center, DEFAULT_JOB_FILTERS).map(item => item.id)).toEqual([1, 2]);
  expect(filterJobs(jobs, center, {...DEFAULT_JOB_FILTERS, radiusKm: 5}).map(item => item.id)).toEqual([2]);
});

it('includes jobs exactly at the selected radius boundary', () => {
  const radiusKm = distanceKm(job(1), center)!;
  expect(filterJobs([job(1)], center, {...DEFAULT_JOB_FILTERS, radiusKm})).toHaveLength(1);
});

it('excludes a Hoshiarpur job when the search center is Patiala at 50 km', () => {
  // Coarse city-center fixtures; these are not a user's GPS coordinates.
  const hoshiarpurJob = job(1, {latitude: '31.63', longitude: '75.86'});
  const patiala = {latitude: 30.34, longitude: 76.39};
  expect(distanceKm(hoshiarpurJob, patiala)).toBeGreaterThan(140);
  expect(filterJobs([hoshiarpurJob], patiala, DEFAULT_JOB_FILTERS)).toEqual([]);
  expect(filterJobs([hoshiarpurJob], patiala, {...DEFAULT_JOB_FILTERS, radiusKm: 300})).toHaveLength(1);
});

it('never treats an invalid search center as a match for every job', () => {
  expect(filterJobs([job(1)], {latitude: NaN, longitude: 0}, DEFAULT_JOB_FILTERS)).toEqual([]);
});

it('applies budget and UTC posted date together with the radius', () => {
  const jobs = [job(1), job(2, {budget: '99'}), job(3, {budget: '201'}),
    job(4, {created_at: '2026-11-08 23:59:59'}), job(5, {created_at: ''}),
    job(6, {created_at: '2026-11-10T14:00:00Z'}), job(7, {created_at: '2026-11-09T12:00:00Z', budget: '200'})];
  expect(filterJobs(jobs, center, {...DEFAULT_JOB_FILTERS, minBudget: '100', maxBudget: '200', postedWithin: 'day'}, now)
    .map(item => item.id)).toEqual([1, 7]);
});

it('treats an empty maximum as unlimited and supports week and month date windows', () => {
  const jobs = [job(1, {budget: '2000', created_at: '2026-11-05T12:00:00Z'}),
    job(2, {created_at: '2026-10-15T12:00:00Z'}), job(3, {created_at: '2026-10-01T12:00:00Z'})];
  expect(filterJobs(jobs, center, {...DEFAULT_JOB_FILTERS, postedWithin: 'week'}, now).map(item => item.id)).toEqual([1]);
  expect(filterJobs(jobs, center, {...DEFAULT_JOB_FILTERS, postedWithin: 'month'}, now).map(item => item.id)).toEqual([1, 2]);
});

it.each([
  {radiusKm: 0}, {radiusKm: 301}, {minBudget: '-1'}, {maxBudget: 'abc'},
  {maxBudget: '10.001'}, {minBudget: '200', maxBudget: '100'},
])('rejects invalid filter values: %p', changes => {
  expect(validateJobFilters({...DEFAULT_JOB_FILTERS, ...changes})).toBeTruthy();
});

it('finds nearby jobs on later API pages before calculating pagination and counts', async () => {
  const fetchPage = jest.fn(async (page: number) => ({
    jobs: page === 1 ? [job(1, {longitude: '2'}), job(2)] : [job(2), job(3)],
    total_pages: 2,
  }));
  const result = await loadJobSearch(fetchPage, center, DEFAULT_JOB_FILTERS, 2, 1);
  expect(fetchPage.mock.calls).toEqual([[1], [2]]);
  expect(result.jobs.map(item => item.id)).toEqual([3]);
  expect(result.total).toBe(2);
  expect(result.total_pages).toBe(2);
  expect(result.sourceJobs).toHaveLength(3);
});

it('keeps counts consistent with the existing job search and excludes substring-only matches', async () => {
  const result = await loadJobSearch(async () => ({jobs: [job(1, {title: 'AC repair'}),
    job(2, {title: 'Vacuum repair'}), job(3, {title: 'AC install'})], total_pages: 1}),
  center, DEFAULT_JOB_FILTERS, 1, 10, 'ac rep');
  expect(result.jobs.map(item => item.id)).toEqual([1]);
  expect(result.total).toBe(1);
});

it('reports a failed later page rather than returning an incomplete nearby list', async () => {
  await expect(loadJobSearch(async page => {
    if (page === 2) throw new Error('Network unavailable');
    return {jobs: [job(1)], total_pages: 2};
  }, center, DEFAULT_JOB_FILTERS, 1, 10)).rejects.toThrow('Network unavailable');
});

it('changes filters and pages using the recently loaded source without calling the API again', async () => {
  const fetchPage = jest.fn(async () => ({jobs: [job(1, {budget: '50'}), job(2, {longitude: '1', budget: '500'})], total_pages: 1}));
  const first = await loadJobSearch(fetchPage, center, DEFAULT_JOB_FILTERS, 1, 10, '', {owner: '19'});
  const second = await loadJobSearch(fetchPage, center, {...DEFAULT_JOB_FILTERS, radiusKm: 300},
    2, 1, '', {owner: '19', cache: first.sourceCache});
  expect(fetchPage).toHaveBeenCalledTimes(1);
  expect(second.cacheHit).toBe(true);
  expect(second.jobs.map(item => item.id)).toEqual([2]);
  expect(second.total).toBe(2);
  expect(second.sourceCache.fetchedAt).toBe(first.sourceCache.fetchedAt);
});

it('recalculates distances from a new center even when source jobs are cached', async () => {
  const fetchPage = jest.fn(async () => ({jobs: [job(1)], total_pages: 1}));
  const first = await loadJobSearch(fetchPage, center, DEFAULT_JOB_FILTERS, 1, 10, '', {owner: '19'});
  const second = await loadJobSearch(fetchPage, {latitude: 10, longitude: 10}, DEFAULT_JOB_FILTERS,
    1, 10, '', {owner: '19', cache: first.sourceCache});
  expect(second.jobs).toEqual([]);
  expect(fetchPage).toHaveBeenCalledTimes(1);
});

it.each(['expired', 'refresh', 'account', 'search'])('refetches source jobs for %s instead of incorrectly reusing the cache', async reason => {
  const fetchPage = jest.fn(async () => ({jobs: [job(1)], total_pages: 1}));
  const first = await loadJobSearch(fetchPage, center, DEFAULT_JOB_FILTERS, 1, 10, '', {owner: '19'});
  const cache = {...first.sourceCache,
    fetchedAt: reason === 'expired' ? Date.now() - JOB_SOURCE_CACHE_MS - 1 : first.sourceCache.fetchedAt};
  const second = await loadJobSearch(fetchPage, center, DEFAULT_JOB_FILTERS, 1, 10,
    reason === 'search' ? 'repair' : '', {cache, owner: reason === 'account' ? '20' : '19', force: reason === 'refresh'});
  expect(second.cacheHit).toBe(false);
  expect(fetchPage).toHaveBeenCalledTimes(2);
});

it('reuses a legitimately empty result without repeatedly calling the API', async () => {
  const fetchPage = jest.fn(async () => ({jobs: [], total_pages: 1}));
  const first = await loadJobSearch(fetchPage, center, DEFAULT_JOB_FILTERS, 1, 10, '', {owner: '19'});
  const second = await loadJobSearch(fetchPage, center, DEFAULT_JOB_FILTERS, 1, 10, '', {owner: '19', cache: first.sourceCache});
  expect(second.total).toBe(0);
  expect(second.cacheHit).toBe(true);
  expect(fetchPage).toHaveBeenCalledTimes(1);
});

it('keeps pagination on the loaded search snapshot without restarting GPS or refetching all source pages', async () => {
  const fetchPage = jest.fn(async () => ({jobs: [job(1), job(2)], total_pages: 1}));
  const first = await loadJobSearch(fetchPage, center, DEFAULT_JOB_FILTERS, 1, 1, '', {owner: '19'});
  const second = await loadJobSearch(fetchPage, center, DEFAULT_JOB_FILTERS, 2, 1, '',
    {owner: '19', cache: {...first.sourceCache, fetchedAt: Date.now() - 60000}});
  expect(second.jobs.map(item => item.id)).toEqual([2]);
  expect(fetchPage).toHaveBeenCalledTimes(1);
});
