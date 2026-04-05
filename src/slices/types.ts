// import {AppUrl, LoyaltyPoints, VersionSetting} from './setting.types';

// import {AddressParam} from '../components';
// import {LatLng} from '../components/Address.types';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'failed';


export interface UserDetailsResponse {
  status: string
  message: string
  data: UserData
  token: string
}

export interface UserData {
  user: User
  token: string
}

export interface User {
  name: string
  email: string
  phone: string
  user_type: string
  is_verified: boolean
  refral_code: string
  updated_at: string
  created_at: string
  id: number
  basic_info: number
  profile_pic: number
  proof: number
  country_code: string
}