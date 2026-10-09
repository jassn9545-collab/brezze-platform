import { BackButtom, Screen, Text } from '../components';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import React, { FC, useCallback, useState } from 'react';
import { AppStackScreenProps } from '../navigators';
import { Currency } from '../config/defaults';
import { colors, spacing } from '../theme';
import { useFocusEffect } from '@react-navigation/native';
import api from '../apis/api';
import URLs from '../config/urls';

type NavigationProps = AppStackScreenProps<'Wallet'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

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

const Wallet: FC<Props> = () => {
  const [payments, setPayments] = useState<ProviderPayment[]>([]);
  const [totalEarnings, setTotalEarnings] = useState('0.00');
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.post(URLs.paymentHistory, {
        page: 1,
        per_page: 50,
      });
      setPayments(response.data.data.payments ?? []);
      setTotalEarnings(response.data.data.total_earnings ?? '0.00');
    } catch {
      // The shared API interceptor displays the error; keep the current history.
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPayments();
    }, [loadPayments]),
  );

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom headingTx="payment.wallet" />

      <View style={styles.balance}>
        <Text size="xs" weight="medium" tx="payment.availableBalance" />
        <Text
          size="xl"
          weight="semiBold"
          text={`${Currency.code} ${Currency.sign}${totalEarnings}`}
        />
      </View>

      <Text
        size="sm"
        weight="semiBold"
        text="Payment History"
        style={styles.heading}
      />
      <FlatList
        data={payments}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshing={loading && payments.length > 0}
        onRefresh={loadPayments}
        renderItem={({ item }) => (
          <View style={styles.paymentCard}>
            <View style={styles.row}>
              <View style={styles.flexText}>
                <Text size="xxs" text="JOB" style={styles.label} />
                <Text
                  size="xs"
                  weight="semiBold"
                  text={item.job_title?.trim() || `Job #${item.job_id}`}
                  numberOfLines={2}
                />
              </View>
              <Text
                size="xs"
                weight="semiBold"
                text={`${item.currency || Currency.code} ${Currency.sign}${item.provider_earnings}`}
                style={styles.amount}
              />
            </View>

            <View style={styles.detailRow}>
              <Text size="xxs" text="Client" style={styles.detailLabel} />
              <Text
                size="xxs"
                weight="medium"
                text={item.client_name?.trim() || `Client #${item.customer_id}`}
                style={styles.detailValue}
                numberOfLines={1}
              />
            </View>
            <View style={styles.detailRow}>
              <Text size="xxs" text="Payment reference" style={styles.detailLabel} />
              <Text
                size="xxs"
                text={item.transaction_id ?? `Payment #${item.id}`}
                numberOfLines={1}
                style={styles.detailValue}
              />
            </View>

            <View style={styles.footerRow}>
              <Text
                size="xxs"
                text={formatPaymentDate(item.paid_at ?? item.created_at)}
                style={styles.mutedText}
              />
              <Text
                size="xxs"
                weight="medium"
                text={item.status.toUpperCase()}
                style={item.status === 'succeeded' ? styles.success : styles.mutedText}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text size="xs" text="No payments yet." style={{ color: colors.textDim }} />
            )}
          </View>
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  balance: {
    gap: spacing.xxxs,
    padding: spacing.md,
    marginTop: spacing.md,
    borderRadius: spacing.md,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.md,
    backgroundColor: colors.palette.offWhite2,
  },
  heading: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  paymentCard: {
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.palette.offWhite2,
  },
  row: {
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flexText: {
    flex: 1,
    flexShrink: 1,
  },
  label: {
    color: colors.textDim,
    marginBottom: spacing.xxxs,
  },
  amount: {
    color: colors.palette.green,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: colors.textDim,
  },
  detailValue: {
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  footerRow: {
    alignItems: 'center',
    borderTopColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
  },
  mutedText: {
    color: colors.textDim,
  },
  success: {
    color: colors.palette.green,
  },
  empty: {
    flex: 1,
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const formatPaymentDate = (value?: string | null) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
};
// const mapStateToProps = (state: RootState) => ({
//   totalcount: state.auth.totalNotifications,
//   notification: state.auth.userNotifications,
//   fetching: state.auth.userNotificationsLoading,
// });

// const mapDispatch = {
//   get: getNotifications,
// };

// const connector = connect(mapStateToProps, mapDispatch);

export const WalletScreen = Wallet;
