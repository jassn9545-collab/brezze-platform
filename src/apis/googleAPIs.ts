import {
  GoogleAddressAutocompleteResult,
  LatLng,
  PlaceDetailResponse,
  ReverseGeocodingResponse,
} from '../components/Address.types';
import axios, {AxiosError} from 'axios';

import BaseConfig from '../config';
import {debounce, throttle} from '../utils/util';

type Response = GoogleAddressAutocompleteResult;

export const search = async (keywords: string) => {
  if (keywords === '') {
    return Promise.resolve([]);
  }
  try {
    const endpoint = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${keywords}&key=${BaseConfig.GOOGLE_API_KEY}`;
    const response = await axios.get(endpoint, {
      headers: {Accept: 'application/json'},
    });
    const data = response.data as Response;

    if (data.status === 'OK') {
      return data.predictions;
    } else {
      return [];
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    throw Error(axiosError.message);
  }
};

export const debouncedSearch = debounce(search, 1000);

export const reverseGeocoding = async (location: LatLng) => {
  try {
    const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${BaseConfig.GOOGLE_API_KEY}`;

    const response = await axios.get(endpoint, {
      headers: {Accept: 'application/json'},
    });
    const data = response.data as ReverseGeocodingResponse;

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return result;
    } else {
      throw Error('No result(s)');
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.log('Error getting location:', error);
    throw Error(axiosError.message);
  }
};

export const reverseAddress = async (address: String) => {
  try {
    const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${BaseConfig.GOOGLE_API_KEY}`;

    const response = await axios.get(endpoint, {
      headers: {Accept: 'application/json'},
    });
    const data = response.data as ReverseGeocodingResponse;

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return result;
    } else {
      throw Error('No result(s)');
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.log('Error getting location:', error);
    throw Error(axiosError.message);
  }
};

export const getPlaceDetails = async (placeId: string) => {
  try {
    const endpoint = `https://maps.googleapis.com/maps/api/place/details/json?fields=formatted_address,geometry&placeid=${placeId}&key=${BaseConfig.GOOGLE_API_KEY}`;
    const response = await axios.get(endpoint, {
      headers: {Accept: 'application/json'},
    });
    const data = response.data as PlaceDetailResponse;
    if (data.status === 'OK') {
      const result = data.result;
      return result;
    } else {
      throw Error('No result(s)');
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error('Error getting location:', error);
    throw Error(axiosError.message);
  }
};

export interface DistanceResponse {
  destination_addresses: string[];
  origin_addresses: string[];
  rows: {elements: Element[]}[];
  status: string;
}

export interface Element {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  status: string;
}

export const getDistance = async (
  origin: LatLng,
  destination: LatLng,
  callback: (result: Element) => void,
) => {
  try {
    const endpoint = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${origin.lat},${origin.lng}&origins=${destination.lat},${destination.lng}&units=km&key=${BaseConfig.GOOGLE_API_KEY}`;
    const response = await axios.get(endpoint, {
      headers: {Accept: 'application/json'},
    });
    const data = response.data as DistanceResponse;

    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      callback(data.rows[0].elements[0]);
    } else {
      console.warn('Distance: No result(s)');
    }
  } catch (error: unknown) {
    console.warn('Error getting distance:', error);
  }
};

export const throttleGetDistance = throttle(getDistance, 30000);
