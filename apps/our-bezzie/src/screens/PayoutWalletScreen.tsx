import {BackButtom, Screen, Text} from '../components';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {FC, useCallback, useRef, useState} from 'react';
import {AppStackScreenProps} from '../navigators';
import {Currency} from '../config/defaults';
import {colors, spacing} from '../theme';
import {useFocusEffect} from '@react-navigation/native';
import api from '../apis/api';
import URLs from '../config/urls';
import {
  createStripeDashboardLink,
  createStripePayout,
  getStripePayoutDashboard,
  StripePayoutDashboard,
} from '../apis/stripe';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {payoutAmountMinor, payoutUnavailableReason} from '../utils/payout';

type Props = AppStackScreenProps<'Wallet'>;

type ProviderPayment = {
  id: number;
  job_id: number;
  job_title?: string | null;
  customer_id: number;
  client_name?: string | null;
  transaction_id?: string | null;
  provider_earnings: string;
  currency: string;
  status: string;
  paid_at?: string | null;
  created_at?: string | null;
};

export const PayoutWalletScreen: FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [payments, setPayments] = useState<ProviderPayment[]>([]);
  const [dashboard, setDashboard] = useState<StripePayoutDashboard | null>(null);
  const [totalEarnings, setTotalEarnings] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openingStripe, setOpeningStripe] = useState(false);
  const requestKey = useRef<string | null>(null);
  const refreshingWallet = useRef(false);

  const loadWallet = useCallback(async () => {
    if (refreshingWallet.current) return;
    refreshingWallet.current = true;
    setLoading(true);
    try {
      const response = await api.post(URLs.paymentHistory, {page: 1, per_page: 50});
      setPayments(response.data.data.payments ?? []);
      setTotalEarnings(response.data.data.total_earnings ?? '0.00');
    } catch {
      // Shared API handling displays the server error.
    }

    try {
      const payoutDashboard = await getStripePayoutDashboard();
      setDashboard(payoutDashboard);
      if (payoutDashboard.total_earnings != null) {
        setTotalEarnings(payoutDashboard.total_earnings);
      }
    } catch {
      setDashboard(null);
      // Payment history remains usable if Stripe is temporarily unavailable.
    } finally {
      refreshingWallet.current = false;
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWallet();
    }, [loadWallet]),
  );

  const currency = (dashboard?.balance.currency ?? Currency.code).toUpperCase();
  const available = dashboard?.wallet ?? dashboard?.balance;
  const minimum = (dashboard?.minimum_payout_minor ?? 0) / 100;
  const numericAmount = Number(amount);
  const amountMinor = payoutAmountMinor(amount);
  const unavailableReason = payoutUnavailableReason(dashboard);
  const amountError = amount && !unavailableReason
    ? amountMinor === null
      ? 'Enter a positive amount with no more than two decimal places.'
      : amountMinor < (dashboard?.minimum_payout_minor ?? 0)
        ? `Minimum withdrawal is ${currency} ${minimum.toFixed(2)}.`
        : amountMinor > (available?.available_minor ?? 0)
          ? 'This amount exceeds your available balance.'
          : null
    : null;
  const canWithdraw = Boolean(
    !loading && dashboard && !unavailableReason && amountMinor !== null &&
      amountMinor >= dashboard.minimum_payout_minor &&
      amountMinor <= (available?.available_minor ?? 0),
  );

  const updateAmount = (value: string) => {
    setAmount(value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1'));
    requestKey.current = null;
  };

  const submitPayout = async () => {
    if (!canWithdraw || submitting) return;
    setSubmitting(true);
    requestKey.current ??= `payout-${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    try {
      const payout = await createStripePayout(numericAmount.toFixed(2), requestKey.current);
      toast.show(payout.status === 'failed' ? 'Withdrawal failed. Your wallet funds were restored.' : payout.status === 'awaiting_settlement' ? 'Withdrawal requested. Your amount is reserved until settlement.' : 'Withdrawal submitted to Stripe.', {type: payout.status === 'failed' ? 'danger' : 'success'});
      requestKey.current = null;
      setAmount('');
      await loadWallet();
    } catch {
      // Keep the request key so retrying cannot create a duplicate payout.
    } finally {
      setSubmitting(false);
    }
  };

  const confirmPayout = () => {
    if (!canWithdraw) return;
    Alert.alert(
      'Confirm withdrawal',
      `Request ${currency} ${numericAmount.toFixed(2)} to your bank? This amount will be deducted from your wallet and reserved until the bank payout completes.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Withdraw', onPress: submitPayout},
      ],
    );
  };

  const openStripe = async () => {
    if (openingStripe) return;
    if (!dashboard?.account.connected || dashboard.account.onboarding_required) {
      navigation.navigate('PaymentAccount');
      return;
    }

    setOpeningStripe(true);
    try {
      await Linking.openURL(await createStripeDashboardLink());
    } catch (error: any) {
      toast.show(error?.message ?? 'Unable to open Stripe.', {type: 'danger'});
    } finally {
      setOpeningStripe(false);
    }
  };

  return (
    <Screen preset="fixed" safeAreaEdges={['top']} contentContainerStyle={styles.container}>
      <BackButtom headingTx="payment.wallet" />
      <FlatList
        data={payments}
        keyExtractor={item => item.id.toString()}
        style={styles.flatList}
        contentContainerStyle={[styles.list, {paddingBottom: insets.bottom + spacing.xl}]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshing={loading && payments.length > 0}
        onRefresh={() => loadWallet()}
        ListHeaderComponent={
          <>
            <View style={styles.balanceCard}>
              <Text size="xs" weight="medium" text="Total earnings" />
              <Text size="xl" weight="semiBold" text={totalEarnings == null ? (loading ? 'Loading…' : 'Unavailable') : `${currency} ${totalEarnings}`} />
              <View style={styles.balanceDetails}>
                <Text size="xs" weight="semiBold" text={`Available wallet balance: ${dashboard ? `${currency} ${available?.available ?? '0.00'}` : loading ? 'Loading…' : 'Unavailable'}`} />
                <Text size="xxs" text={`Stripe pending settlement: ${dashboard ? `${currency} ${dashboard.balance.pending}` : loading ? 'Loading…' : 'Unavailable'}`} style={styles.mutedText} />
                {dashboard?.wallet ? <Text size="xxs" text={`Pending withdrawals: ${currency} ${dashboard.wallet.reserved}`} style={styles.mutedText} /> : null}
                {dashboard?.wallet ? <Text size="xxs" text={`Withdrawn: ${currency} ${dashboard.wallet.withdrawn}`} style={styles.mutedText} /> : null}
                {dashboard?.payment_mode?.test_mode ? <Text size="xxs" text="Test mode: payouts do not send real money to your bank." style={styles.mutedText} /> : null}
              </View>
            </View>

            <View style={styles.withdrawCard}>
              <View style={styles.row}>
                <View style={styles.flexText}>
                  <Text size="sm" weight="semiBold" text="Withdraw to bank" />
                  <Text
                    size="xxs"
                    text={dashboard?.account.destination
                      ? `${dashboard.account.destination.bank_name ?? 'Bank account'} •••• ${dashboard.account.destination.last4 ?? '----'}`
                      : 'Add and verify a bank account with Stripe.'}
                    style={styles.mutedText}
                  />
                </View>
                <TouchableOpacity onPress={openStripe} disabled={openingStripe}>
                  <Text size="xxs" weight="semiBold" text={dashboard?.account.destination ? 'Manage' : 'Set up'} style={styles.linkText} />
                </TouchableOpacity>
              </View>

              <View style={styles.amountInputWrap}>
                <Text size="sm" weight="semiBold" text={currency} style={styles.currencyText} />
                <TextInput
                  value={amount}
                  onChangeText={updateAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor={colors.textDim}
                  style={styles.amountInput}
                  accessibilityLabel="Withdrawal amount"
                />
                <TouchableOpacity onPress={() => updateAmount(available?.available ?? '0.00')} disabled={!available?.available_minor}>
                  <Text size="xxs" weight="semiBold" text="MAX" style={styles.linkText} />
                </TouchableOpacity>
              </View>

              <Text size="xxs" text={`Minimum ${currency} ${minimum.toFixed(2)}. Withdrawal requests reserve wallet funds immediately. Bank payouts wait for Stripe settlement.`} style={styles.mutedText} />
              {!loading && (unavailableReason || amountError) ? <Text size="xxs" text={unavailableReason || amountError || ''} style={styles.errorText} accessibilityRole="alert" /> : null}
              <TouchableOpacity style={[styles.withdrawButton, (!canWithdraw || submitting) && styles.disabledButton]} onPress={confirmPayout} disabled={!canWithdraw || submitting}>
                {submitting ? <ActivityIndicator color={colors.palette.white} /> : <Text size="sm" weight="semiBold" text="Withdraw funds" style={styles.buttonText} />}
              </TouchableOpacity>
            </View>

            {(dashboard?.payouts.length ?? 0) > 0 && (
              <View style={styles.historySection}>
                <Text size="sm" weight="semiBold" text="Recent withdrawals" />
                {dashboard?.payouts.map(payout => (
                  <View key={payout.id} style={styles.payoutRow}>
                    <View style={styles.flexText}>
                      <Text size="xs" weight="medium" text={`${payout.currency.toUpperCase()} ${Currency.sign}${payout.amount}`} />
                      <Text size="xxs" text={formatWithdrawalDate(payout.created_at)} style={styles.mutedText} />
                      {payout.failure_message ? <Text size="xxs" text={payout.failure_message} style={styles.errorText} numberOfLines={2} /> : null}
                    </View>
                    <Text
                      size="xxs"
                      weight="semiBold"
                      text={formatStatus(payout.status)}
                      style={payout.status === 'paid' ? styles.success : payout.status === 'failed' ? styles.errorText : styles.pendingText}
                    />
                  </View>
                ))}
              </View>
            )}

            <Text size="sm" weight="semiBold" text="Payment History" style={styles.heading} />
          </>
        }
        renderItem={({item}) => (
          <View style={styles.paymentCard}>
            <View style={styles.row}>
              <View style={styles.flexText}>
                <Text size="xxs" text="JOB" style={styles.label} />
                <Text size="xs" weight="semiBold" text={item.job_title?.trim() || `Job #${item.job_id}`} numberOfLines={2} />
              </View>
              <Text size="xs" weight="semiBold" text={`${(item.currency || currency).toUpperCase()} ${Currency.sign}${item.provider_earnings}`} style={styles.success} />
            </View>
            <View style={styles.detailRow}>
              <Text size="xxs" text="Client" style={styles.mutedText} />
              <Text size="xxs" weight="medium" text={item.client_name?.trim() || `Client #${item.customer_id}`} style={styles.detailValue} numberOfLines={1} />
            </View>
            <View style={styles.footerRow}>
              <Text size="xxs" text={formatPaymentDate(item.paid_at ?? item.created_at)} style={styles.mutedText} />
              <Text size="xxs" weight="medium" text={item.status.toUpperCase()} style={item.status === 'succeeded' ? styles.success : styles.mutedText} />
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}>{loading ? <ActivityIndicator color={colors.primary} /> : <Text size="xs" text="No payments yet." style={styles.mutedText} />}</View>}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  flatList: {flex: 1},
  list: {flexGrow: 1, paddingHorizontal: spacing.md, paddingBottom: spacing.xl},
  balanceCard: {gap: spacing.xxs, padding: spacing.lg, marginTop: spacing.md, borderRadius: spacing.md, backgroundColor: colors.palette.offWhite2},
  balanceDetails: {gap: spacing.xxxs, marginTop: spacing.xs},
  withdrawCard: {gap: spacing.md, padding: spacing.md, marginTop: spacing.md, borderRadius: spacing.md, borderWidth: 1, borderColor: colors.palette.borderColor, backgroundColor: colors.background},
  row: {gap: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  flexText: {flex: 1, flexShrink: 1},
  mutedText: {color: colors.textDim},
  linkText: {color: colors.primary},
  amountInputWrap: {alignItems: 'center', flexDirection: 'row', borderWidth: 1, borderColor: colors.palette.borderColor, borderRadius: spacing.sm, paddingHorizontal: spacing.md, minHeight: 54},
  currencyText: {color: colors.textDim},
  amountInput: {flex: 1, color: colors.text, fontSize: 20, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm},
  withdrawButton: {alignItems: 'center', justifyContent: 'center', minHeight: 52, borderRadius: spacing.sm, backgroundColor: colors.primary},
  disabledButton: {opacity: 0.45},
  buttonText: {color: colors.palette.white},
  historySection: {gap: spacing.xs, marginTop: spacing.lg},
  payoutRow: {alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: spacing.sm, backgroundColor: colors.palette.offWhite2},
  pendingText: {color: colors.primary},
  errorText: {color: colors.error},
  heading: {marginTop: spacing.lg},
  paymentCard: {gap: spacing.sm, padding: spacing.md, marginTop: spacing.sm, borderRadius: spacing.sm, backgroundColor: colors.palette.offWhite2},
  label: {color: colors.textDim, marginBottom: spacing.xxxs},
  detailRow: {alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between'},
  detailValue: {color: colors.text, flex: 1, textAlign: 'right'},
  footerRow: {alignItems: 'center', borderTopColor: colors.separator, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.xs},
  success: {color: colors.palette.green},
  empty: {minHeight: 120, alignItems: 'center', justifyContent: 'center'},
});

const formatPaymentDate = (value?: string | null) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
};

const formatWithdrawalDate = (value?: string | null) => value ? new Date(value).toLocaleString() : 'Date unavailable';

const formatStatus = (status: string) => status === 'awaiting_settlement' ? 'Pending settlement' : status.replace(/_/g, ' ').replace(/^./, value => value.toUpperCase());
