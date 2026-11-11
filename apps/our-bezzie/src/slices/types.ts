export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'failed';

export interface ProfileReview {
  id: number;
  given_by: number;
  given_to: number;
  job_id: number;
  star: number;
  review: string | null;
  review_to: 'freelancer' | 'client';
  created_at: string;
  reviewer: {
    id: number;
    name: string;
    profile_image: string | null;
  } | null;
  job: {
    id: number;
    title: string;
  } | null;
}
export interface UserDetailsResponse {
  user: User;
  token?: string;
  basic_info?: boolean;
  profile_pic?: boolean;
  proof?: boolean;
  is_verification_completed?: boolean;
}
export interface User {
  id: number;
  name: string;
  email: string;
  country_code: string;
  email_verified_at: any;
  profile_title: string;
  profile_description: string;
  dob: string;
  phone: string;
  photo: any;
  gender: any;
  created_at: string;
  updated_at: string;
  user_type: string;
  profile: any;
  is_verified: string;
  refrence: any;
  refral_code: string;
  latitude: number;
  longitude: number;
  skills?: string;
  categories: string[];
  experience: any;
  street_address: any;
  city: any;
  state: any;
  country: any;
  pincode: any;
  profile_image: any;
  proof: any;
  is_top_rated: boolean;
  total_earnings: number;
  total_jobs: number;
  job_success_score: number;
  avg_rating: number;
  review_count: number;
  reviews: ProfileReview[];
}

export interface Job {
  id: number;
  title: string;
  base_url: string;
  images: Image[];
  slug: string;
  category: string;
  description: string;
  address: string;
  city?: string;
  country?: string;
  pincode?: string;
  latitude: string;
  longitude: string;
  budget: string;
  status: string;
  created_at: string;
  modify_id: string;
  user_id: string;
  job_applied: boolean;
  saved: boolean;
  client_name: string;
  client_profile_pic: string;
  payment_status?: 'unpaid' | 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  provider_earnings?: string | null;
  transaction_id?: string | null;
  paid_at?: string | null;
  has_reviewed?: boolean;
  can_review?: boolean;
  client?: {
    name: string;
    profile_image: string | null;
  };
}

export interface Image {
  image: string;
}
