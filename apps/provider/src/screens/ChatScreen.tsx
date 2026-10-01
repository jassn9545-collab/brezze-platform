import React, {FC, useCallback, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import {AppBottomTabScreenProps} from '../navigators';
import {BackButtom, Screen, Text} from '../components';
import {Conversation, getConversations} from '../apis/chat';
import {colors, images, spacing} from '../theme';
import {parseSource} from '../utils/util';
import {useIsForeground} from '../store/hooks';

type Props = AppBottomTabScreenProps<'Chat'>;

const Chat: FC<Props> = props => {
  const isForeground = useIsForeground();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const activeRef = useRef(false);
  const inFlightRef = useRef(false);

  const loadConversations = useCallback(async (mode: 'initial' | 'refresh' | 'poll') => {
    if (inFlightRef.current) {
      return;
    }
    inFlightRef.current = true;
    if (mode === 'initial') {
      setLoading(true);
    } else if (mode === 'refresh') {
      setRefreshing(true);
    }
    try {
      const result = await getConversations();
      if (activeRef.current) {
        setConversations(result);
        setLoadError(false);
      }
    } catch {
      if (activeRef.current && mode !== 'poll') {
        setLoadError(true);
      }
    } finally {
      inFlightRef.current = false;
      if (activeRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isForeground) return;
      activeRef.current = true;
      loadConversations('initial');
      const timer = setInterval(() => loadConversations('poll'), 8000);
      return () => {
        activeRef.current = false;
        clearInterval(timer);
      };
    }, [loadConversations, isForeground]),
  );

  const openConversation = (conversation: Conversation) => {
    props.navigation.navigate('ChatDetail', {conversationId: conversation.id});
  };

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom
        headingTx="chat.messages"
        onBackPress={() => props.navigation.navigate('Home')}
      />
      {loading && conversations.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id.toString()}
          style={styles.flatlist}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => loadConversations('refresh')}
          renderItem={({item}) => (
            <ChatCard conversation={item} onPress={() => openConversation(item)} />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text
                text={loadError ? 'Could not load messages.' : 'No conversations yet.'}
                size="xs"
                style={styles.emptyText}
              />
              {loadError && (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => loadConversations('initial')}
                  style={styles.retry}
                >
                  <Text text="Try Again" size="xs" style={styles.retryText} />
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </Screen>
  );
};

const ChatCard = ({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) => {
  const latest = conversation.latest_message;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={'Chat with ' + conversation.other_user.name}
    >
      <Image
        resizeMode="cover"
        style={styles.userImage}
        {...parseSource(conversation.other_user.profile_image ?? undefined, images.user)}
      />
      <View style={styles.cardBody}>
        <View style={styles.cardHeading}>
          <Text size="sm" weight="semiBold" text={conversation.other_user.name} numberOfLines={1} style={styles.name} />
          <Text size="xxs" style={styles.time} text={latest ? moment(latest.created_at).fromNow() : ''} />
        </View>
        {!!conversation.project_title && (
          <Text size="xxs" style={styles.project} text={conversation.project_title} numberOfLines={1} />
        )}
        <View style={styles.previewRow}>
          <Text
            size="xxs"
            style={styles.preview}
            text={latest?.body ?? 'Start a conversation'}
            numberOfLines={1}
          />
          {conversation.unread_count > 0 && (
            <View style={styles.unreadBadge}>
              <Text
                size="xxs"
                style={styles.unreadText}
                text={conversation.unread_count > 99 ? '99+' : String(conversation.unread_count)}
              />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {flexGrow: 1},
  flatlist: {flex: 1},
  contentContainer: {flexGrow: 1, paddingTop: spacing.md, paddingBottom: spacing.xl},
  center: {flex: 1, minHeight: 180, alignItems: 'center', justifyContent: 'center', padding: spacing.md},
  emptyText: {color: colors.textDim, textAlign: 'center'},
  retry: {marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: spacing.xs, backgroundColor: colors.primary},
  retryText: {color: colors.palette.white},
  card: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderBottomWidth: 1, borderColor: colors.palette.grayLight3, paddingVertical: spacing.md, marginHorizontal: spacing.md},
  userImage: {width: 50, height: 50, borderRadius: 25, backgroundColor: colors.primaryDimmed},
  cardBody: {flex: 1, gap: spacing.xxxs},
  cardHeading: {flexDirection: 'row', alignItems: 'center', gap: spacing.xs},
  name: {flex: 1},
  time: {color: colors.textDim},
  project: {color: colors.primary},
  previewRow: {flexDirection: 'row', alignItems: 'center', gap: spacing.xs},
  preview: {flex: 1, color: colors.textDim},
  unreadBadge: {minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 4, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center'},
  unreadText: {color: colors.palette.white},
});

export const ChatScreen = Chat;
