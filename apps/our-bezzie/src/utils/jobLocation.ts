import Geolocation, {GeolocationResponse} from '@react-native-community/geolocation';
import './Location';
import type {SearchLocation} from './jobFilters';

export type JobLocation = SearchLocation & {timestamp: number; accuracy: number};
export const MAX_JOB_LOCATION_AGE_MS = 30000;
let recentLocation: JobLocation | null = null;
let pendingLocation: Promise<JobLocation> | null = null;

export function clearRecentJobLocation() {
  recentLocation = null;
}

export function isFreshJobLocation(location: JobLocation, now = Date.now()): boolean {
  return Number.isFinite(location.latitude) && Math.abs(location.latitude) <= 90 &&
    Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180 &&
    Number.isFinite(location.timestamp) && now - location.timestamp <= MAX_JOB_LOCATION_AGE_MS &&
    location.timestamp <= now + 5000 && Number.isFinite(location.accuracy) &&
    location.accuracy >= 0 && location.accuracy <= 500;
}

export function readFreshJobLocation(position: GeolocationResponse, now = Date.now()): JobLocation {
  const location = {...position.coords, timestamp: position.timestamp};
  if (!isFreshJobLocation(location, now)) {
    throw new Error('Could not confirm a fresh, precise location. Enable precise location and GPS, then try again.');
  }
  return {latitude: location.latitude, longitude: location.longitude,
    timestamp: location.timestamp, accuracy: location.accuracy};
}

export function getFreshJobLocation(force = false): Promise<JobLocation> {
  if (!force && recentLocation && isFreshJobLocation(recentLocation)) {
    return Promise.resolve(recentLocation);
  }
  if (pendingLocation) return pendingLocation;
  const startedAt = Date.now();
  const request = new Promise<JobLocation>((resolve, reject) => {
    let watchId: number | undefined;
    let settled = false;
    const finish = (location?: JobLocation) => {
      if (settled) return;
      settled = true;
      clearTimeout(deadline);
      if (watchId !== undefined) Geolocation.clearWatch(watchId);
      if (location) {
        recentLocation = location;
        resolve(location);
      } else {
        reject(new Error('Could not get your current GPS location. Check location access and try again.'));
      }
    };
    // Own the deadline and subscription: the fused provider's single-position
    // implementation does not enforce its timeout option in this library version.
    const deadline = setTimeout(() => finish(), 20000);
    try {
      watchId = Geolocation.watchPosition(position => {
        try {
          const location = readFreshJobLocation(position);
          if (!force || location.timestamp >= startedAt) finish(location);
        } catch {
          // Cached/approximate first updates may be followed by a precise fix.
        }
      }, error => {
        if (error.code === 1) finish(); // permission denied
        // Availability may be false while a first fix is still being acquired.
      }, {enableHighAccuracy: true, maximumAge: force ? 0 : MAX_JOB_LOCATION_AGE_MS,
        interval: 1000, fastestInterval: 500, distanceFilter: 0});
      if (settled) Geolocation.clearWatch(watchId);
    } catch {
      finish();
    }
  });
  pendingLocation = request.then(location => {
    pendingLocation = null;
    return location;
  }, error => {
    pendingLocation = null;
    throw error;
  });
  return pendingLocation;
}

// Only the focused Filters screen subscribes, and stops this watch in the
// background. A valid recent fix makes Apply quick without accepting old GPS.
export function watchJobLocation(onLocation: (location: JobLocation) => void): () => void {
  const id = Geolocation.watchPosition(position => {
    try {
      recentLocation = readFreshJobLocation(position);
      onLocation(recentLocation);
    } catch {
      // Ignore inaccurate/stale updates; Apply will request a valid fix if needed.
    }
  }, () => undefined, {enableHighAccuracy: true, maximumAge: 0,
    interval: 10000, fastestInterval: 5000, distanceFilter: 0});
  return () => Geolocation.clearWatch(id);
}
