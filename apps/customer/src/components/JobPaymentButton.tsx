import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { getJobPayment, JobPayment, payForJob } from '../apis/payments';
import { colors } from '../theme';
import { Button } from './Button';

type Props = {
  jobId: number;
  style?: StyleProp<ViewStyle>;
  onPaid?: (payment: JobPayment) => void;
};

const LoadingAccessory = () => (
  <ActivityIndicator color={colors.palette.white} />
);

export const JobPaymentButton: React.FC<Props> = ({ jobId, style, onPaid }) => {
  const [payment, setPayment] = useState<JobPayment | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setPayment(await getJobPayment(jobId));
    } catch {
      // The normal API error toast already explains why status could not load.
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onPress = async () => {
    setLoading(true);
    try {
      const nextPayment = await payForJob(jobId);
      setPayment(nextPayment);
      if (nextPayment.status === 'succeeded') {
        toast.show('Payment completed successfully.', { type: 'success' });
        onPaid?.(nextPayment);
      } else if (nextPayment.status === 'processing') {
        toast.show('Payment is processing.', { type: 'normal' });
      } else if (nextPayment.status === 'cancelled') {
        toast.show('Payment cancelled.', { type: 'normal' });
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        'Payment failed. Please try again.';
      toast.show(message, {
        type: 'danger',
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  };

  const succeeded = payment?.status === 'succeeded';
  const processing = payment?.status === 'processing';
  const disabled = loading || succeeded || processing;
  const text = loading
    ? 'Loading payment...'
    : succeeded
      ? 'Paid'
      : processing
        ? 'Payment Processing'
        : payment?.status === 'failed' || payment?.status === 'cancelled'
          ? 'Retry Payment & Complete Job'
          : 'Pay & Complete Job';

  return (
    <Button
      text={text}
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled, busy: loading }}
      style={[style, disabled && disabledStyle]}
      LeftAccessory={loading ? LoadingAccessory : undefined}
    />
  );
};

const disabledStyle: ViewStyle = { opacity: 0.65 };
