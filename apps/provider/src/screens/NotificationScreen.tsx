import { BackButtom, Button, Screen, Text } from '../components';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useCallback, useState } from 'react';
import { colors, images, spacing } from '../theme';
import { AppStackScreenProps } from '../navigators';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import {
  getServiceBookings,
  respondToServiceBooking,
  ServiceBooking,
} from '../apis/bookings';
import { Currency } from '../config/defaults';
import { useAppSelector } from '../store/hooks';
import { subscribeToUser } from '../utils/realtime';
import { useToast } from 'react-native-toast-notifications';
import {
  AppNotification,
  getNotificationFeed,
  markAllNotificationsRead,
  markNotificationRead,
} from '../apis/account';

type NavigationProps = AppStackScreenProps<'Notification'>;
export const LegacyServiceBookingNotification: FC<NavigationProps> = ({ navigation }) => {
  const toast = useToast();
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [actionId, setActionId] = useState<number | null>(null);
  const ownUserId = useAppSelector(state => state.auth.myProfile?.user?.id);

  const load = useCallback(async () => {
    try {
      const result = await getServiceBookings();
      setBookings(result.bookings);
    } catch {
      // The shared API client displays the server error.
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      const unsubscribe = ownUserId
        ? subscribeToUser(Number(ownUserId), () => undefined, event => {
            if (event.kind.startsWith('service_booking')) load();
          })
        : undefined;
      return unsubscribe;
    }, [load, ownUserId]),
  );

  const openChat = (booking: ServiceBooking) => {
    if (!booking.conversation_id) return;
    navigation.navigate('ChatDetail', { conversationId: booking.conversation_id });
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
      toast.show(
        action === 'accept'
          ? 'Request accepted. The job and chat are now active.'
          : 'Service request rejected.',
        { type: 'success' },
      );
    } catch {
      // The shared API client displays the server error.
    } finally {
      setActionId(null);
    }
  };

  const openBooking = (booking: ServiceBooking) => {
    if (booking.status === 'accepted') {
      openChat(booking);
      return;
    }
    if (booking.status === 'rejected' || actionId !== null) return;

    Alert.alert(
      'Service request',
      `${booking.client.name} requested ${booking.service_title}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => respond(booking, 'reject'),
        },
        { text: 'Accept', onPress: () => respond(booking, 'accept') },
      ],
    );
  };

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom headingTx="home.notification" />
      <FlatList
        data={bookings}
        style={styles.flatlist}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        renderItem={info => (
          <NotificationCard {...info} onPress={() => openBooking(info.item)} />
        )}
      />
    </Screen>
  );
};

const GeneralNotification: FC<NavigationProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const ownUserId = useAppSelector(state => state.auth.myProfile?.user?.id);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setLoadError(false);
    try {
      const feed = await getNotificationFeed();
      setNotifications(feed.notifications);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      const unsubscribe = ownUserId
        ? subscribeToUser(Number(ownUserId), () => undefined, event => {
            if (!event.notification) return;
            setNotifications(current => [
              event.notification!,
              ...current.filter(item => item.id !== event.notification!.id),
            ]);
          })
        : undefined;
      return unsubscribe;
    }, [load, ownUserId]),
  );

  const markRead = async (notification: AppNotification) => {
    if (notification.is_read) return;
    setNotifications(current => current.map(item =>
      item.id === notification.id ? { ...item, is_read: true } : item,
    ));
    try {
      await markNotificationRead(notification.id);
    } catch {
      setNotifications(current => current.map(item =>
        item.id === notification.id ? { ...item, is_read: false } : item,
      ));
    }
  };

  const openBookingNotification = async (bookingId: number) => {
    try {
      const result = await getServiceBookings();
      const booking = result.bookings.find(item => item.id === bookingId);
      if (!booking) return;
      if (booking.status === 'accepted' && booking.conversation_id) {
        navigation.navigate('ChatDetail', { conversationId: booking.conversation_id });
        return;
      }
      if (booking.status !== 'pending') return;
      Alert.alert('Service request', `${booking.client.name} requested ${booking.service_title}.`, [
        { text: 'Later', style: 'cancel' },
        { text: 'Decline', style: 'destructive', onPress: () => {
          respondToServiceBooking(booking.id, 'reject').catch(() => undefined);
        } },
        { text: 'Accept', onPress: () => {
          respondToServiceBooking(booking.id, 'accept').catch(() => undefined);
        } },
      ]);
    } catch {
      // The shared API client displays the server error.
    }
  };

  const openNotification = async (notification: AppNotification) => {
    await markRead(notification);
    if (!notification.action_id) return;
    if (notification.action_type === 'project') {
      navigation.navigate('JobDetail', { id: notification.action_id, from: 'ActiveJob' });
    } else if (notification.action_type === 'conversation') {
      navigation.navigate('ChatDetail', { conversationId: notification.action_id });
    } else if (notification.action_type === 'booking') {
      await openBookingNotification(notification.action_id);
    }
  };

  const markAll = () => {
    if (!notifications.some(item => !item.is_read)) return;
    Alert.alert('Mark all as read?', 'This will clear all unread notification indicators.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Mark all', onPress: async () => {
        try {
          await markAllNotificationsRead();
          setNotifications(current => current.map(item => ({ ...item, is_read: true })));
        } catch {
          // The shared API client displays the server error.
        }
      } },
    ]);
  };

  return (
    <Screen preset="fixed" safeAreaEdges={['top', 'bottom']} contentContainerStyle={feedStyles.container}>
      <BackButtom
        heading="Notification"
        rightComponent={(
          <TouchableOpacity accessibilityLabel="Mark all notifications as read" onPress={markAll} style={feedStyles.menuButton}>
            <Text text="⋮" size="xl" style={feedStyles.menuText} />
          </TouchableOpacity>
        )}
      />
      <View style={feedStyles.divider} />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={feedStyles.loader} />
      ) : loadError ? (
        <View style={feedStyles.empty}>
          <Text text="Notifications could not be loaded." style={feedStyles.secondary} />
          <Button text="Retry" onPress={() => load()} style={feedStyles.retry} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={notifications.length ? feedStyles.list : feedStyles.emptyList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />}
          ListEmptyComponent={(
            <View style={feedStyles.empty}>
              <Text text="No notifications yet" weight="semiBold" size="lg" />
              <Text text="Job, payment, review, message, and service updates will appear here." size="sm" style={feedStyles.emptyText} />
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={item.is_read ? 1 : 0.8} onPress={() => openNotification(item)} style={[feedStyles.card, !item.is_read && feedStyles.unreadCard]}>
              <View style={feedStyles.titleRow}>
                {!item.is_read && <View style={feedStyles.unreadDot} />}
                <Text text={item.title} weight="semiBold" style={!item.is_read ? feedStyles.unreadText : undefined} />
              </View>
              <Text text={item.message} size="sm" style={item.is_read ? feedStyles.secondary : feedStyles.unreadBody} />
              <View style={feedStyles.footerRow}>
                <Text text={`◷  ${moment(item.created_at).fromNow()}`} size="xs" style={item.is_read ? feedStyles.meta : feedStyles.unreadMeta} />
                {!item.is_read && <Text text="Mark as read" size="sm" weight="medium" style={feedStyles.unreadText} />}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
};

type NotificationCardProps = ListRenderItemInfo<ServiceBooking> & {
  onPress: () => void;
};

const NotificationCard = ({ item, onPress }: NotificationCardProps) => {
  const title =
    item.status === 'pending'
      ? 'New Service Request'
      : item.status === 'accepted'
        ? 'Service Request Accepted'
        : 'Service Request Rejected';
  const action =
    item.status === 'pending'
      ? 'Review'
      : item.status === 'accepted'
        ? 'Open Chat'
        : 'Rejected';
  const price = `${Currency.code} ${Currency.sign}${Number(item.price).toFixed(2)}`;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      key={item.id}
      style={styles.singleNotification}
      onPress={onPress}
    >
      <View style={styles.titleWrappper}>
        <View style={styles.dot} />
        <Text
          size="sm"
          weight="medium"
          text={title}
          style={styles.whiteText}
        />
      </View>

      <Text
        size="xs"
        weight="medium"
        style={styles.whiteText}
        text={`${item.client.name} requested ${item.service_title} for ${price}`}
      />
      <View style={styles.spaceBetween}>
        <View style={styles.timer}>
          <Image source={images.clock} tintColor={colors.palette.lightCream} />
          <Text
            size="xs"
            weight="medium"
            style={styles.lightTextStyle}
            text={moment(item?.created_at).fromNow()}
          />
        </View>
        <Text
          size="xs"
          weight="semiBold"
          style={styles.whiteText}
          text={action}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  flatlist: {
    flex: 1,
  },
  empty: {
    flex: 1,
  },
  extaFetch: {
    height: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  singleNotification: {
    flex: 1,
    gap: spacing.sm,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.palette.primaryColor,
  },
  titleWrappper: {
    gap: spacing.xs,
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.sm / 2,
    backgroundColor: colors.palette.white,
  },
  wrapText: { flex: 1, marginEnd: spacing.md, gap: spacing.xxxs },
  title: { flex: 1 },
  lightTextStyle: {
    color: colors.palette.lightCream,
  },
  whiteText: {
    color: colors.palette.white,
  },
  spaceBetween: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timer: {
    gap: spacing.xxs,
    alignItems: 'center',
    flexDirection: 'row',
  },
});

const feedStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  menuButton: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  menuText: { color: colors.textDim, lineHeight: 28 },
  divider: { height: 1, backgroundColor: colors.separator, marginHorizontal: spacing.md },
  loader: { marginTop: spacing.xl },
  list: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  card: { padding: spacing.md, borderRadius: spacing.md, backgroundColor: colors.palette.offWhite2 },
  unreadCard: { backgroundColor: colors.primary },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  unreadDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.palette.white },
  unreadText: { color: colors.palette.white },
  unreadBody: { color: colors.palette.white, lineHeight: 21 },
  secondary: { color: colors.textDim, lineHeight: 21 },
  footerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  unreadMeta: { color: '#B9D8F7' },
  meta: { color: colors.palette.grayLight },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', padding: spacing.xl, marginHorizontal: spacing.md },
  emptyText: { color: colors.textDim, textAlign: 'center', marginTop: spacing.xs },
  retry: { width: 120, minHeight: 44, marginTop: spacing.md },
});

export const NotificationScreen = GeneralNotification;
