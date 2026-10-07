import api from './api';
import URLs from '../config/urls';

export type StripeAccountStatus = {
  connected: boolean;
  stripe_account_id: string | null;
  details_submitted: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  ready_for_payments: boolean;
  onboarding_required: boolean;
  requirements: {
    currently_due: string[];
    eventually_due: string[];
    disabled_reason: string | null;
  };
};

export const getStripeAccountStatus = async (): Promise<StripeAccountStatus> => {
  const response = await api.get(URLs.stripeAccountStatus);
  return response.data.data;
};

export const createStripeOnboardingLink = async (): Promise<string> => {
  const response = await api.post(URLs.stripeOnboardingLink);
  return response.data.data.url;
};
