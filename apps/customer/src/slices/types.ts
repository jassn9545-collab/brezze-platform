export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'failed';

export interface UserDetailsResponse {
  user: User
  token?: string
  basic_info?: boolean
  profile_pic?: boolean
  proof?: boolean
  is_verification_completed?: boolean
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
  alternate_phone: any
  relation_with_nominee: any
  profile: any
  is_verified: number
  refrence: any
  refral_code: string
  latitude: number
  longitude: number
  skills: any
  experience: any
  street_address: string
  city: any
  state: string
  country: any
  pincode: string
  profile_image: string
  profile_title: any
  profile_description: any
  avg_rating: number
  total_jobs: number
  last3_jobs: Job[]
  reviews: any[]
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
  bids_count: number
}


export interface UserProof {
  id: number;
  user_id: string;
  proof_type: string;
  id_number: string;
  expiry_date: string;
  front_image: string;
  back_image: string;
  created_at: string;
  updated_at: string;
  is_verified: number;
}

export interface ClientProfile {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  dob: string | null;
  phone: string;
  photo: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
  user_type: string;

  alternate_phone: string | null;
  relation_with_nominee: string | null;

  is_verified: string;
  refrence: string | null;
  refral_code: string | null;

  latitude: string | null;
  longitude: string | null;

  skills: string;
  experience: string | null;

  street_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  pincode: string | null;

  profile_image: string | null;
  profile_title: string | null;
  profile_description: string | null;

  user_proof: UserProof | null;

  job_success_score: number;
  total_jobs: number;
  total_earnings: number;

  is_top_rated: boolean;
  categories: string[];
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
  work_description: string
}
