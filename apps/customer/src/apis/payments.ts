import {
  initPaymentSheet,
  initStripe,
  PaymentSheetError,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import api from './api';
import URLs from '../config/urls';

export type PaymentState =
  | 'unpaid'
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export type JobPayment = {
  id?: number;
  job_id: number;
  transaction_id?: string | null;
  amount?: string;
  currency?: string;
  status: PaymentState;
  paid_at?: string | null;
};

type IntentResponse = {
  payment: JobPayment;
  publishable_key: string;
  stripe_account_id: string | null;
  stripe_customer_id: string | null;
  customer_session_client_secret: string | null;
  client_secret: string | null;
  already_paid: boolean;
};

export const getJobPayment = async (jobId: number): Promise<JobPayment> => {
  const response = await api.get(`${URLs.paymentStatus}/${jobId}`);
  return response.data.data.payment;
};

export const payForJob = async (jobId: number): Promise<JobPayment> => {
  const intentResponse = await api.post(URLs.paymentIntent, { job_id: jobId });
  const intent: IntentResponse = intentResponse.data.data;

  if (intent.already_paid || intent.payment.status === 'succeeded') {
    return intent.payment;
  }
  if (
    !intent.client_secret ||
    !intent.publishable_key ||
    !intent.payment.id
  ) {
    throw new Error('Payment could not be initialized.');
  }

  await initStripe({
    publishableKey: intent.publishable_key,
    stripeAccountId: intent.stripe_account_id ?? undefined,
  });
  const initialized = intent.stripe_customer_id && intent.customer_session_client_secret
    ? await initPaymentSheet({
        merchantDisplayName: 'Our Bezzie',
        paymentIntentClientSecret: intent.client_secret,
        customerId: intent.stripe_customer_id,
        customerSessionClientSecret: intent.customer_session_client_secret,
        returnURL: 'bezzie://stripe-redirect',
        allowsDelayedPaymentMethods: false,
      })
    : await initPaymentSheet({
        merchantDisplayName: 'Our Bezzie',
        paymentIntentClientSecret: intent.client_secret,
        returnURL: 'bezzie://stripe-redirect',
        allowsDelayedPaymentMethods: false,
      });
  if (initialized.error) {
    throw new Error(initialized.error.message);
  }

  const presented = await presentPaymentSheet();
  if (
    presented.didCancel ||
    presented.error?.code === PaymentSheetError.Canceled
  ) {
    try {
      await api.post(`${URLs.paymentCancel}/${intent.payment.id}/cancel`);
    } catch {
      // The backend/webhook remains the source of truth if cancellation races.
    }
    return { ...intent.payment, status: 'cancelled' };
  }
  if (presented.error) {
    try {
      return await verifyPayment(intent.payment.id);
    } catch {
      throw new Error(presented.error.message);
    }
  }

  return verifyPayment(intent.payment.id);
};

const verifyPayment = async (paymentId: number): Promise<JobPayment> => {
  const response = await api.post(
    `${URLs.paymentVerify}/${paymentId}/verify`,
  );
  return response.data.data.payment;
};
