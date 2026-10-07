import {
  initPaymentSheet,
  initStripe,
  PaymentSheetError,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import api from './api';
import URLs from '../config/urls';

export type SavedPaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
};

type SetupResponse = {
  publishable_key: string;
  customer_id: string;
  customer_session_client_secret: string;
  setup_intent_client_secret: string;
};

export const getPaymentMethods = async (): Promise<SavedPaymentMethod[]> => {
  const response = await api.get(URLs.paymentMethods);
  return response.data.data.payment_methods ?? [];
};

export const addPaymentMethod = async (): Promise<'added' | 'cancelled'> => {
  const response = await api.post(URLs.paymentMethodSetup);
  const setup: SetupResponse = response.data.data;

  await initStripe({ publishableKey: setup.publishable_key });
  const initialized = await initPaymentSheet({
    merchantDisplayName: 'Our Bezzie',
    customerId: setup.customer_id,
    customerSessionClientSecret: setup.customer_session_client_secret,
    setupIntentClientSecret: setup.setup_intent_client_secret,
    returnURL: 'bezzie://stripe-redirect',
    allowsDelayedPaymentMethods: false,
    primaryButtonLabel: 'Save card',
  });
  if (initialized.error) {
    throw new Error(initialized.error.message);
  }

  const presented = await presentPaymentSheet();
  if (
    presented.didCancel ||
    presented.error?.code === PaymentSheetError.Canceled
  ) {
    return 'cancelled';
  }
  if (presented.error) {
    throw new Error(presented.error.message);
  }

  return 'added';
};

export const setDefaultPaymentMethod = async (paymentMethodId: string) => {
  await api.post(`${URLs.paymentMethods}/${paymentMethodId}/default`);
};

export const deletePaymentMethod = async (paymentMethodId: string) => {
  await api.delete(`${URLs.paymentMethods}/${paymentMethodId}`);
};
