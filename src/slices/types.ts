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
export interface Job {
  id: number
  title: string
  slug: string
  category: string
  description: string
  address: string
  city: any
  country: any
  pincode: any
  latitude: string
  longitude: string
  budget: string
  status: string
  created_at: string
  modify_id: string
  user_id: string
  job_applied: boolean
  bids: Bid[]
}
export interface Bid {
  id: number
  project_id: string
  user_id: number
  bid_amount: string
  freelancer_name: string
  freelancer_image: string
  date_time: string
  is_hired: boolean
  description: string
}
