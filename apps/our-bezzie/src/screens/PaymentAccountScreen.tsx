import React, {FC, useState} from 'react';
import {
  ActivityIndicator,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {AppStackScreenProps} from '../navigators';
import {BackButtom, Screen, Text} from '../components';
import {
  createStripeOnboardingLink,
} from '../apis/stripe';
import {useStripeAccountStatus} from '../hooks/useStripeAccountStatus';
import {useAppDispatch} from '../store/hooks';
import {getProfile} from '../slices/auth.slice';
import {colors, spacing} from '../theme';

type Props = AppStackScreenProps<'PaymentAccount'>;

export const PaymentAccountScreen: FC<Props> = () => {
  const dispatch = useAppDispatch();
  const {status, loading, refresh} = useStripeAccountStatus(() => {
    dispatch(getProfile());
  });
  const [opening, setOpening] = useState(false);

  const openSetup = async () => {
    if (opening) return;
    setOpening(true);
    try {
      const url = await createStripeOnboardingLink();
      await Linking.openURL(url);
    } catch (error: any) {
      toast.show(error?.message ?? 'Unable to open payment account setup.', {
        type: 'danger',
      });
    } finally {
      setOpening(false);
    }
  };

  const ready = Boolean(status?.ready_for_payments);
  const pending = Boolean(status?.connected && !status.onboarding_required && !ready);

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top', 'bottom']}
      contentContainerStyle={styles.container}
    >
      <BackButtom heading="Payment Account" />
      <View style={styles.content}>
        <View style={[styles.card, ready && styles.readyCard]}>
          <Text
            size="lg"
            weight="semiBold"
            text={ready ? 'Payment account attached' : pending ? 'Stripe verification pending' : 'Attach your payment account'}
          />
          <Text
            size="xs"
            style={styles.description}
            text={
              ready
                ? 'Your Stripe account is ready. You can apply for jobs and receive payments.'
                : pending
                  ? 'Your details have been submitted. Stripe is reviewing your account; refresh to check the latest status.'
                  : 'A verified Stripe account is required before you can apply for a job.'
            }
          />

          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.statusList}>
              <StatusRow label="Account connected" value={Boolean(status?.connected)} />
              <StatusRow label="Details submitted" value={Boolean(status?.details_submitted)} />
              <StatusRow label="Payments enabled" value={Boolean(status?.charges_enabled)} />
              <StatusRow label="Payouts enabled" value={Boolean(status?.payouts_enabled)} />
            </View>
          )}
        </View>

        {!ready && !pending && !loading ? (
          <TouchableOpacity
            style={styles.button}
            onPress={openSetup}
            disabled={opening}
            accessibilityRole="button"
            accessibilityLabel="Attach payment account"
          >
            {opening ? (
              <ActivityIndicator color={colors.palette.white} />
            ) : (
              <Text
                size="sm"
                weight="semiBold"
                text={status?.connected ? 'Continue Stripe Setup' : 'Attach Payment Account'}
                style={styles.buttonText}
              />
            )}
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.refreshButton} onPress={refresh} disabled={loading}>
          <Text size="xs" weight="medium" text="Refresh status" style={styles.refreshText} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const StatusRow = ({label, value}: {label: string; value: boolean}) => (
  <View style={styles.statusRow}>
    <Text size="xs" text={label} style={styles.description} />
    <Text
      size="xs"
      weight="semiBold"
      text={value ? 'Done' : 'Required'}
      style={value ? styles.doneText : styles.requiredText}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.md},
  card: {
    backgroundColor: colors.palette.offWhite2,
    borderColor: colors.palette.borderColor,
    borderRadius: spacing.md,
    borderWidth: 1,
    padding: spacing.lg,
  },
  readyCard: {backgroundColor: colors.palette.dimGreen},
  description: {color: colors.textDim, lineHeight: 20, marginTop: spacing.xs},
  loader: {marginVertical: spacing.xl},
  statusList: {gap: spacing.sm, marginTop: spacing.lg},
  statusRow: {
    alignItems: 'center',
    borderTopColor: colors.separator,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  doneText: {color: colors.palette.green},
  requiredText: {color: colors.error},
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.lg,
    minHeight: 52,
  },
  buttonText: {color: colors.palette.white},
  refreshButton: {alignItems: 'center', padding: spacing.md},
  refreshText: {color: colors.primary},
});
