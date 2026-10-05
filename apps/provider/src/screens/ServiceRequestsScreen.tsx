import React, {FC, useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';

import {BackButtom, Screen, Text} from '../components';
import {
  getServiceBookings,
  respondToServiceBooking,
  ServiceBooking,
} from '../apis/bookings';
import {Currency} from '../config/defaults';
import {AppStackScreenProps} from '../navigators';
import {colors, spacing} from '../theme';

type Props = AppStackScreenProps<'Notification'>;

const formatPrice = (price: string) =>
  `${Currency.code} ${Currency.sign}${Number(price).toFixed(2)}`;

const ServiceRequests: FC<Props> = ({navigation}) => {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const load = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const result = await getServiceBookings();
      setBookings(result.bookings);
    } catch {
      // The shared API client displays the server error.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [load]),
  );

  const openChat = (booking: ServiceBooking) => {
    if (!booking.conversation_id) return;
    navigation.navigate('ChatDetail', {conversationId: booking.conversation_id});
  };

  const respond = async (
    booking: ServiceBooking,
    action: 'accept' | 'reject',
  ) => {
    if (actionId !== null) return;
    setActionId(booking.id);
    try {
      const updated = await respondToServiceBooking(booking.id, action);
      setBookings(current =>
        current.map(item => (item.id === updated.id ? updated : item)),
      );
      if (action === 'accept') {
        toast.show('Request accepted. The job and chat are now active.', {
          type: 'success',
        });
        openChat(updated);
      } else {
        toast.show('Service request rejected.', {type: 'success'});
      }
    } catch {
      // The shared API client displays the server error.
    } finally {
      setActionId(null);
    }
  };

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom heading="Service Requests" />
      {loading && bookings.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={item => item.id.toString()}
          style={styles.list}
          contentContainerStyle={[
            styles.content,
            bookings.length === 0 && styles.emptyContent,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={colors.primary}
            />
          }
          renderItem={({item}) => (
            <BookingCard
              booking={item}
              busy={actionId === item.id}
              onAccept={() => respond(item, 'accept')}
              onReject={() => respond(item, 'reject')}
              onChat={() => openChat(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text
                text="No service requests yet."
                size="sm"
                style={styles.mutedText}
              />
            </View>
          }
        />
      )}
    </Screen>
  );
};

type CardProps = {
  booking: ServiceBooking;
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
  onChat: () => void;
};

const BookingCard: FC<CardProps> = ({
  booking,
  busy,
  onAccept,
  onReject,
  onChat,
}) => {
  const statusText =
    booking.status === 'pending'
      ? 'NEW REQUEST'
      : booking.status === 'accepted'
        ? 'ACCEPTED · JOB STARTED'
        : 'REJECTED';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {booking.client.profile_image ? (
          <Image
            source={{uri: booking.client.profile_image}}
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarFallback}>
            <Text
              text={(booking.client.name?.[0] ?? 'C').toUpperCase()}
              size="sm"
              weight="bold"
              style={styles.primaryText}
            />
          </View>
        )}
        <View style={styles.headerInfo}>
          <Text
            text={booking.client.name}
            size="sm"
            weight="semiBold"
            numberOfLines={1}
          />
          <Text
            text={moment(booking.created_at).fromNow()}
            size="xxs"
            style={styles.mutedText}
          />
        </View>
        <View
          style={[
            styles.statusChip,
            booking.status === 'accepted' && styles.acceptedChip,
            booking.status === 'rejected' && styles.rejectedChip,
          ]}
        >
          <Text text={statusText} size="xxs" weight="semiBold" />
        </View>
      </View>

      <View style={styles.serviceRow}>
        {booking.service_image ? (
          <Image source={{uri: booking.service_image}} style={styles.serviceImage} />
        ) : null}
        <View style={styles.serviceInfo}>
          <Text
            text={booking.service_title}
            size="sm"
            weight="semiBold"
          />
          <Text
            text={formatPrice(booking.price)}
            size="sm"
            weight="bold"
            style={styles.primaryText}
          />
        </View>
      </View>

      <View style={styles.noteBox}>
        <Text text="Customer instructions" size="xxs" weight="semiBold" />
        <Text
          text={booking.note || 'No additional instructions.'}
          size="xs"
          style={booking.note ? undefined : styles.mutedText}
        />
      </View>

      {booking.status === 'pending' ? (
        <View style={styles.actions}>
          <TouchableOpacity
            disabled={busy}
            onPress={onReject}
            style={[styles.rejectButton, busy && styles.disabled]}
          >
            <Text text="Reject" size="xs" weight="semiBold" />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={busy}
            onPress={onAccept}
            style={[styles.acceptButton, busy && styles.disabled]}
          >
            {busy ? (
              <ActivityIndicator color={colors.palette.white} />
            ) : (
              <Text
                text="Accept & Start Job"
                size="xs"
                weight="bold"
                style={styles.whiteText}
              />
            )}
          </TouchableOpacity>
        </View>
      ) : booking.status === 'accepted' && booking.conversation_id ? (
        <TouchableOpacity onPress={onChat} style={styles.chatButton}>
          <Text
            text="Open Chat"
            size="xs"
            weight="bold"
            style={styles.whiteText}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  list: {flex: 1},
  content: {padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl},
  emptyContent: {flexGrow: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.separator,
    backgroundColor: colors.palette.white,
  },
  cardHeader: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm},
  avatar: {width: 44, height: 44, borderRadius: 22},
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryDimmed,
  },
  headerInfo: {flex: 1, gap: spacing.xxxs},
  statusChip: {
    maxWidth: 120,
    borderRadius: spacing.lg,
    paddingVertical: spacing.xxxs,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.palette.lightCream,
  },
  acceptedChip: {backgroundColor: colors.primaryDimmed},
  rejectedChip: {backgroundColor: colors.palette.offWhite2},
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.palette.offWhite2,
  },
  serviceImage: {width: 64, height: 64, borderRadius: spacing.sm},
  serviceInfo: {flex: 1, gap: spacing.xs},
  noteBox: {
    gap: spacing.xs,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.background,
  },
  actions: {flexDirection: 'row', gap: spacing.sm},
  rejectButton: {
    flex: 1,
    height: 46,
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    flex: 2,
    height: 46,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  chatButton: {
    height: 46,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  disabled: {opacity: 0.55},
  mutedText: {color: colors.textDim},
  primaryText: {color: colors.primary},
  whiteText: {color: colors.palette.white},
});

export const NotificationScreen = ServiceRequests;
