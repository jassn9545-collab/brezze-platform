import api from './api';
import URLs, {stripeOnboardingCallbacks} from '../config/urls';

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
  const response = await api.post(URLs.stripeOnboardingLink, stripeOnboardingCallbacks);
  return response.data.data.url;
};

export type StripePayout = {
  id: number;
  stripe_payout_id: string | null;
  amount: string;
  currency: string;
  status: 'awaiting_settlement' | 'pending' | 'processing' | 'in_transit' | 'paid' | 'failed' | 'canceled';
  method: string;
  arrival_at: string | null;
  failure_message: string | null;
  created_at: string | null;
};

export type StripePayoutDashboard = {
  wallet_sync_supported?: boolean;
  account: {
    connected: boolean;
    payouts_enabled: boolean;
    details_submitted: boolean;
    onboarding_required: boolean;
    payout_schedule: string | null;
    destination: {
      type: string | null;
      bank_name: string | null;
      last4: string | null;
      currency: string | null;
    } | null;
  };
  balance: {
    currency: string;
    available_minor: number;
    available: string;
    pending_minor: number;
    pending: string;
  };
  minimum_payout_minor: number;
  wallet?: {
    currency: string;
    available_minor: number;
    available: string;
    reserved_minor: number;
    reserved: string;
    withdrawn_minor: number;
    withdrawn: string;
  };
  total_earnings: string;
  payment_mode?: {
    test_mode: boolean;
    platform_test_payments: boolean;
  };
  payouts: StripePayout[];
};

export const getStripePayoutDashboard = async (): Promise<StripePayoutDashboard> => {
  const response = await api.get(URLs.payouts);
  if (response.data.data.wallet_sync_supported) {
    const synced = await api.post(`${URLs.payouts}/sync`);
    return synced.data.data;
  }
  return response.data.data;
};

export const createStripePayout = async (
  amount: string,
  idempotencyKey: string,
): Promise<StripePayout> => {
  const response = await api.post(URLs.payouts, {
    amount,
    idempotency_key: idempotencyKey,
  });
  return response.data.data.payout;
};

export const createStripeDashboardLink = async (): Promise<string> => {
  const response = await api.post(URLs.payoutDashboardLink);
  return response.data.data.url;
};
