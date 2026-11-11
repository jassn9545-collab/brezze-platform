import type {Job} from '../slices/types';

export type JobFilters = {
  radiusKm: number;
  minBudget: string;
  maxBudget: string;
  postedWithin: 'anytime' | 'day' | 'week' | 'month';
};

export type SearchLocation = {latitude: number; longitude: number};

export const DEFAULT_JOB_FILTERS: JobFilters = {
  radiusKm: 50,
  minBudget: '0',
  maxBudget: '',
  postedWithin: 'anytime',
};

export function validateJobFilters(filters: JobFilters): string | null {
  if (!Number.isFinite(filters.radiusKm) || filters.radiusKm < 5 || filters.radiusKm > 300) {
    return 'Choose a radius between 5 and 300 km.';
  }
  if (![filters.minBudget, filters.maxBudget].every(value => value.trim() === '' || /^\d+(\.\d{1,2})?$/.test(value.trim()))) {
    return 'Enter a valid budget with up to two decimal places.';
  }
  if (filters.maxBudget.trim() !== '' && Number(filters.minBudget) > Number(filters.maxBudget)) {
    return 'Maximum budget must be at least the minimum budget.';
  }
  return null;
}

function matchesSearch(job: Job, search: string): boolean {
  const terms = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const words = [job.title, job.category, job.description, job.address, job.city, job.country]
    .filter(value => typeof value === 'string').join(' ').toLocaleLowerCase().split(/[^\p{L}\p{N}]+/u);
  return terms.every(term => words.some(word => word.startsWith(term)));
}

function coordinate(value: unknown, limit: number): number | null {
  if (value === null || value === undefined || String(value).trim() === '') {
    return null;
  }
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
}

export function distanceKm(job: Pick<Job, 'latitude' | 'longitude'>, center: SearchLocation): number | null {
  const latitude = coordinate(job.latitude, 90);
  const longitude = coordinate(job.longitude, 180);
  if (latitude === null || longitude === null || coordinate(center.latitude, 90) === null || coordinate(center.longitude, 180) === null) {
    return null;
  }
  const radians = Math.PI / 180;
  const dLat = (latitude - center.latitude) * radians;
  const dLon = (longitude - center.longitude) * radians;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(center.latitude * radians) *
    Math.cos(latitude * radians) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(Math.min(1, a)), Math.sqrt(Math.max(0, 1 - a)));
}

export function filterJobs(jobs: Job[], center: SearchLocation, filters: JobFilters, now = Date.now()): Job[] {
  const days = {anytime: 0, day: 1, week: 7, month: 30}[filters.postedWithin];
  const minimum = filters.minBudget.trim() === '' ? 0 : Number(filters.minBudget);
  const maximum = filters.maxBudget.trim() === '' ? Infinity : Number(filters.maxBudget);
  return jobs.filter(job => {
    const distance = distanceKm(job, center);
    // Unknown locations cannot be claimed to be inside the selected radius.
    if (distance === null || distance > filters.radiusKm) {
      return false;
    }
    const budget = Number(job.budget);
    if (!Number.isFinite(budget) || budget < minimum || budget > maximum) {
      return false;
    }
    if (days > 0) {
      const rawDate = typeof job.created_at === 'string' ? job.created_at.replace(' ', 'T') : '';
      const postedAt = new Date(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(rawDate) ? `${rawDate}Z` : rawDate).getTime();
      if (!Number.isFinite(postedAt) || postedAt < now - days * 86400000 || postedAt > now) {
        return false;
      }
    }
    return true;
  });
}

export type JobFeedPage = {
  jobs: Job[];
  total_pages?: number;
  total?: number;
  per_page?: number;
};

export const JOB_SOURCE_CACHE_MS = 30000;
export type JobSourceCache = {jobs: Job[]; search: string; owner: string; fetchedAt: number};
type CacheOptions = {cache?: JobSourceCache | null; owner: string; force?: boolean};

function resultFromJobs(sourceJobs: Job[], center: SearchLocation, filters: JobFilters,
  page: number, limit: number, search: string) {
  const uniqueJobs = [...new Map(sourceJobs.map(job => [job.id, job])).values()]
    .filter(job => matchesSearch(job, search));
  const matches = filterJobs(uniqueJobs, center, filters);
  return {jobs: matches.slice((page - 1) * limit, page * limit), total: matches.length,
    total_pages: Math.ceil(matches.length / limit), sourceJobs: uniqueJobs, location: center};
}

// The live endpoint paginates but does not apply distance filters. Load every
// source page before filtering so a nearby job on a later page is not lost.
export async function loadJobSearch(
  fetchPage: (page: number) => Promise<JobFeedPage>,
  center: SearchLocation,
  filters: JobFilters,
  page: number,
  limit: number,
  search = '',
  cacheOptions?: CacheOptions,
) {
  const validationError = validateJobFilters(filters);
  if (validationError) throw new Error(validationError);
  const cache = cacheOptions?.cache;
  const now = Date.now();
  if (!cacheOptions?.force && cache && cacheOptions?.owner && cache.owner === cacheOptions.owner &&
      cache.search === search.trim() && cache.fetchedAt <= now && (now - cache.fetchedAt < JOB_SOURCE_CACHE_MS || page > 1)) {
    return {...resultFromJobs(cache.jobs, center, filters, page, limit, search), sourceCache: cache, cacheHit: true};
  }
  const first = await fetchPage(1);
  const sourceJobs = [...first.jobs];
  const pages = first.total_pages ?? Math.ceil((first.total ?? first.jobs.length) / (first.per_page ?? 100));
  for (let next = 2; next <= pages; next++) {
    const result = await fetchPage(next);
    sourceJobs.push(...result.jobs);
  }
  const result = resultFromJobs(sourceJobs, center, filters, page, limit, search);
  return {...result, sourceCache: {jobs: result.sourceJobs, search: search.trim(),
    owner: cacheOptions?.owner ?? '', fetchedAt: Date.now()}, cacheHit: false};
}
