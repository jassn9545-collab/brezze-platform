import React, { FC, useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { getChatConversations, ChatConversation } from '../apis/chat';
import { BackButtom, Screen, Text } from '../components';
import { translate } from '../i18n';
import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';
import { colors, images, spacing } from '../theme';
import { parseSource } from '../utils/util';
import { useIsForeground } from '../store/hooks';

type Props = AppBottomTabScreenProps<'Chat'>;

const Chat: FC<Props> = ({ navigation }) => {
  const isForeground = useIsForeground();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const focused = useRef(false);
  const inFlight = useRef(false);
  const hasLoaded = useRef(false);
  const autoRefreshEnabled = useRef(true);

  const loadConversations = useCallback(async (mode: 'initial' | 'refresh' | 'silent') => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (mode === 'initial' && !hasLoaded.current) setLoading(true);
    if (mode === 'refresh') setRefreshing(true);

    try {
      const result = await getChatConversations();
      if (focused.current) {
        setConversations(result);
        setError(false);
        hasLoaded.current = true;
        autoRefreshEnabled.current = true;
      }
    } catch {
      autoRefreshEnabled.current = false;
      if (focused.current) setError(true);
    } finally {
      inFlight.current = false;
      if (focused.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(useCallback(() => {
    if (!isForeground) return;
    focused.current = true;
    autoRefreshEnabled.current = true;
    loadConversations('initial');
    const interval = setInterval(() => {
      if (autoRefreshEnabled.current) loadConversations('silent');
    }, 5000);
    return () => {
      focused.current = false;
      clearInterval(interval);
    };
  }, [loadConversations, isForeground]));

  const goBackToHome = () => {
    navigation.navigate('Home');
    navigation.getParent()?.dispatch(DrawerActions.closeDrawer());
  };

  const renderConversation = ({ item }: { item: ChatConversation }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => navigation.navigate('ChatDetail', {
        conversationId: item.id,
        participantName: item.other_user.name,
        participantImage: item.other_user.profile_image,
      })}
    >
      <Image
        resizeMode="cover"
        style={styles.userImage}
        {...parseSource(item.other_user.profile_image ?? undefined, images.user)}
      />
      <View style={styles.details}>
        <View style={styles.row}>
          <Text size="sm" weight="semiBold" text={item.other_user.name} numberOfLines={1} style={styles.name} />
          <Text size="xxs" style={styles.time} text={
            item.latest_message?.created_at
              ? moment(item.latest_message.created_at).fromNow()
              : ''
          } />
        </View>
        {item.project_title ? (
          <Text size="xxs" style={styles.project} text={item.project_title} numberOfLines={1} />
        ) : null}
        <View style={styles.row}>
          <Text
            size="xs"
            style={styles.preview}
            text={item.latest_message?.body ?? translate('chat.startChatting')}
            numberOfLines={1}
          />
          {item.unread_count > 0 ? (
            <View style={styles.unreadBadge}>
              <Text size="xxs" style={styles.unreadText} text={String(item.unread_count)} />
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Screen preset="fixed" safeAreaEdges={['top']} contentContainerStyle={styles.container}>
      <BackButtom headingTx="chat.messages" onBackPress={goBackToHome} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          style={styles.flatlist}
          contentContainerStyle={styles.contentContainer}
          keyExtractor={item => String(item.id)}
          renderItem={renderConversation}
          refreshing={refreshing}
          onRefresh={() => loadConversations('refresh')}
          ListHeaderComponent={error ? (
            <TouchableOpacity onPress={() => loadConversations('refresh')} style={styles.retry}>
              <Text size="xs" tx="chat.loadConversationsFailed" style={styles.retryText} />
            </TouchableOpacity>
          ) : null}
          ListEmptyComponent={!error ? (
            <View style={styles.center}>
              <Text tx="chat.noChatMessage" size="sm" style={styles.emptyText} />
            </View>
          ) : null}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flatlist: { flex: 1 },
  contentContainer: { flexGrow: 1, paddingTop: spacing.xs, paddingBottom: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  emptyText: { textAlign: 'center', color: colors.textDim },
  retry: { margin: spacing.md, padding: spacing.md, borderRadius: spacing.sm, backgroundColor: colors.palette.dimRed },
  retryText: { color: colors.error, textAlign: 'center' },
  card: {
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  details: { flex: 1, gap: spacing.xxs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs },
  name: { flex: 1 },
  userImage: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryDimmed },
  project: { color: colors.primary },
  preview: { flex: 1, color: colors.textDim },
  time: { color: colors.textDim },
  unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  unreadText: { color: colors.palette.white },
});

export const ChatScreen = Chat;
