import Geolocation, {
  GeolocationResponse,
} from '@react-native-community/geolocation';

import { LatLng } from '../components/Address.types';

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: 'auto',
  enableBackgroundLocationUpdates: false,
  locationProvider: 'auto',
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
    },
    {
      timeout: 20000,
      enableHighAccuracy: false,
    },
  );
};
