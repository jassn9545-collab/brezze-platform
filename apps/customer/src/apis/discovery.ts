import api from './api';

export type DiscoveryCategory = {
  id: number;
  name: string;
  slug: string;
  photo: string;
  image_url: string;
};

export type DiscoveryProfessional = {
  id: number;
  name: string;
  profile_title: string | null;
  profile_description: string | null;
  profile_image: string | null;
  location: string;
  experience: string | null;
  is_verified: boolean;
  is_featured: boolean;
  is_top_rated: boolean;
  rating: number;
  review_count: number;
  total_jobs: number;
  job_success_score: number;
  catalog_count: number;
  starting_price: string | null;
  categories: Array<{ id: number; name: string; slug: string }>;
};

export type DiscoveryService = {
  id: number;
  provider_id: number;
  provider_name: string;
  provider_title: string | null;
  provider_image: string | null;
  provider_rating: number;
  review_count: number;
  heading: string;
  description: string;
  price: string;
  images: string[];
  image_urls: string[];
  created_at: string | null;
};

export type DiscoveryResponse = {
  categories: DiscoveryCategory[];
  featured_professionals: DiscoveryProfessional[];
  professionals: DiscoveryProfessional[];
  services: DiscoveryService[];
};

export const getDiscovery = async (params?: {
  categoryId?: number;
  search?: string;
}): Promise<DiscoveryResponse> => {
  const response = await api.get('/client/discovery', {
    params: {
      category_id: params?.categoryId,
      search: params?.search || undefined,
    },
    timeout: 15000,
  });

  return response.data.data;
};
