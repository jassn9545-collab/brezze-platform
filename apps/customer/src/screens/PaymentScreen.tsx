import React, { FC, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useToast } from 'react-native-toast-notifications';
import { BackButtom, Button, Screen, Text } from '../components';
import {
  addPaymentMethod,
  deletePaymentMethod,
  getPaymentMethods,
  SavedPaymentMethod,
  setDefaultPaymentMethod,
} from '../apis/paymentMethods';
import { colors, images, spacing } from '../theme';

export const PaymentMethodsScreen: FC = () => {
  const toast = useToast();
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const loadPaymentMethods = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setPaymentMethods(await getPaymentMethods());
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPaymentMethods().catch(() => undefined);
    }, [loadPaymentMethods]),
  );

  const addCard = async () => {
    if (working) return;
    setWorking(true);
    try {
      const result = await addPaymentMethod();
      if (result === 'added') {
        toast.show('Card saved securely.', { type: 'success' });
        await loadPaymentMethods();
      }
    } catch (error) {
      toast.show(error instanceof Error ? error.message : 'Card could not be saved.', {
        type: 'danger',
      });
    } finally {
      setWorking(false);
    }
  };

  const makeDefault = async (method: SavedPaymentMethod) => {
    if (method.is_default || working) return;
    setWorking(true);
    try {
      await setDefaultPaymentMethod(method.id);
      setPaymentMethods(current => current.map(item => ({
        ...item,
        is_default: item.id === method.id,
      })));
      toast.show('Default card updated.', { type: 'success' });
    } catch {
      // The shared API interceptor already displays the backend error.
    } finally {
      setWorking(false);
    }
  };

  const confirmDelete = (method: SavedPaymentMethod) => {
    Alert.alert(
      'Remove card?',
      `Remove ${method.brand} ending in ${method.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setWorking(true);
            try {
              await deletePaymentMethod(method.id);
              toast.show('Card removed.', { type: 'success' });
              await loadPaymentMethods();
            } catch {
              // The shared API interceptor already displays the backend error.
            } finally {
              setWorking(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen
      preset="scroll"
      safeAreaEdges={['top', 'bottom']}
      backgroundColor={colors.palette.jobPostBackground}
      contentContainerStyle={styles.container}
    >
      <BackButtom heading="Payment Methods" />

      <View style={styles.securityNote}>
        <Image source={images.paymentIcon} style={styles.securityIcon} />
        <View style={styles.flex}>
          <Text text="Secure card payments" weight="semiBold" />
          <Text
            text="Your full card number is handled by Stripe and is never stored by Our Bezzie."
            size="xs"
            style={styles.secondaryText}
          />
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text text="Saved cards" weight="semiBold" size="lg" />
        <Text text={`${paymentMethods.length}`} size="xs" style={styles.count} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : loadError ? (
        <View style={styles.emptyState}>
          <Text text="Payment methods could not be loaded." style={styles.secondaryText} />
          <Button text="Retry" onPress={loadPaymentMethods} style={styles.retryButton} />
        </View>
      ) : paymentMethods.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <Image source={images.paymentIcon} style={styles.emptyIcon} />
          </View>
          <Text text="No saved cards" weight="semiBold" size="lg" />
          <Text
            text="Add a card now for a faster checkout when your job is complete."
            size="sm"
            style={styles.emptyText}
          />
        </View>
      ) : (
        paymentMethods.map(method => (
          <TouchableOpacity
            key={method.id}
            accessibilityRole="button"
            accessibilityLabel={`${method.brand} ending in ${method.last4}`}
            style={[styles.card, method.is_default && styles.defaultCard]}
            onPress={() => makeDefault(method)}
            disabled={working}
          >
            <View style={styles.cardIconWrap}>
              <Image source={images.paymentIcon} style={styles.cardIcon} />
            </View>
            <View style={styles.flex}>
              <View style={styles.cardTitleRow}>
                <Text text={method.brand} weight="semiBold" />
                {method.is_default && <Text text="DEFAULT" size="xxs" style={styles.defaultBadge} />}
              </View>
              <Text text={`•••• •••• •••• ${method.last4}`} style={styles.cardNumber} />
              <Text
                text={`Expires ${String(method.exp_month).padStart(2, '0')}/${String(method.exp_year).slice(-2)}`}
                size="xs"
                style={styles.secondaryText}
              />
              {!method.is_default && (
                <Text text="Tap to make default" size="xxs" style={styles.defaultHint} />
              )}
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Remove ${method.brand} ending in ${method.last4}`}
              onPress={() => confirmDelete(method)}
              style={styles.removeButton}
              disabled={working}
            >
              <Text text="Remove" size="xs" style={styles.removeText} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}

      <Button
        text={working ? 'Please wait…' : '+  Add payment method'}
        onPress={addCard}
        disabled={working}
        style={styles.addButton}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: spacing.xl },
  flex: { flex: 1 },
  securityNote: {
    flexDirection: 'row',
    margin: spacing.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.primaryDimmed,
  },
  securityIcon: { width: 26, height: 26, tintColor: colors.primary },
  secondaryText: { color: colors.textDim, marginTop: spacing.xxs },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  count: {
    color: colors.primary,
    backgroundColor: colors.primaryDimmed,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 12,
  },
  loader: { marginTop: spacing.xl },
  emptyState: {
    alignItems: 'center',
    marginHorizontal: spacing.md,
    padding: spacing.xl,
    borderRadius: spacing.md,
    backgroundColor: colors.palette.white,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDimmed,
    marginBottom: spacing.sm,
  },
  emptyIcon: { width: 30, height: 30, tintColor: colors.primary },
  emptyText: { color: colors.textDim, textAlign: 'center', marginTop: spacing.xs },
  retryButton: { width: 120, minHeight: 44, marginTop: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.palette.borderGray,
    borderRadius: spacing.md,
    backgroundColor: colors.palette.white,
  },
  defaultCard: { borderColor: colors.primary, backgroundColor: colors.primaryDimmed },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.palette.white,
  },
  cardIcon: { width: 26, height: 26, tintColor: colors.primary },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  defaultBadge: {
    color: colors.primary,
    backgroundColor: colors.palette.white,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cardNumber: { letterSpacing: 1, marginTop: spacing.xxs },
  defaultHint: { color: colors.primary, marginTop: spacing.xxs },
  removeButton: { padding: spacing.xs },
  removeText: { color: colors.palette.red },
  addButton: { marginHorizontal: spacing.md, marginTop: spacing.md },
});
