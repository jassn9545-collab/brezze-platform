import {
  Dimensions,
  ImageProps,
  ImageURISource,
  PermissionsAndroid,
  Platform,
} from 'react-native';

import { LatLng } from '../components/Address.types';
import URLs from '../config/urls';
import { colors, images } from '../theme';

export const hitSlop = { left: 10, top: 5, right: 10, bottom: 5 };

export const { width: ScreenWidth, height: ScreenHeight } =
  Dimensions.get('window');

export const LATITUDE_DELTA = 0.015;
export const LONGITUDE_DELTA = 0.0121;

// export function delay(ms: number) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

export function delay(ms: number) {
  return new Promise<void>(resolve => setTimeout(() => resolve(), ms));
}

type AsyncImageProps = {
  source: ImageProps['source'];
  defaultSource: ImageProps['defaultSource'];
};

export function parseSource(
  uri?: string | String,
  defaultSource: ImageURISource | number = images.user,
): AsyncImageProps {
  return {
    source: !(uri && uri !== '') ? defaultSource : { uri: uri.toString() },
    defaultSource: defaultSource,
  };
}

type DebouncedFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T> | void>;

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  millisecond: number,
): DebouncedFunction<T> {
  // let timeoutId: NodeJS.Timeout;
  let timeoutId: ReturnType<typeof setTimeout>;

  return async function debounced(
    ...args: Parameters<T>
  ): Promise<void | ReturnType<T>> {
    clearTimeout(timeoutId);

    return new Promise<void | ReturnType<T>>(resolve => {
      timeoutId = setTimeout(async () => {
        resolve(func(...args));
      }, millisecond);
    });
  };
}

export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let lastFunc: ReturnType<typeof setTimeout> | null = null;
  let lastRan: number | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (lastRan === null || now - lastRan >= wait) {
      func(...args);
      lastRan = now;
    } else {
      if (lastFunc) {
        clearTimeout(lastFunc);
      }
      lastFunc = setTimeout(() => {
        if (now - lastRan! >= wait) {
          func(...args);
          lastRan = now;
        }
      }, wait - (now - lastRan));
    }
  };
};

export function getAngleDegrees(first: LatLng, last: LatLng, force360 = true) {
  let deltaX = first.lat - last.lat;
  let deltaY = first.lng - last.lng;
  let radians = Math.atan2(deltaY, deltaX);
  let degrees = (radians * 180) / Math.PI;
  if (force360) {
    degrees = (degrees + 360) % 360;
  }
  return degrees;
}

export const titleCase = (text: string) =>
  text.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase(),
  );

export const cameraPermission = () => {
  return new Promise<boolean>((resolve, reject) => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA).then(
        result => {
          if (result === PermissionsAndroid.RESULTS.GRANTED) {
            resolve(true);
          } else {
            reject(false);
          }
        },
      );
    } else {
      resolve(true);
    }
  });
};

export const includeInviteURL = (url: string) => {
  return URLs.inviteUrls.some(item => url.includes(item));
};

export const handleInviteURL = (url: string | null) => {
  if (url && includeInviteURL(url)) {
    let userId = url.split('?code=').at(-1);
    return userId;
  }
};

export const secondFormat = (value: number): string => {
  if (value < 60) {
    return '< 1 min';
  }

  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);

  const hourString = hours > 0 ? `${hours} h` : '';
  const minuteString =
    minutes > 0 ? `${minutes} ${minutes > 1 ? 'mins' : 'min'}` : '';

  return [hourString, minuteString].filter(Boolean).join(' ').trim();
};

export const formatTime = (seconds?: number) => {
  if (!seconds) {
    return { formattedTime: '--:--', isNegative: false };
  }
  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const secs = absSeconds % 60;

  let formattedTime;
  if (hours > 0) {
    formattedTime = `${String(hours).padStart(2, '0')}:${String(
      minutes,
    ).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else {
    formattedTime = `${String(minutes).padStart(2, '0')}:${String(
      secs,
    ).padStart(2, '0')}`;
  }

  return { formattedTime, isNegative };
};

export const HITSLOP = {
  SMALL: { top: 5, bottom: 5, left: 5, right: 5 },
  MEDIUM: { top: 10, bottom: 10, left: 10, right: 10 },
  LARGE: { top: 15, bottom: 15, left: 15, right: 15 },
};

export const getStatusStyle = (type: string) => {
  switch (type) {
    case 'active':
      return {
        backgroundColor: colors.palette.primaryDimmed,
        color: colors.primary,
      };
    case 'inactive':
      return {
        backgroundColor: colors.palette.centerColor,
        color: colors.error,
      };
    case 'completed':
      return {
        backgroundColor: colors.palette.offGreen,
        color: colors.palette.green,
      };
    case 'in progress':
      return {
        backgroundColor: colors.palette.yellowLight,
        color: colors.palette.yellow,
      };
    default:
      return {
        backgroundColor: colors.palette.borderColor,
        color: colors.palette.black,
      };
  }
};
