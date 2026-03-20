import React, { FC, useState } from 'react';
import {
  FlatList,
  Image,
  ImageStyle,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { AppStackScreenProps } from '../navigators';
import { Screen, Text } from '../components';
import { colors, images, spacing } from '../theme';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { translate } from '../i18n';
import { parseSource } from '../utils/util';

type NavigationProps = AppStackScreenProps<'ChatDetail'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

const sampleChats = [
  {
    _id: '1',
    msg: 'Hey! How are you?',
    sendBy: 2,
    date_created_utc: '2025-01-10T10:15:00Z',
  },
  {
    _id: '2',
    msg: "I'm good! What about you?",
    sendBy: 1,
    date_created_utc: '2025-01-10T10:16:30Z',
  },
  {
    _id: '3',
    msg: 'All good here, heading to the office.',
    sendBy: 2,
    date_created_utc: '2025-01-10T10:17:10Z',
  },
  {
    _id: '4',
    msg: 'Great! Talk later.',
    sendBy: 1,
    date_created_utc: '2025-01-10T10:18:00Z',
  },
  {
    _id: '5',
    msg: 'Sure!',
    sendBy: 2,
    date_created_utc: '2025-01-10T10:18:30Z',
  },
];

const ChatDetail: FC<NavigationProps> = props => {
  const [message, setMessage] = useState('');
  const insets = useSafeAreaInsets();
  //   const trip = props.rideDetails;
  //   const profile = trip?.driver?.profileImage?.link;

  //   useFocusEffect(
  //     useCallback(() => {
  //       if (trip && trip.driver) {
  //         let userId = trip.user._id;
  //         let driverId = trip.driver._id;
  //         Socket.joinChatRoomUser(userId, trip._id);
  //         Socket.getMessagesList({
  //           sender: userId,
  //           receiver: driverId,
  //           orderId: trip._id,
  //         });
  //         return () => Socket.leaveChatRoomUser(userId);
  //       } else {
  //         props.navigation.goBack();
  //       }
  //     }, [props.navigation, trip]),
  //   );

  //   const sendMessageAction = () => {
  //     if (trip && trip.driver) {
  //       let userId = trip.user._id;
  //       let driverId = trip.driver._id;
  //       if (message.trim() === '') {
  //         toast.show(translate('chat.validation'), {type: 'warning'});
  //         return;
  //       }
  //       setMessage('');
  //       Socket.sendMessage({
  //         sender: userId,
  //         receiver: driverId,
  //         orderId: trip._id,
  //         msg: message,
  //         sendBy: 1,
  //       });
  //     } else {
  //       Alert.alert(translate('chat.error'), translate('chat.errorMessage'), [
  //         {
  //           text: translate('common.ok'),
  //           onPress: () => props.navigation.goBack(),
  //         },
  //       ]);
  //     }
  //   };

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      keyboardOffset={-insets.bottom}
      contentContainerStyle={$containerStyle}
    >
      <View style={$header}>
        <TouchableOpacity onPress={props.navigation.goBack} style={$backIcon}>
          <Image source={images.leftArrow} />
        </TouchableOpacity>
        <View style={$userName}>
          <Image
            {...parseSource('https://i.pravatar.cc/300', images.user)}
            style={$profileImage}
          />
          <Text preset="heading" size="lg" style={{ flexShrink: spacing.one }}>
            {'Mandeep Saini'}
          </Text>
        </View>
        <View style={$view} />
      </View>
      <View style={$mainView}>
        <FlatList
          //   data={props.chats}
          data={sampleChats}
          style={$mainViewStyle}
          inverted
          keyExtractor={item => item._id}
          ListEmptyComponent={
            <Text
              tx="chat.noChatMessage"
              preset="subheading"
              size="sm"
              style={$noAddress}
            />
          }
          renderItem={({ item }) => {
            const self = item.sendBy === 1;
            const color = self ? colors.palette.white : colors.text;
            return (
              <View style={self ? $sendMessageRow : $recievedMessageRow}>
                <View style={self ? $sendMessage : $recievedMessage}>
                  <Text style={[$messageText, { color }]}>{item.msg}</Text>
                </View>
                <Text style={$timeText} size="xxs">
                  {moment
                    .utc(item.date_created_utc)
                    .local(false)
                    .format('hh:mm A')}
                </Text>
              </View>
            );
          }}
        />
      </View>
      <View style={$bottomView}>
        <TextInput
          value={message}
          style={$messageInput}
          keyboardType="default"
          onChangeText={setMessage}
          placeholder={translate('chat.messagePlaceholder')}
        />
        <TouchableOpacity
          style={$sendBtn}
          //   onPress={sendMessageAction}
          //   disabled={props.sending}
        >
          <Image source={images.share} />
        </TouchableOpacity>
      </View>
      <View style={[$bottomArea, { height: insets.bottom }]} />
    </Screen>
  );
};

const $containerStyle: ViewStyle = {
  flexGrow: 1,
};

const $view: ViewStyle = {
  width: spacing.xl,
};

const $userName: ViewStyle = {
  gap: spacing.xs,
  flexDirection: 'row',
  alignItems: 'center',
};

const $header: ViewStyle = {
  gap: spacing.sm,
  flexDirection: 'row',
  alignItems: 'center',
  marginVertical: spacing.sm,
  marginHorizontal: spacing.md,
  justifyContent: 'space-between',
};

const $backIcon: ViewStyle = {
  alignSelf: 'flex-end',
  borderRadius: spacing.xl,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.sm + 2,
  backgroundColor: colors.palette.offWhite2,
};

const $profileImage: ImageStyle = {
  height: spacing.xl + spacing.xs,
  width: spacing.xl + spacing.xs,
  borderRadius: spacing.xl,
  marginRight: spacing.sm,
  resizeMode: 'cover',
};

const $mainView: ViewStyle = {
  flex: 1,
  paddingBottom: spacing.xs,
};

const $bottomView: ViewStyle = {
  height: 54,
  borderWidth: 1,
  overflow: 'hidden',
  alignItems: 'center',
  flexDirection: 'row',
  paddingLeft: spacing.sm,
  borderRadius: spacing.xl,
  marginHorizontal: spacing.md,
  borderColor: colors.palette.light,
  shadowColor: colors.palette.black,
  backgroundColor: colors.palette.white,
};

const $messageInput: TextStyle = {
  flex: 1,
  height: 54,
  fontSize: 16,
  color: colors.text,
  borderRadius: spacing.lg,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.xxs,
  backgroundColor: colors.palette.white,
};

const $sendBtn: ViewStyle = {
  marginLeft: spacing.xs,
  marginRight: spacing.sm,
};

const $mainViewStyle: ViewStyle = {
  paddingHorizontal: spacing.md,
};

const $sendMessageRow: ViewStyle = {
  alignItems: 'flex-end',
  marginVertical: spacing.xxs,
  paddingLeft: spacing.lg,
};

const $recievedMessageRow: ViewStyle = {
  alignItems: 'flex-start',
  marginVertical: spacing.xs,
  paddingRight: spacing.lg,
};

const $recievedMessage: ViewStyle = {
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

const $messageText: TextStyle = {
  fontSize: 15,
  fontWeight: '400',
};

const $timeText: TextStyle = {
  textAlign: 'right',
  marginTop: spacing.xxxs,
};

const $bottomArea: ViewStyle = {
  backgroundColor: colors.palette.white,
};

const $noAddress: TextStyle = {
  marginTop: spacing.xxl,
  textAlign: 'center',
};

// const mapStateToProps = (state: RootState) => ({
//   loading: state.auth.createPasswordLoading,
//     rideDetails: state.ride.tripDetail,
//   chats: state.chats,
//   sending: false,
// });

// const connector = connect(mapStateToProps);

export const ChatDetailScreen = ChatDetail;
