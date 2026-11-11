jest.mock('../src/utils/Location', () => ({}));
jest.mock('@react-native-community/geolocation', () => ({__esModule: true,
  default: {watchPosition: jest.fn(), clearWatch: jest.fn()}}));

import type {GeolocationResponse} from '@react-native-community/geolocation';
import Geolocation from '@react-native-community/geolocation';
import {clearRecentJobLocation, getFreshJobLocation, isFreshJobLocation, readFreshJobLocation, watchJobLocation} from '../src/utils/jobLocation';

const now = Date.parse('2026-11-10T13:00:00Z');
const position = (changes: Partial<GeolocationResponse> = {}): GeolocationResponse => ({
  coords: {latitude: 30.34, longitude: 76.39, accuracy: 20,
    altitude: null, altitudeAccuracy: null, heading: null, speed: null},
  timestamp: Date.now(), ...changes,
});
let success: (value: GeolocationResponse) => void;
let failure: (error: {code: number}) => void;

beforeEach(() => {
  clearRecentJobLocation();
  jest.useFakeTimers();
  (Geolocation.watchPosition as jest.Mock).mockImplementation((onSuccess, onError) => {
    success = onSuccess; failure = onError; return 7;
  });
});
afterEach(() => {jest.clearAllMocks(); jest.restoreAllMocks(); jest.useRealTimers();});

it('accepts a fresh and precise device fix', () => {
  expect(readFreshJobLocation(position({timestamp: now}), now)).toEqual({latitude: 30.34,
    longitude: 76.39, timestamp: now, accuracy: 20});
});

it.each([
  {timestamp: now - 30001}, {timestamp: now + 60000}, {accuracy: 2000},
  {latitude: NaN}, {longitude: 181}, {accuracy: -1}, {timestamp: NaN},
])('rejects an untrustworthy location: %p', changes => {
  expect(isFreshJobLocation({latitude: 30.34, longitude: 76.39,
    accuracy: 20, timestamp: now, ...changes}, now)).toBe(false);
});

it('allows a precise native fix from shortly before launch without changing its timestamp', async () => {
  const timestamp = Date.now() - 15000;
  const request = getFreshJobLocation();
  success(position({timestamp}));
  await expect(request).resolves.toMatchObject({timestamp, accuracy: 20});
  expect(Geolocation.watchPosition).toHaveBeenCalledWith(expect.any(Function), expect.any(Function),
    {enableHighAccuracy: true, maximumAge: 30000, interval: 1000, fastestInterval: 500, distanceFilter: 0});
  expect(Geolocation.clearWatch).toHaveBeenCalledWith(7);
});

it('ignores stale or imprecise initial updates and waits for an accurate current fix', async () => {
  const request = getFreshJobLocation();
  success(position({timestamp: Date.now() - 600000}));
  success(position({coords: {...position().coords, accuracy: 2000}}));
  expect(Geolocation.clearWatch).not.toHaveBeenCalled();
  success(position());
  await expect(request).resolves.toMatchObject({accuracy: 20});
});

it('times out and removes its own subscription if no acceptable fix arrives', async () => {
  const request = getFreshJobLocation();
  const rejection = request.catch(error => error);
  success(position({timestamp: Date.now() - 600000}));
  jest.advanceTimersByTime(20000);
  expect(await rejection).toMatchObject({message: expect.stringContaining('current GPS location')});
  expect(Geolocation.clearWatch).toHaveBeenCalledWith(7);
});

it('rejects permission denial immediately and cleans up', async () => {
  const request = getFreshJobLocation();
  failure({code: 1});
  await expect(request).rejects.toThrow('current GPS location');
  expect(Geolocation.clearWatch).toHaveBeenCalledWith(7);
});

it('waits through transient provider unavailability for a subsequent precise fix', async () => {
  const request = getFreshJobLocation();
  failure({code: 2});
  success(position());
  await expect(request).resolves.toMatchObject({accuracy: 20});
});

it('reuses a verified recent fix without subscribing again', async () => {
  const first = getFreshJobLocation(); success(position()); await first;
  await getFreshJobLocation();
  expect(Geolocation.watchPosition).toHaveBeenCalledTimes(1);
});

it('requests a new device fix after the verified fix expires', async () => {
  const first = getFreshJobLocation(); success(position()); await first;
  jest.advanceTimersByTime(31000);
  const second = getFreshJobLocation(); success(position()); await second;
  expect(Geolocation.watchPosition).toHaveBeenCalledTimes(2);
});

it('explicit refresh rejects pre-request fixes even when they are still recent', async () => {
  const first = getFreshJobLocation(); success(position()); await first;
  jest.advanceTimersByTime(1000);
  const second = getFreshJobLocation(true);
  success(position({timestamp: Date.now() - 500}));
  expect(Geolocation.clearWatch).toHaveBeenCalledTimes(1);
  success(position()); await second;
  expect(Geolocation.watchPosition).toHaveBeenLastCalledWith(expect.any(Function), expect.any(Function),
    {enableHighAccuracy: true, maximumAge: 0, interval: 1000, fastestInterval: 500, distanceFilter: 0});
  expect(Geolocation.clearWatch).toHaveBeenCalledTimes(2);
});

it('joins concurrent requests and shares a single device subscription', async () => {
  const first = getFreshJobLocation();
  const second = getFreshJobLocation();
  success(position());
  await expect(first).resolves.toEqual(await second);
  expect(Geolocation.watchPosition).toHaveBeenCalledTimes(1);
});

it('ignores callbacks arriving after timeout and allows another acquisition', async () => {
  const request = getFreshJobLocation();
  const rejection = request.catch(error => error);
  jest.advanceTimersByTime(20000);
  expect(await rejection).toMatchObject({message: expect.stringContaining('current GPS location')});
  success(position());
  const next = getFreshJobLocation(); success(position()); await next;
  expect(Geolocation.watchPosition).toHaveBeenCalledTimes(2);
});

it('cleans up a subscription even if the provider delivers synchronously', async () => {
  (Geolocation.watchPosition as jest.Mock).mockImplementationOnce(onSuccess => {
    onSuccess(position()); return 9;
  });
  await getFreshJobLocation();
  expect(Geolocation.clearWatch).toHaveBeenCalledWith(9);
});

it('keeps a recent fix while Filters is open and stops its own watch on close', async () => {
  const changed = jest.fn();
  const stop = watchJobLocation(changed); success(position());
  await getFreshJobLocation();
  expect(changed).toHaveBeenCalledTimes(1);
  expect(Geolocation.watchPosition).toHaveBeenCalledTimes(1);
  stop();
  expect(Geolocation.clearWatch).toHaveBeenCalledWith(7);
});

it('never caches an old or inaccurate update from the Filters watch', async () => {
  const changed = jest.fn();
  const stop = watchJobLocation(changed); success(position({timestamp: Date.now() - 600000}));
  const request = getFreshJobLocation(); success(position()); await request;
  expect(changed).not.toHaveBeenCalled();
  expect(Geolocation.watchPosition).toHaveBeenCalledTimes(2);
  stop();
});
