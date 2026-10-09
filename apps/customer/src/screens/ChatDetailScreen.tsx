import React, { FC, useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
  Image,
  ImageStyle,
  Platform,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatConversation, ChatMessage, getChatMessages, sendChatMessage } from '../apis/chat';
import { AppStackScreenProps } from '../navigators';
import { Screen, Text } from '../components';
import { colors, images, spacing } from '../theme';
import { translate } from '../i18n';
import { parseSource } from '../utils/util';
import { useAppSelector, useIsForeground } from '../store/hooks';
import { subscribeToConversation } from '../utils/realtime';
import { CHAT_PUSH_EVENT } from '../utils/Firebase';

type Props = AppStackScreenProps<'ChatDetail'>;

const ChatDetail: FC<Props> = ({ navigation, route }) => {
  const { conversationId, participantName, participantImage } = route.params;
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [sendError, setSendError] = useState(false);
  const focused = useRef(false);
  const inFlight = useRef(false);
  const hasLoaded = useRef(false);
  const newestMessageId = useRef<number | null>(null);
  const autoRefreshEnabled = useRef(true);
  const insets = useSafeAreaInsets();
  const ownUserId = useAppSelector(state => state.auth.myProfile?.user?.id);
  const isForeground = useIsForeground();

  const loadMessages = useCallback(async (mode: 'initial' | 'refresh' | 'silent') => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (mode === 'initial' && !hasLoaded.current) setLoading(true);
    if (mode === 'refresh') setRefreshing(true);

    try {
      const result = await getChatMessages(
        conversationId,
        mode === 'silent' ? newestMessageId.current ?? undefined : undefined,
      );
      if (focused.current) {
        setConversation(result.conversation);
        result.messages.forEach(item => {
          newestMessageId.current = Math.max(newestMessageId.current ?? 0, item.id);
        });
        setMessages(previous => {
          const byId = new Map(previous.map(item => [item.id, item]));
          result.messages.forEach(item => byId.set(item.id, item));
          return Array.from(byId.values()).sort((a, b) => b.id - a.id);
        });
        setLoadError(false);
        hasLoaded.current = true;
        autoRefreshEnabled.current = true;
      }
    } catch {
      autoRefreshEnabled.current = false;
      if (focused.current) setLoadError(true);
    } finally {
      inFlight.current = false;
      if (focused.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [conversationId]);

  useFocusEffect(useCallback(() => {
    if (!isForeground) return;
    focused.current = true;
    autoRefreshEnabled.current = true;
    loadMessages('initial');
    const unsubscribe = subscribeToConversation(conversationId, incoming => {
      if (!focused.current) return;
      newestMessageId.current = Math.max(newestMessageId.current ?? 0, incoming.id);
      setMessages(previous => [incoming, ...previous.filter(item => item.id !== incoming.id)]);
    });
    const pushSubscription = DeviceEventEmitter.addListener(
      CHAT_PUSH_EVENT,
      ({conversationId: pushedConversationId}: {conversationId: number}) => {
        if (pushedConversationId === conversationId) loadMessages('silent');
      },
    );
    const interval = setInterval(() => {
      if (autoRefreshEnabled.current) loadMessages('silent');
    }, 2500);
    return () => {
      focused.current = false;
      unsubscribe();
      pushSubscription.remove();
      clearInterval(interval);
    };
  }, [loadMessages, isForeground]));

  const onSend = async () => {
    const body = message.trim();
    if (!body || sending) return;
    setSending(true);
    setSendError(false);
    try {
      const sent = await sendChatMessage(conversationId, body);
      setMessages(previous => [sent, ...previous.filter(item => item.id !== sent.id)]);
      setMessage('');
      autoRefreshEnabled.current = true;
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  };

  const name = conversation?.other_user.name ?? participantName;
  const image = conversation?.other_user.profile_image ?? participantImage;
  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('BottomTab', { screen: 'Chat' });
    }
  };

  return (
    <Screen
      preset="fixed"
      style={$screenStyle}
      safeAreaEdges={['top']}
      keyboardAvoidingViewProps={Platform.OS === 'android' ? { behavior: undefined } : undefined}
      contentContainerStyle={$containerStyle}
    >
      <View style={$header}>
        <TouchableOpacity onPress={goBack} style={$backIcon} accessibilityRole="button" accessibilityLabel="Back">
          <Image source={images.leftArrow} style={$backImage} />
        </TouchableOpacity>
        <View style={$userName}>
          <Image
            {...parseSource(image ?? undefined, images.user)}
            style={$profileImage}
          />
          <View style={$nameBlock}>
            <Text preset="heading" size="lg" numberOfLines={1} text={name} />
            {conversation?.project_title ? (
              <Text size="xxs" numberOfLines={1} text={conversation.project_title} style={$projectTitle} />
            ) : null}
          </View>
        </View>
      </View>
      {loadError ? (
        <TouchableOpacity style={$errorBanner} onPress={() => loadMessages('refresh')}>
          <Text size="xs" tx="chat.loadMessagesFailed" style={$errorText} />
        </TouchableOpacity>
      ) : null}
      <View style={$mainView}>
        {loading ? (
          <View style={$center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={messages}
            style={$mainViewStyle}
            contentContainerStyle={$messageListContent}
            inverted
            keyboardShouldPersistTaps="handled"
            keyExtractor={item => String(item.id)}
            refreshing={refreshing}
            onRefresh={() => loadMessages('refresh')}
            ListEmptyComponent={!loadError ? (
              <Text tx="chat.noChatMessage" preset="subheading" size="sm" style={$noMessages} />
            ) : null}
            renderItem={({ item }) => {
              const self = item.sender_id === ownUserId;
              return (
                <View style={self ? $sendMessageRow : $receivedMessageRow}>
                  <View style={self ? $sendMessage : $receivedMessage}>
                    <Text style={[$messageText, self ? $ownMessageText : $otherMessageText]} text={item.body} />
                  </View>
                  <Text style={$timeText} size="xxs" text={moment(item.created_at).format('hh:mm A')} />
                </View>
              );
            }}
          />
        )}
      </View>
      {sendError ? (
        <Text size="xxs" tx="chat.sendFailed" style={$sendError} />
      ) : null}
      <View style={$bottomView}>
        <TextInput
          value={message}
          style={$messageInput}
          onChangeText={text => {
            setMessage(text);
            if (sendError) setSendError(false);
          }}
          onSubmitEditing={onSend}
          placeholder={translate('chat.typeMessage')}
          editable={!sending}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[$sendBtn, (!message.trim() || sending) && $sendBtnDisabled]}
          onPress={onSend}
          disabled={!message.trim() || sending}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {sending ? <ActivityIndicator size="small" color={colors.primary} /> : <Image source={images.share} style={$sendIcon} />}
        </TouchableOpacity>
      </View>
      <View style={[$bottomArea, { height: insets.bottom }]} />
    </Screen>
  );
};

const $screenStyle: ViewStyle = { height: 'auto' };
const $containerStyle: ViewStyle = { flex: 1 };
const $header: ViewStyle = {
  gap: spacing.sm,
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: spacing.sm,
  marginHorizontal: spacing.md,
};
const $backIcon: ViewStyle = {
  borderRadius: spacing.xl,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.sm + 2,
  backgroundColor: colors.palette.offWhite2,
};
const $backImage: ImageStyle = { width: 17, height: 12, tintColor: colors.text };
const $userName: ViewStyle = { flex: 1, gap: spacing.xs, flexDirection: 'row', alignItems: 'center' };
const $nameBlock: ViewStyle = { flex: 1 };
const $projectTitle: TextStyle = { color: colors.textDim };
const $profileImage: ImageStyle = {
  height: spacing.xl + spacing.xs,
  width: spacing.xl + spacing.xs,
  borderRadius: spacing.xl,
  resizeMode: 'cover',
};
const $mainView: ViewStyle = { flex: 1, paddingBottom: spacing.xs };
const $center: ViewStyle = { flex: 1, alignItems: 'center', justifyContent: 'center' };
const $bottomView: ViewStyle = {
  height: 56,
  borderWidth: 1,
  alignItems: 'center',
  flexDirection: 'row',
  paddingLeft: spacing.sm,
  paddingRight: 4,
  borderRadius: spacing.xl,
  marginHorizontal: spacing.md,
  marginBottom: spacing.xs,
  borderColor: colors.palette.light,
  backgroundColor: colors.palette.white,
};
const $messageInput: TextStyle = {
  flex: 1,
  minWidth: 0,
  height: 52,
  fontSize: 16,
  color: colors.text,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xxs,
};
const $sendBtn: ViewStyle = { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' };
const $sendIcon: ImageStyle = { width: 44, height: 44 };
const $sendBtnDisabled: ViewStyle = { opacity: 0.5 };
const $mainViewStyle: ViewStyle = { paddingHorizontal: spacing.md };
const $messageListContent: ViewStyle = { flexGrow: 1, paddingVertical: spacing.sm };
const $sendMessageRow: ViewStyle = { alignItems: 'flex-end', marginVertical: spacing.xxs, paddingLeft: spacing.lg };
const $receivedMessageRow: ViewStyle = { alignItems: 'flex-start', marginVertical: spacing.xs, paddingRight: spacing.lg };
const $receivedMessage: ViewStyle = {
  borderRadius: spacing.md,
  borderBottomStartRadius: 0,
  paddingVertical: spacing.xs,
  backgroundColor: colors.palette.offWhite2,
  paddingHorizontal: spacing.md + spacing.xxs,
};
const $sendMessage: ViewStyle = {
  borderTopRightRadius: 0,
  borderRadius: spacing.md,
  paddingVertical: spacing.xs,
  backgroundColor: colors.primary,
  paddingHorizontal: spacing.md + spacing.xxs,
};
const $messageText: TextStyle = { fontSize: 15 };
const $ownMessageText: TextStyle = { color: colors.palette.white };
const $otherMessageText: TextStyle = { color: colors.text };
const $timeText: TextStyle = { textAlign: 'right', marginTop: spacing.xxxs };
const $bottomArea: ViewStyle = { backgroundColor: colors.palette.white };
const $noMessages: TextStyle = { textAlign: 'center', marginTop: spacing.xxl };
const $errorBanner: ViewStyle = { padding: spacing.sm, marginHorizontal: spacing.md, backgroundColor: colors.palette.dimRed, borderRadius: spacing.xs };
const $errorText: TextStyle = { color: colors.error, textAlign: 'center' };
const $sendError: TextStyle = { color: colors.error, marginHorizontal: spacing.md, marginBottom: spacing.xxs };

export const ChatDetailScreen = ChatDetail;
