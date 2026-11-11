import Geolocation, {
  GeolocationResponse,
  GeolocationOptions,
} from '@react-native-community/geolocation';

import { LatLng } from '../components/Address.types';
import { Platform } from 'react-native';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'auto',
  enableBackgroundLocationUpdates: true,
  // In this library version, Android 'auto' keeps the GPS-only manager.
  // Prefer Google's fused provider; the native module falls back when unavailable.
  locationProvider: Platform.OS === 'android' ? 'playServices' : 'auto',
});

export const requestPermission = (
  success: () => void,
  failed?: (message: string) => void,
) => {
  Geolocation.requestAuthorization(success, error => {
    failed?.(error.message);
    toast.show(error.message, { type: 'danger' });
  });
};

export let currentPosition: LatLng;

export const getCurrentLoaction = (
  success: (position: GeolocationResponse) => void,
  failed?: (message: string) => void,
  options?: GeolocationOptions,
) => {
  const fetchLocation = (shouldAskEnableGPS = true) => {
    Geolocation.getCurrentPosition(
      position => {
        currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        success(position);
      },
      async error => {
        if (Platform.OS === 'android' && shouldAskEnableGPS) {
          const enabled = await _enableGPS();

          if (enabled) {
            setTimeout(() => {
              fetchLocation(false);
            }, 1000);
            return;
          }
        }

        failed?.(error.message);
        toast.show(error.message, { type: 'danger' });
      },
      {
        enableHighAccuracy: false,
        ...options,
      },
    );
  };

  fetchLocation();
};

const _enableGPS = async () => {
  try {
    const result = await promptForEnableLocationIfNeeded({
      interval: 10000,
    });

    console.log('GPS result:', result);
    return true;
  } catch (error: any) {
    if (error?.code === 'ERR00') {
      console.log('User cancelled');
    } else {
      console.log('Error:', error);
    }
    return false;
  }
};
