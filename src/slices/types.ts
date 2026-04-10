// import {AppUrl, LoyaltyPoints, VersionSetting} from './setting.types';

// import {AddressParam} from '../components';
// import {LatLng} from '../components/Address.types';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'failed';
export interface UserDetailsResponse {
  user: User
  token: string
  basic_info: boolean
  profile_pic: boolean
  proof: boolean
  is_verification_completed: boolean
}
export interface User {
  id: number
  name: string
  email: string
  country_code: string
  email_verified_at: any
  dob: string
  phone: string
  photo: any
  gender: any
  created_at: string
  updated_at: string
  user_type: string
  profile: any
  is_verified: string
  refrence: any
  refral_code: string
  latitude: any
  longitude: any
  skills: any
  experience: any
  street_address: any
  city: any
  state: any
  country: any
  pincode: any
  profile_image: any
  proof: any
}
