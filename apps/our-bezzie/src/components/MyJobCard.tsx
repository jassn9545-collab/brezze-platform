import React from 'react';
import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import moment from 'moment';
import {Text} from './Text';
import {colors, images} from '../theme';
import {Currency} from '../config/defaults';
import type {Job} from '../slices/types';

type Props = {
  item: Job;
  variant: 'applied' | 'active' | 'completed';
  onViewDetails: () => void;
  onMessage?: () => void;
  onReview?: () => void;
};

const paymentColors = {
  succeeded: {color: '#16794B', background: '#EFFBF4', border: '#D6F2E1'},
  unpaid: {color: '#B85E00', background: '#FFFBEB', border: '#FDE7AD'},
  cancelled: {color: '#F52255', background: '#FFF1F3', border: '#FFE0E7'},
  failed: {color: '#F52255', background: '#FFF1F3', border: '#FFE0E7'},
  pending: {color: '#0054A5', background: '#EFF6FF', border: '#D8E8FD'},
  processing: {color: '#0054A5', background: '#EFF6FF', border: '#D8E8FD'},
};

export const MyJobCard = ({item, variant, onViewDetails, onMessage, onReview}: Props) => {
  const rawStatus = item.status?.trim() || (variant === 'active' ? 'in progress' : variant);
  const status = variant === 'applied' && rawStatus.toLowerCase() === 'active' ? 'applied' : rawStatus;
  const statusColor = status.toLowerCase() === 'in progress' ? '#D77A00'
    : status.toLowerCase() === 'completed' ? '#16794B' : colors.primary;
  const statusBackground = status.toLowerCase() === 'in progress' ? '#FFFBEB'
    : status.toLowerCase() === 'completed' ? '#EFFBF4' : '#EFF6FF';
  const payment = item.payment_status;
  const paymentStyle = payment ? paymentColors[payment] : undefined;
  const date = moment(item.created_at);
  const client = item.client_name?.trim() || item.client?.name?.trim() || 'Customer';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.status, {backgroundColor: statusBackground, borderColor: `${statusColor}40`}]}>
          <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
          <Text text={status.toUpperCase()} weight="semiBold" style={[styles.statusText, {color: statusColor}]} />
        </View>
        {date.isValid() ? <Text text={`${variant === 'active' ? 'Started' : 'Posted'} ${date.format('MMM D')}`}
          style={styles.date} /> : null}
      </View>
      <Text text={item.title} weight="semiBold" style={styles.title} />
      <Text text={client} style={styles.client} />
      <View style={styles.divider} />
      <View style={styles.paymentRow}>
        {payment && paymentStyle ? (
          <View style={[styles.paymentBadge, {backgroundColor: paymentStyle.background, borderColor: paymentStyle.border}]}>
            <Text text={`PAYMENT ${payment.toUpperCase()}`} weight="semiBold"
              style={[styles.paymentText, {color: paymentStyle.color}]} />
          </View>
        ) : <View style={styles.grow} />}
        <Text text={`${Currency.code} ${Currency.sign}${item.budget}`} weight="semiBold" style={styles.amount} />
      </View>
      {payment === 'succeeded' && item.provider_earnings != null ? (
        <Text text={`Your earnings ${Currency.code} ${Currency.sign}${item.provider_earnings}`}
          style={styles.earnings} weight="medium" />
      ) : null}
      <View style={styles.actions}>
        {onMessage ? (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Message customer for ${item.title}`}
            onPress={onMessage} activeOpacity={0.8} style={styles.messageButton}>
            <Image source={images.emailIcon} style={styles.messageIcon} tintColor={colors.primary} />
            <Text text="Message" weight="semiBold" style={styles.messageText} />
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`View details for ${item.title}`}
          onPress={onViewDetails} activeOpacity={0.8} style={styles.detailsButton}>
          <Text text="View Details" weight="semiBold" style={styles.detailsText} />
          <Image source={images.leftArrow} style={styles.detailsArrow} tintColor={colors.palette.white} />
        </TouchableOpacity>
      </View>
      {onReview ? (
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Review customer for ${item.title}`}
          onPress={onReview} style={styles.reviewButton}>
          <Text text="Give Review" weight="semiBold" style={styles.messageText} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {marginHorizontal: 16, marginTop: 18, padding: 20, borderRadius: 24,
    backgroundColor: colors.palette.white, shadowColor: '#17314D', shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05, shadowRadius: 14, elevation: 2},
  topRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10},
  status: {flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', flexShrink: 1,
    gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4},
  statusDot: {width: 5, height: 5, borderRadius: 3},
  statusText: {fontSize: 10, lineHeight: 15, flexShrink: 1},
  date: {fontSize: 11, lineHeight: 16, color: '#8FA1BA', flexShrink: 1, textAlign: 'right'},
  title: {fontSize: 17, lineHeight: 24, color: '#131C2F', marginTop: 16},
  client: {fontSize: 14, lineHeight: 21, color: '#71839D', marginTop: 4},
  divider: {height: 1, backgroundColor: '#EDF1F5', marginVertical: 16},
  paymentRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12},
  paymentBadge: {maxWidth: '58%', paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderRadius: 6},
  paymentText: {fontSize: 10, lineHeight: 13},
  amount: {fontSize: 16, lineHeight: 24, color: '#131C2F', flexShrink: 1, textAlign: 'right'},
  grow: {flex: 1},
  earnings: {fontSize: 12, lineHeight: 18, color: '#16794B', marginTop: 8, textAlign: 'right'},
  actions: {flexDirection: 'row', gap: 10, marginTop: 18},
  messageButton: {flex: 1, minHeight: 42, paddingHorizontal: 6, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1, borderColor: colors.primary, borderRadius: 12, backgroundColor: '#F8FBFF'},
  messageIcon: {width: 16, height: 16, resizeMode: 'contain'},
  messageText: {fontSize: 11, lineHeight: 18, color: colors.primary, flexShrink: 1},
  detailsButton: {flex: 1, minHeight: 42, paddingHorizontal: 6, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderRadius: 12, backgroundColor: colors.primary},
  detailsText: {fontSize: 11, lineHeight: 18, color: colors.palette.white, flexShrink: 1},
  detailsArrow: {width: 16, height: 16, resizeMode: 'contain', transform: [{rotate: '180deg'}]},
  reviewButton: {minHeight: 42, marginTop: 10, alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, borderWidth: 1, borderColor: colors.primary},
});
