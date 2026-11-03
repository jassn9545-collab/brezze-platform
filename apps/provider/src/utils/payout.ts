import type {StripePayoutDashboard} from '../apis/stripe';

export const payoutAmountMinor = (amount: string): number | null => {
  if (!/^\d+(\.\d{1,2})?$/.test(amount)) return null;
  const [whole, fraction = ''] = amount.split('.');
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(minor) && minor > 0 ? minor : null;
};

export const payoutUnavailableReason = (
  dashboard: StripePayoutDashboard | null,
): string | null => {
  if (!dashboard) return 'Withdrawal information could not be loaded. Pull down to retry.';
  if (!dashboard.account.connected || dashboard.account.onboarding_required || !dashboard.account.payouts_enabled) {
    return 'Complete your Stripe account verification to withdraw funds.';
  }
  if (!dashboard.account.destination) return 'Add a bank account in Stripe to withdraw funds.';
  if (dashboard.wallet) {
    if (dashboard.wallet.available_minor <= 0) return 'No wallet funds are available. Pending withdrawals are already reserved.';
    if (dashboard.wallet.available_minor < dashboard.minimum_payout_minor) return 'Your available wallet balance is below the minimum withdrawal amount.';
    return null;
  }
  if (dashboard.balance.available_minor <= 0 && dashboard.balance.pending_minor <= 0 && dashboard.payment_mode?.platform_test_payments) {
    return 'Test payments are being collected by the platform and do not fund your withdrawal balance. Contact support to enable provider payments.';
  }
  if (dashboard.balance.available_minor <= 0) {
    return dashboard.balance.pending_minor > 0
      ? 'Your payment is pending settlement. You can withdraw once Stripe makes the funds available.'
      : 'There are no funds available to withdraw in Stripe. Check Manage for previous payouts, or contact support if a payment has not reached your Stripe account.';
  }
  if (dashboard.balance.available_minor < dashboard.minimum_payout_minor) {
    return 'Your available balance is below the minimum withdrawal amount.';
  }
  return null;
};
