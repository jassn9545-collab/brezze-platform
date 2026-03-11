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
  id: number
  name: string
  email: string
  email_verified_at: any
  dob: Date
  phone: string
  photo: any
  gender: any
  created_at: string
  updated_at: string
  user_type: string
  alternate_phone: string
  nominee_name: string
  nominee_dob: string
  nominee_phone: string
  relation_with_nominee: string
  profile: any
  is_verified: boolean
  refrence: any
  refral_code: string
  country_code: string
  privacy_policy: string
  about_us: string
  term_and_condition: string
}
export interface Notification {
  id: number
  message: string
  type: string
  created_at: string
  time_ago: string
}
export interface ReferEarnData {
  total_earned: number
  total_withdrawn: number
  available_amount: number
  how_it_works: string[]
  withdrawls: WithDrawls[]
  referer: Referer[]
}
export interface Referer {
  id: number
  name: string
  phone: string
  profile: string
  created_at: string
}

export interface WithDrawls {
  id: number
  user_id: number
  amount: string
  type: string
  status: string
  created_at: string
  updated_at: string
  info: string
}


// Home
export interface HomeData {
  categories: Category[]
  products: Product[]
  gold_price: string
  silver_price: string
  image_base_url: string
  banner: Banner[]
}

export interface Category {
  id: number
  name: string
  slug: string
  photo: string
  created_at: string
  modify_at: string
}

export interface Product {
  id: number
  title: string
  slug: string
  type: string
  carat: string
  weight: string
  price: string
  description: string
  specification: string
  status: number
  created_at: string
  updated_at: string
  category_id: string
  is_featured: number
  first_image: FirstImage
  images: FirstImage[]
  quantity: number
  loading: boolean
  image: string
  liked: boolean
}

export interface FirstImage {
  id: number
  product_id: number
  image: string
  created_at: string
  updated_at: string
}

export interface Banner {
  id: number
  photo: string
  created_at: string
  modify_at: string
}

export interface BookedGoldDetail {
  total_gold: number
  current_gold_price: string
  total_gold_value_in_inr: string
}

export interface TransactionsResponse {
  status: string
  message: string
  data: Transaction[]
  pagination: Pagination
}

export interface Transaction {
  id: number
  user_id: string
  current_buy_rate: string
  amount: string
  gold_in_gm: number
  booking_date: string
  type: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface Pagination {
  total: number
  per_page: number
  total_pages: number
  current_page: number
}

//Order

export interface Order {
  order_id: string
  title: string
  carat: string
  weight: string
  price: string
  quantity: string
  image: string
  product_count: number
  piece_pair: number
  status: string
  datetime: string
}

// Wallet
export interface MyWalletData {
  gold_in_gm: number
  current_gold_price: number
  gold_amount: number
  refer_earn_balance: number
  sip_balance: number
  total_savings: number
}
export interface MyWithdrawalsData {
  id: number
  amount: number
  type: string
  created_at: string
  status: string
  type_label: string
}
