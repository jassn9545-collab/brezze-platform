// import React, { FC, useMemo } from 'react';
// import { Button, Screen, Text } from '../components';
// import { ConnectedProps, connect } from 'react-redux';
// import { RootState } from '../store';
// import {
//   Image,
//   Platform,
//   Share,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { colors, images, spacing } from '../theme';
// import { translate } from '../i18n';
// import { AppStackScreenProps } from '../navigators';
// import Header from '../components/Header';
// import { commonStyle } from '../theme/style';
// import { scale } from 'react-native-size-matters';
// import Clipboard from '@react-native-clipboard/clipboard';

// type NavigationProps = AppStackScreenProps<'InviteFriends'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

// const InviteFriends: FC<Props> = props => {
//   const applink = useMemo(() => {
//     return Platform.select({
//       ios: props.iOSAppLink === '' ? 'N/A' : props.iOSAppLink,
//       android: props.androidAppLink === '' ? 'N/A' : props.androidAppLink,
//     });
//   }, [props.androidAppLink, props.iOSAppLink]);

//   return (
//     <Screen
//       contentContainerStyle={styles.container}
//       backgroundColor={colors.primary}
//     >
//       <Header
//         styleHeader={{ backgroundColor: colors.primary }}
//         headingTx="invite.heading"
//         styleHeading={{ color: colors.palette.white }}
//         tintColor={colors.palette.white}
//       />
//       <Image source={images.invite} style={styles.invite} />

//       <View style={styles.main}>
//         <View style={[styles.wrapContent, commonStyle.lightShadow]}>
//           <Text
//             tx="invite.inviteFriends"
//             size="lg"
//             weight="bold"
//             style={styles.headings}
//           />
//           <Text
//             tx="invite.message"
//             size="sm"
//             weight="medium"
//             style={styles.message}
//           />
//           <View style={styles.wrapInvitedCode}>
//             <Text
//               text={props.inviteCode ?? 'E D D D D'}
//               size="lg"
//               weight="bold"
//               style={{ color: colors.primary }}
//             />
//             <TouchableOpacity
//               onPressIn={async () => {
//                 Clipboard.setString(props.inviteCode ?? '');
//                 const text = await Clipboard.getString();
//                 toast.show(`Copied ${text}`, { type: 'success' });
//               }}
//             >
//               <Image source={images.copy} />
//             </TouchableOpacity>
//           </View>
//           <Text
//             style={styles.invitedCode}
//             tx="invite.invitedCode"
//             size="xs"
//             weight="medium"
//           />

//           {/* <TextField
//             onPressIn={async () => {
//               Clipboard.setString(props.inviteCode ?? '');
//               const text = await Clipboard.getString();
//               toast.show(`Copied ${text}`, { type: 'success' });
//             }}
//             editable={false}
//             value={props.inviteCode}
//             containerStyle={styles.code}
//           /> */}
//           <Button
//             tx="invite.button"
//             onPress={() => {
//               Share.share({
//                 message: translate('invite.inviteMessage', {
//                   code: props.inviteCode,
//                   url: applink,
//                 }),
//               });
//             }}
//           />
//         </View>
//       </View>
//     </Screen>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//   },
//   invite: {
//     alignSelf: 'center',
//     marginVertical: spacing.md,
//   },
//   main: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: colors.background,
//   },
//   wrapContent: {
//     flex: 1,
//     justifyContent: 'center',
//     backgroundColor: colors.background,
//     marginHorizontal: spacing.md,
//     padding: spacing.md,
//     borderRadius: spacing.md,
//     position: 'absolute',
//     top: -scale(15),
//   },
//   menuIcon: {
//     marginTop: spacing.sm,
//     marginLeft: spacing.md,
//   },
//   heading: {
//     fontSize: 32,
//     lineHeight: 40,
//     margin: spacing.md,
//   },
//   headings: {
//     textAlign: 'center',
//     marginTop: spacing.xl,
//     marginBottom: spacing.sm,
//   },
//   message: {
//     alignItems: 'center',
//     textAlign: 'center',
//     marginHorizontal: spacing.md,
//     color: colors.palette.grayLight,
//     marginBottom: spacing.sm,
//   },
//   wrapInvitedCode: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: spacing.xs,
//     justifyContent: 'center',
//   },
//   invitedCode: {
//     textAlign: 'center',
//     marginBottom: spacing.md,
//     marginTop: spacing.xxs,
//     color: colors.palette.grayLight,
//   },
// });

// const mapStateToProps = (state: RootState) => ({
//   inviteCode: state.auth.myProfile?.referralCode,
//   test: state.setting.basic?.appUrl,
//   appUrl: state.setting.basic?.appUrl ?? '',
//   iOSAppLink: state.setting.basic?.appUrl.customer_ios_app,
//   androidAppLink: state.setting.basic?.appUrl.customer_android_app,
// });

// const mapDispatch = {};
// const connector = connect(mapStateToProps, mapDispatch);

// export const InviteFriendsScreen = connector(InviteFriends);
