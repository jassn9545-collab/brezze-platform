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
  const [payments, setPayments] = useState<ProviderPayment[]>([]);
  const [dashboard, setDashboard] = useState<StripePayoutDashboard | null>(null);
  const [totalEarnings, setTotalEarnings] = useState('0.00');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openingStripe, setOpeningStripe] = useState(false);
  const requestKey = useRef<string | null>(null);

  const loadWallet = useCallback(async () => {
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
      setTotalEarnings(payoutDashboard.total_earnings ?? '0.00');
    } catch {
      // Payment history remains usable if Stripe is temporarily unavailable.
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWallet();
    }, [loadWallet]),
  );

  const currency = (dashboard?.balance.currency ?? Currency.code).toUpperCase();
  const minimum = (dashboard?.minimum_payout_minor ?? 0) / 100;
  const numericAmount = Number(amount);
  const canWithdraw = Boolean(
    dashboard?.account.payouts_enabled &&
      dashboard.account.destination &&
      Number.isFinite(numericAmount) &&
      numericAmount >= minimum &&
      numericAmount * 100 <= dashboard.balance.available_minor,
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
      await createStripePayout(numericAmount.toFixed(2), requestKey.current);
      toast.show('Your payout is being processed by Stripe.', {type: 'success'});
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
      `Withdraw ${currency} ${numericAmount.toFixed(2)} to your Stripe payout account?`,
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
        contentContainerStyle={styles.list}
        refreshing={loading && payments.length > 0}
        onRefresh={loadWallet}
        ListHeaderComponent={
          <>
            <View style={styles.balanceCard}>
              <Text size="xs" weight="medium" text="Available to withdraw" />
              <Text size="xl" weight="semiBold" text={`${currency} ${Currency.sign}${dashboard?.balance.available ?? '0.00'}`} />
              <View style={styles.balanceDetails}>
                <Text size="xxs" text={`Pending: ${Currency.sign}${dashboard?.balance.pending ?? '0.00'}`} style={styles.mutedText} />
                <Text size="xxs" text={`Lifetime earned: ${Currency.sign}${totalEarnings}`} style={styles.mutedText} />
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
                <TouchableOpacity onPress={() => updateAmount(dashboard?.balance.available ?? '0.00')} disabled={!dashboard?.balance.available_minor}>
                  <Text size="xxs" weight="semiBold" text="MAX" style={styles.linkText} />
                </TouchableOpacity>
              </View>

              <Text size="xxs" text={`Minimum ${currency} ${minimum.toFixed(2)}. Standard arrival time is shown after Stripe accepts the payout.`} style={styles.mutedText} />
              <TouchableOpacity style={[styles.withdrawButton, (!canWithdraw || submitting) && styles.disabledButton]} onPress={confirmPayout} disabled={!canWithdraw || submitting}>
                {submitting ? <ActivityIndicator color={colors.palette.white} /> : <Text size="sm" weight="semiBold" text="Withdraw funds" style={styles.buttonText} />}
              </TouchableOpacity>
            </View>

            {(dashboard?.payouts.length ?? 0) > 0 && (
              <View style={styles.historySection}>
                <Text size="sm" weight="semiBold" text="Recent withdrawals" />
                {dashboard?.payouts.slice(0, 5).map(payout => (
                  <View key={payout.id} style={styles.payoutRow}>
                    <View style={styles.flexText}>
                      <Text size="xs" weight="medium" text={`${payout.currency.toUpperCase()} ${Currency.sign}${payout.amount}`} />
                      <Text size="xxs" text={formatPaymentDate(payout.created_at)} style={styles.mutedText} />
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
  container: {flexGrow: 1},
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

const formatStatus = (status: string) => status.replace(/_/g, ' ').replace(/^./, value => value.toUpperCase());
