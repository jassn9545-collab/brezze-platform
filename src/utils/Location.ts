import Geolocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';
import { LatLng } from '../components/Address.types';
import { Platform } from 'react-native';
import { promptForEnableLocationIfNeeded } from 'react-native-android-location-enabler';

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: 'auto',
  enableBackgroundLocationUpdates: false,
  locationProvider: 'auto',
});

export const requestPermission = (success: () => void) => {
  Geolocation.requestAuthorization(success, error => {
    toast.show(error.message, { type: 'danger' });
  });
};

export let currentPosition: LatLng;

export const getCurrentLoaction = (
  success: (position: GeolocationResponse) => void,
  failed?: (message: string) => void,
) => {
  Geolocation.getCurrentPosition(
    position => {
      currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      success(position);
    },
    error => {
      failed?.(error.message);
      toast.show(error.message, { type: 'danger' });
      if (Platform.OS === 'android') {
        _enableGPS();
      }
    },
    {
      timeout: 20000,
      enableHighAccuracy: false,
    },
  );
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

