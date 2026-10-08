import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import moment from 'moment';
import {AppStackScreenProps} from '../navigators';
import {Screen, Text} from '../components';
import {
  ChatMessage,
  Conversation,
  getConversationMessages,
  getOrCreateConversation,
  sendConversationMessage,
} from '../apis/chat';
import {useAppSelector, useIsForeground} from '../store/hooks';
import {colors, images, spacing} from '../theme';
import {translate} from '../i18n';
import {parseSource} from '../utils/util';
import {subscribeToConversation} from '../utils/realtime';

type Props = AppStackScreenProps<'ChatDetail'>;

const ChatDetail: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  const isForeground = useIsForeground();
  const ownUserId = useAppSelector(state => state.auth.myProfile?.user?.id);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [sending, setSending] = useState(false);
  const [realtimeConversationId, setRealtimeConversationId] = useState<number | null>(
    props.route.params.conversationId ?? null,
  );
  const conversationIdRef = useRef<number | null>(
    props.route.params.conversationId ?? null,
  );
  const activeRef = useRef(false);
  const fetchingRef = useRef(false);
  const latestMessageIdRef = useRef(0);

  const loadMessages = useCallback(async (showError: boolean) => {
    const id = conversationIdRef.current;
    if (!id || fetchingRef.current) {
      return;
    }
    fetchingRef.current = true;
    try {
      const result = await getConversationMessages(
        id,
        showError ? undefined : latestMessageIdRef.current,
      );
      if (activeRef.current) {
        latestMessageIdRef.current = Math.max(
          latestMessageIdRef.current,
          ...result.messages.map(item => item.id),
        );
        setConversation(result.conversation);
        setMessages(current => {
          const merged = new Map<number, ChatMessage>();
          current.forEach(item => merged.set(item.id, item));
          result.messages.forEach(item => merged.set(item.id, item));
          return [...merged.values()].sort(
            (a, b) =>
              Date.parse(a.created_at) - Date.parse(b.created_at) || a.id - b.id,
          );
        });
        setLoadError(false);
      }
    } catch {
      if (activeRef.current && showError) {
        setLoadError(true);
      }
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  const initialize = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      if (!conversationIdRef.current && props.route.params.projectId) {
        const created = await getOrCreateConversation(props.route.params.projectId);
        conversationIdRef.current = created.id;
        setRealtimeConversationId(created.id);
        if (activeRef.current) {
          setConversation(created);
        }
      }
      if (!conversationIdRef.current) {
        throw new Error('Conversation unavailable');
      }
      await loadMessages(true);
    } catch {
      if (activeRef.current) {
        setLoadError(true);
      }
    } finally {
      if (activeRef.current) {
        setLoading(false);
      }
    }
  }, [loadMessages, props.route.params.projectId]);

  useEffect(() => {
    if (!isForeground || !realtimeConversationId) return;
    return subscribeToConversation(realtimeConversationId, incoming => {
      if (!activeRef.current) return;
      latestMessageIdRef.current = Math.max(latestMessageIdRef.current, incoming.id);
      setMessages(current => {
        const merged = new Map(current.map(item => [item.id, item]));
        merged.set(incoming.id, incoming);
        return [...merged.values()].sort(
          (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at) || a.id - b.id,
        );
      });
    });
  }, [isForeground, realtimeConversationId]);

  useFocusEffect(
    useCallback(() => {
      if (!isForeground) return;
      activeRef.current = true;
      initialize();
      const timer = setInterval(() => loadMessages(false), 30000);
      return () => {
        activeRef.current = false;
        clearInterval(timer);
      };
    }, [initialize, isForeground, loadMessages]),
  );

  const sendMessage = async () => {
    const body = message.trim();
    const id = conversationIdRef.current;
    if (!body || !id || sending) {
      return;
    }
    setSending(true);
    try {
      const sent = await sendConversationMessage(id, body);
      if (activeRef.current) {
        setMessages(current =>
          current.some(item => item.id === sent.id) ? current : [...current, sent],
        );
        setMessage(current => current.trim() === body ? '' : current);
      }
    } catch {
      // Keep the draft so the user can retry. The API interceptor shows the error.
    } finally {
      if (activeRef.current) {
        setSending(false);
      }
    }
  };

  const visibleMessages = [...messages].reverse();

  return (
    <Screen
      preset="fixed"
      style={styles.screen}
      safeAreaEdges={['top']}
      keyboardAvoidingViewProps={Platform.OS === 'android' ? {behavior: undefined} : undefined}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => props.navigation.goBack()}
          style={styles.backIcon}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Image source={images.leftArrow} />
        </TouchableOpacity>
        <View style={styles.userName}>
          <Image
            {...parseSource(conversation?.other_user.profile_image ?? undefined, images.user)}
            style={styles.profileImage}
          />
          <View style={styles.headerText}>
            <Text
              size="sm"
              weight="semiBold"
              text={conversation?.other_user.name ?? translate('chat.messages')}
              numberOfLines={1}
            />
            {!!conversation?.project_title && (
              <Text
                size="xxs"
                style={styles.projectTitle}
                text={conversation.project_title}
                numberOfLines={1}
              />
            )}
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      <View style={styles.mainView}>
        {loading && messages.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : loadError && messages.length === 0 ? (
          <View style={styles.center}>
            <Text text="Could not load this conversation." size="xs" style={styles.stateText} />
            <TouchableOpacity onPress={initialize} style={styles.retry} accessibilityRole="button">
              <Text text="Try Again" size="xs" style={styles.retryText} />
            </TouchableOpacity>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.center}>
            <Text tx="chat.noChatMessage" size="xs" style={styles.stateText} />
          </View>
        ) : (
          <FlatList
            data={visibleMessages}
            keyExtractor={item => item.id.toString()}
            inverted
            style={styles.messageList}
            contentContainerStyle={styles.messageContent}
            keyboardShouldPersistTaps="handled"
            renderItem={({item}) => {
              const self = Number(item.sender_id) === Number(ownUserId);
              return (
                <View style={self ? styles.sentRow : styles.receivedRow}>
                  <View style={self ? styles.sentBubble : styles.receivedBubble}>
                    <Text
                      text={item.body}
                      size="xs"
                      style={self ? styles.sentText : styles.receivedText}
                    />
                  </View>
                  <Text
                    size="xxs"
                    style={styles.timeText}
                    text={moment(item.created_at).format('hh:mm A')}
                  />
                </View>
              );
            }}
          />
        )}
      </View>
      <View style={styles.bottomView}>
        <TextInput
          value={message}
          style={styles.messageInput}
          onChangeText={setMessage}
          placeholder={translate('chat.messagePlaceholder')}
          placeholderTextColor={colors.textDim}
          multiline
          maxLength={5000}
          accessibilityLabel="Message"
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={sendMessage}
          disabled={sending || !message.trim() || !conversationIdRef.current}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Image
              source={images.share}
              style={[
                styles.sendIcon,
                !message.trim() || !conversationIdRef.current ? styles.disabledSend : undefined,
              ]}
            />
          )}
        </TouchableOpacity>
      </View>
      <View style={{height: insets.bottom, backgroundColor: colors.palette.white}} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {height: 'auto'},
  container: {flex: 1},
  header: {flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.sm, marginHorizontal: spacing.md},
  backIcon: {borderRadius: spacing.xl, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm + 2, backgroundColor: colors.palette.offWhite2},
  userName: {flex: 1, gap: spacing.xs, flexDirection: 'row', alignItems: 'center'},
  profileImage: {height: 40, width: 40, borderRadius: 20, resizeMode: 'cover'},
  headerText: {flex: 1},
  projectTitle: {color: colors.textDim},
  headerSpacer: {width: spacing.xl},
  mainView: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.md},
  stateText: {textAlign: 'center', color: colors.textDim},
  retry: {marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: spacing.xs, backgroundColor: colors.primary},
  retryText: {color: colors.palette.white},
  messageList: {flex: 1},
  messageContent: {paddingHorizontal: spacing.md, paddingVertical: spacing.sm},
  sentRow: {alignItems: 'flex-end', marginVertical: spacing.xxs, paddingLeft: spacing.lg},
  receivedRow: {alignItems: 'flex-start', marginVertical: spacing.xxs, paddingRight: spacing.lg},
  sentBubble: {borderRadius: spacing.md, borderTopRightRadius: 0, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, backgroundColor: colors.primary},
  receivedBubble: {borderRadius: spacing.md, borderBottomLeftRadius: 0, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, backgroundColor: colors.palette.offWhite2},
  sentText: {color: colors.palette.white},
  receivedText: {color: colors.text},
  timeText: {marginTop: spacing.xxxs, color: colors.textDim},
  bottomView: {minHeight: 56, maxHeight: 120, borderWidth: 1, alignItems: 'center', flexDirection: 'row', paddingLeft: spacing.sm, borderRadius: spacing.xl, marginHorizontal: spacing.md, marginBottom: spacing.xs, borderColor: colors.palette.light, backgroundColor: colors.palette.white},
  messageInput: {flex: 1, minWidth: 0, minHeight: 52, maxHeight: 118, fontSize: 16, color: colors.text, paddingHorizontal: spacing.md, paddingVertical: spacing.xs},
  sendBtn: {width: 48, height: 48, marginLeft: spacing.xs, marginRight: spacing.sm, alignItems: 'center', justifyContent: 'center'},
  sendIcon: {width: 44, height: 44, resizeMode: 'contain'},
  disabledSend: {opacity: 0.4},
});

export const ChatDetailScreen = ChatDetail;
