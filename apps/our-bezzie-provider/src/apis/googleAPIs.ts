import {
  AddressPrediction,
  LatLng,
  PlaceDetail,
  ReverseGeocodingResponse,
} from '../components/Address.types';
import axios, {AxiosError} from 'axios';

import BaseConfig from '../config';
import {debounce, throttle} from '../utils/util';

type NewAutocompleteResponse = {
  suggestions?: Array<{
    placePrediction?: {
      placeId?: string;
      text?: {text?: string};
      structuredFormat?: {
        mainText?: {text?: string};
        secondaryText?: {text?: string};
      };
    };
  }>;
};

type NewPlaceDetailsResponse = {
  formattedAddress?: string;
  location?: {latitude?: number; longitude?: number};
  addressComponents?: Array<{
    longText?: string;
    shortText?: string;
    types?: string[];
  }>;
};

export const search = async (keywords: string) => {
  const input = keywords.trim();
  if (input.length < 3) {
    return Promise.resolve([]);
  }
  try {
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:autocomplete',
      {input},
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': BaseConfig.GOOGLE_API_KEY,
          'X-Goog-FieldMask':
            'suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat',
        },
      },
    );
    const data = response.data as NewAutocompleteResponse;

    return (data.suggestions ?? []).flatMap(suggestion => {
      const prediction = suggestion.placePrediction;
      const placeId = prediction?.placeId;
      const description = prediction?.text?.text;
      if (!placeId || !description) {
        return [];
      }

      return [{
        place_id: placeId,
        description,
        reference: placeId,
        types: [],
        matched_substrings: [],
        terms: [],
        structured_formatting: {
          main_text: prediction.structuredFormat?.mainText?.text ?? description,
          main_text_matched_substrings: [],
          secondary_text: prediction.structuredFormat?.secondaryText?.text ?? '',
        },
      } as AddressPrediction];
    });
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
    const endpoint = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    const response = await axios.get(endpoint, {
      headers: {
        Accept: 'application/json',
        'X-Goog-Api-Key': BaseConfig.GOOGLE_API_KEY,
        'X-Goog-FieldMask': 'formattedAddress,location,addressComponents',
      },
    });
    const data = response.data as NewPlaceDetailsResponse;
    const latitude = data.location?.latitude;
    const longitude = data.location?.longitude;
    if (!data.formattedAddress || latitude == null || longitude == null) {
      throw Error('No result(s)');
    }

    return {
      formatted_address: data.formattedAddress,
      geometry: {
        location: {lat: latitude, lng: longitude},
      },
      address_components: (data.addressComponents ?? []).map(component => ({
        long_name: component.longText ?? '',
        short_name: component.shortText ?? component.longText ?? '',
        types: component.types ?? [],
      })),
    } as PlaceDetail;
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
