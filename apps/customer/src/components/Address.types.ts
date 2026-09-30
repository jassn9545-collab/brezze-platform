export interface GoogleAddressAutocompleteResult {
  predictions: AddressPrediction[];
  status: string;
  error_message?: string;
}

export interface GoogleAddress {
  description?: string;
  formatted_address?: string;
  place_id: string;
  types: string[];
}

export interface AddressPrediction extends GoogleAddress {
  matched_substrings: MatchedSubstring[];
  reference: string;
  structured_formatting: StructuredFormatting;
  terms: AddressTerm[];
}

export interface MatchedSubstring {
  length: number;
  offset: number;
}

export interface StructuredFormatting {
  main_text: string;
  main_text_matched_substrings: MainTextMatchedSubstring[];
  secondary_text: string;
}

export interface MainTextMatchedSubstring {
  length: number;
  offset: number;
}

export interface AddressTerm {
  offset: number;
  value: string;
}

export interface ReverseGeocodingResponse {
  plus_code: PlusCode;
  results: GeocodingResult[];
  status: string;
  error_message?: string;
}

export interface PlusCode {
  compound_code: string;
  global_code: string;
}

export interface GeocodingResult extends GoogleAddress {
  address_components: AddressComponent[];
  geometry: Geometry;
  plus_code?: PlusCode;
}

export interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

export interface Geometry {
  location: LatLng;
  location_type?: string;
  viewport: Directions;
  bounds?: Directions;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Directions {
  northeast: LatLng;
  southwest: LatLng;
}

export interface PlaceDetailResponse {
  result: PlaceDetail;
  status: string;
  error_message?: string;
  address_components: AddressComponent[];
}

export interface PlaceDetail {
  formatted_address: string;
  geometry: Geometry;
  address_components: AddressComponent[];
}
