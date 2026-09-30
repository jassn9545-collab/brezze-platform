import api from './api';
import URLs from '../config/urls';

export type ProviderCatalog = {
  id: number;
  heading: string;
  description: string;
  price: string;
  images: string[];
  image_urls: string[];
  created_at?: string;
};

export const getServiceCatalogs = async (): Promise<ProviderCatalog[]> => {
  const response = await api.get(URLs.catalogs);
  return response.data.data.catalogs ?? [];
};

export const createServiceCatalog = async (
  formData: FormData,
): Promise<ProviderCatalog> => {
  const response = await api.post(URLs.catalogs, formData, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return response.data.data.catalog;
};
