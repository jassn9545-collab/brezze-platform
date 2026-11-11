import { Screen, Text, TextField } from '../components';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  
} from 'react-native';
import React, { FC, useState } from 'react';
import {  spacing, colors } from '../theme';
import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';

type NavigationProps = AppBottomTabScreenProps<'Chat'>;

type Message = {
  id: number;
  text: string;
  time: string;
  isOwn: boolean;
};

const Chat: FC<NavigationProps> = () => {
  const [message, setMessage] = useState('');

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Hello! How can I help you today?', time: '10:00 AM', isOwn: false },
    { id: 2, text: 'I need help with electrical work', time: '10:02 AM', isOwn: true },
    { id: 3, text: 'Sure! What type of electrical work do you need?', time: '10:05 AM', isOwn: false },
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
      };
      setMessages([...messages, newMessage]);
      setMessage('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageContainer, item.isOwn && styles.ownMessage]}>
      <Text text={item.text} style={styles.messageText} />
      <Text text={item.time} style={styles.timeText} size="xxs" />
    </View>
  );

  return (
    <Screen preset="fixed" contentContainerStyle={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text tx="chat.title" weight="semiBold" size="lg" />
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, styles.onlineStatus]} />
          <Text tx="chat.online" size="xxs" style={styles.statusText} />
        </View>
      </View>

      {/* MESSAGES */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesList}
        inverted
      />

      {/* INPUT AREA */}
      <View style={styles.inputContainer}>
        <TextField
          value={message}
          onChangeText={setMessage}
          placeholderTx="chat.typeMessage"
          containerStyle={styles.inputContainer}
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text text="➤" style={styles.sendIcon} />
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.palette.jobPostBackground,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.palette.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.palette.borderGray,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  onlineStatus: {
    backgroundColor: colors.palette.green,
  },
  statusText: {
    color: colors.palette.green,
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: spacing.sm,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: spacing.xs,
    padding: spacing.sm,
    borderRadius: 12,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.palette.primaryBlue,
  },
  messageText: {
    color: colors.palette.white,
    marginBottom: 4,
  },
  timeText: {
    color: colors.palette.grayText,
    marginTop: 4,
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.palette.offWhite,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.palette.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sendIcon: {
    fontSize: 16,
    color: colors.palette.white,
  },
});

export const ChatScreen = Chat;