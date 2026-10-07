import api from './api';
import URLs from '../config/urls';

export type SupportRequestParams = {
  name: string;
  email: string;
  country_code?: string;
  phone: string;
  message: string;
};

export const submitSupportRequest = async (params: SupportRequestParams) => {
  const response = await api.post(URLs.supportRequests, params);
  return response.data.data;
};
