import React, { FC, useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { AppNotification, getNotifications, markAllNotificationsRead, markNotificationRead } from '../apis/account';
import { BackButtom, Button, Screen, Text } from '../components';
import { colors, spacing } from '../theme';

export const NotificationScreen: FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setLoadError(false);
    try {
      setNotifications(await getNotifications());
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => undefined);
    }, [load]),
  );

  const markRead = async (notification: AppNotification) => {
    if (notification.is_read) return;
    setNotifications(current => current.map(item => (
      item.id === notification.id ? { ...item, is_read: true } : item
    )));
    try {
      await markNotificationRead(notification.id);
    } catch {
      setNotifications(current => current.map(item => (
        item.id === notification.id ? { ...item, is_read: false } : item
      )));
    }
  };

  const markAll = () => {
    if (!notifications.some(item => !item.is_read)) return;
    Alert.alert('Mark all as read?', 'This will clear all unread notification indicators.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark all',
        onPress: async () => {
          try {
            await markAllNotificationsRead();
            setNotifications(current => current.map(item => ({ ...item, is_read: true })));
          } catch {
            // Shared API handling displays the server error.
          }
        },
      },
    ]);
  };

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top', 'bottom']}
      contentContainerStyle={styles.container}
    >
      <BackButtom
        heading="Notification"
        rightComponent={(
          <TouchableOpacity accessibilityLabel="Notification actions" onPress={markAll} style={styles.menuButton}>
            <Text text="⋮" size="xl" style={styles.menuText} />
          </TouchableOpacity>
        )}
      />
      <View style={styles.divider} />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : loadError ? (
        <View style={styles.empty}>
          <Text text="Notifications could not be loaded." style={styles.secondary} />
          <Button text="Retry" onPress={() => load()} style={styles.retry} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={notifications.length ? styles.list : styles.emptyList}
          refreshControl={(
            <RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={[colors.primary]} />
          )}
          ListEmptyComponent={(
            <View style={styles.empty}>
              <Text text="No notifications yet" weight="semiBold" size="lg" />
              <Text text="Updates about your jobs, messages, and account will appear here." size="sm" style={styles.emptyText} />
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={item.is_read ? 1 : 0.8}
              onPress={() => markRead(item)}
              style={[styles.card, !item.is_read && styles.unreadCard]}
            >
              <View style={styles.titleRow}>
                {!item.is_read && <View style={styles.unreadDot} />}
                <Text
                  text={item.title}
                  weight="semiBold"
                  style={!item.is_read ? styles.unreadText : undefined}
                />
              </View>
              <Text text={item.message} size="sm" style={!item.is_read ? styles.unreadBody : styles.secondary} />
              <View style={styles.footerRow}>
                <Text
                  text={`◷  ${moment(item.created_at).fromNow()}`}
                  size="xs"
                  style={!item.is_read ? styles.unreadMeta : styles.meta}
                />
                {!item.is_read && <Text text="Mark as read" size="sm" weight="medium" style={styles.unreadText} />}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  menuButton: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xxs },
  menuText: { color: colors.textDim, lineHeight: 28 },
  divider: { height: 1, backgroundColor: colors.palette.borderGray, marginHorizontal: spacing.md },
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
  meta: { color: colors.palette.grayText },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  empty: { alignItems: 'center', padding: spacing.xl, marginHorizontal: spacing.md },
  emptyText: { color: colors.textDim, textAlign: 'center', marginTop: spacing.xs },
  retry: { width: 120, minHeight: 44, marginTop: spacing.md },
});
