import {payoutAmountMinor, payoutUnavailableReason} from '../src/utils/payout';
import type {StripePayoutDashboard} from '../src/apis/stripe';

const wallet = (): StripePayoutDashboard => ({
  account: {connected: true, payouts_enabled: true, details_submitted: true,
    onboarding_required: false, payout_schedule: 'manual',
    destination: {type: 'bank_account', bank_name: 'Test', last4: '1234', currency: 'aud'}},
  balance: {currency: 'aud', available_minor: 35460, available: '354.60', pending_minor: 0, pending: '0.00'},
  minimum_payout_minor: 1000, total_earnings: '354.60', payouts: [],
});

it('converts withdrawal amounts to exact minor units and rejects invalid precision', () => {
  expect(payoutAmountMinor('354.60')).toBe(35460);
  expect(payoutAmountMinor('10.1')).toBe(1010);
  for (const amount of ['', '0', '-10', '1.001', 'Infinity', '1..2']) {
    expect(payoutAmountMinor(amount)).toBeNull();
  }
});

it('allows a verified provider with settled funds and explains a zero balance', () => {
  const dashboard = wallet();
  expect(payoutUnavailableReason(dashboard)).toBeNull();
  dashboard.balance.available_minor = 0;
  expect(payoutUnavailableReason(dashboard)).toContain('no funds available');
  dashboard.balance.pending_minor = 35460;
  expect(payoutUnavailableReason(dashboard)).toContain('pending settlement');
});

it('explains platform-only test payments even when lifetime earnings are positive', () => {
  const dashboard = wallet();
  dashboard.payment_mode = {test_mode: true, platform_test_payments: true};
  expect(payoutUnavailableReason(dashboard)).toBeNull();
  dashboard.balance.available_minor = 0;
  expect(payoutUnavailableReason(dashboard)).toContain('collected by the platform');
});

it('distinguishes missing data, verification, bank setup and the minimum', () => {
  expect(payoutUnavailableReason(null)).toContain('could not be loaded');
  const dashboard = wallet();
  dashboard.account.onboarding_required = true;
  expect(payoutUnavailableReason(dashboard)).toContain('verification');
  dashboard.account.onboarding_required = false;
  dashboard.account.destination = null;
  expect(payoutUnavailableReason(dashboard)).toContain('Add a bank account');
  dashboard.account.destination = wallet().account.destination;
  dashboard.balance.available_minor = 999;
  expect(payoutUnavailableReason(dashboard)).toContain('below the minimum');
});

it('allows wallet withdrawals while Stripe funds are pending settlement', () => {
  const dashboard = wallet();
  dashboard.balance.available_minor = 0;
  dashboard.balance.pending_minor = 4590;
  dashboard.wallet = {currency: 'aud', available_minor: 4590, available: '45.90', reserved_minor: 0, reserved: '0.00', withdrawn_minor: 0, withdrawn: '0.00'};
  expect(payoutUnavailableReason(dashboard)).toBeNull();
  dashboard.wallet.available_minor = 590;
  expect(payoutUnavailableReason(dashboard)).toContain('below the minimum');
  dashboard.wallet.available_minor = 0;
  dashboard.wallet.reserved_minor = 4590;
  expect(payoutUnavailableReason(dashboard)).toContain('already reserved');
});
