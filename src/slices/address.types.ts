import {LatLng} from '../components/Address.types';

export type AddressType = 'none' | 'pick' | 'drop';

export type AddressDataType = {
  addressLocation: AddressLocation;
  area: string;
  houseNo: string;
  landmark: string;
  address: string;
  addressType: AddressType;
  isAirport?: boolean;
  default: boolean;
  _id: string;
  user: string;
  date_created_utc: string;
};

export interface AddressLocation {
  type: string;
  coordinates: number[];
}

export interface AddAddressParams {
  _id?: string; // Required when edit
  address?: string;
  addressLocation: Partial<LatLng>;
  houseNo?: string;
  area?: string;
  landmark?: string;
  isAirport?: boolean;
  addressType?: AddressType;
  default?: boolean;
}

export type AddressData = AddressDataType[];
