import api from './api';

export type ServiceCatalog = {
  id: number;
  heading: string;
  description: string;
  price: string;
  images: string[];
  image_urls: string[];
  created_at?: string | null;
};

export type CatalogProvider = {
  id: number;
  name: string;
  profile_image: string | null;
};

export type FreelancerCatalogsResponse = {
  provider: CatalogProvider;
  catalogs: ServiceCatalog[];
};

export const getFreelancerCatalogs = async (
  providerId: number,
): Promise<FreelancerCatalogsResponse> => {
  const response = await api.get('/client/freelancer-catalogs/' + providerId, {
    timeout: 10000,
  });
  return response.data.data;
};
