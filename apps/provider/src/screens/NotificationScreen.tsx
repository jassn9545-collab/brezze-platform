import { BackButtom, Screen, Text } from '../components';
import {
  Alert,
  FlatList,
  Image,
  ListRenderItemInfo,
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

type NavigationProps = AppStackScreenProps<'Notification'>;
const Notification: FC<NavigationProps> = ({ navigation }) => {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [actionId, setActionId] = useState<number | null>(null);

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
    }, [load]),
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

export const NotificationScreen = Notification;
