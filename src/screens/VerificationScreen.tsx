// import {
//   Button,
//   Loader,
//   Screen,
//   Text,
//   TextField,
//   TextFieldAccessoryProps,
// } from '../components';
// import {
//   Image,
//   Keyboard,
//   TextStyle,
//   TouchableOpacity,
//   View,
//   ViewStyle,
// } from 'react-native';
// import React, { FC, useCallback, useEffect, useState } from 'react';
// import { colors, images, spacing } from '../theme';

// import { AuthStackScreenProps } from '../navigators';
// import { TxKeyPath } from '../i18n';
// import { useFocusEffect } from '@react-navigation/native';
// import { RootState } from '../store';
// import {
//   authActions,
//   resendOTP,
//   resendUserVerifyOTP,
//   userVerification,
//   UserVerificationParam,
//   verifyOTP,
//   VerifyOTPParam,
// } from '../slices/auth.slice';
// import { connect, ConnectedProps } from 'react-redux';

// type NavigationProps = AuthStackScreenProps<'Verification'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

// type FieldError = {
//   otpInput?: TxKeyPath | undefined;
// };

// let timerOn = false;
// let timeout: ReturnType<typeof setTimeout>;

// const phoneLeftAccessory = (props: TextFieldAccessoryProps) => {
//   return (
//     <View style={props.style}>
//       <Image tintColor={colors.palette.grayLight2} source={images.callIcon} />
//     </View>
//   );
// };

// export type VerificationParams = {
//   countryCode: string;
//   mobile: string;
//   serviceSid: string;
//   user_id: number;
//   from: 'forgotPassword' | 'signup';
// };

// const Verification: FC<Props> = props => {
//   const params = props.route.params as VerificationParams;
//   const [otpInput, setOtpInput] = useState<string>('');
//   const [error, setError] = useState<FieldError>({});
//   const [wait, setWait] = useState('00:00');
//   const [countDown, setCountDown] = useState(30);

//   useFocusEffect(
//     useCallback(() => {
//       setCountDown(30);
//       timerOn = true;
//       timer(30);
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []),
//   );

//   useEffect(() => {
//     return () => clearTimeout(timeout);
//   }, []);

//   const timer = (remaining: number) => {
//     const m = Math.floor(remaining / 60);
//     const s = remaining % 60;

//     const minute = m < 10 ? '0' + m : m.toString();
//     const second = s < 10 ? '0' + s : s.toString();
//     setWait(minute + ':' + second);
//     remaining -= 1;

//     if (remaining >= 0 && timerOn) {
//       timeout = setTimeout(function () {
//         timer(remaining);
//       }, 1000);
//       return;
//     }
//     timerOn = false;
//     setCountDown(countDown === 120 ? countDown : countDown * 2);
//   };

//   const onPressClose = () => {
//     props.navigation.goBack();
//   };

//   useEffect(() => {
//     if (props.verifyLoading === 'loaded') {
//       props.clearUserVerification();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [props.verifyLoading]);

//   useEffect(() => {
//     if (props.loading === 'loaded') {
//       props.resetVerifyOtp();
//       if (props.route.params.from === 'forgotPassword') {
//         props.navigation.replace('ResetPassword', {
//           user_id: params.user_id,
//         });
//       }
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [props.loading]);

//   return (
//     <Screen
//       preset="auto"
//       contentContainerStyle={$container}
//       backgroundColor={colors.palette.overlay50}
//     >
//       <TouchableOpacity style={$topTap} onPress={onPressClose} />
//       <View style={$main}>
//         <View style={$header}>
//           <Text
//             tx="verification.heading"
//             style={$primaryColor}
//             weight="regular"
//             size="xl"
//           />
//           <TouchableOpacity style={$wrapCrossIcon} onPress={onPressClose}>
//             <Image source={images.crossIcon} />
//           </TouchableOpacity>
//         </View>
//         <Text style={$description}>
//           <Text
//             tx="verification.description"
//             size="sm"
//             weight="medium"
//             style={$whiteColor}
//           />
//           <Text
//             text={ '+' + params.countryCode + ' ' + params.mobile}
//             size="sm"
//             weight="medium"
//             style={$primaryColor}
//           />
//         </Text>
//         <TextField
//           value={otpInput}
//           onChangeText={setOtpInput}
//           labelTx="verification.enterOTP"
//           placeholderTx="verification.enterOTPPlaceholder"
//           keyboardType="phone-pad"
//           inputWrapperStyle={$textInputContainer}
//           style={{ color: colors.palette.white }}
//           LabelTextProps={{ style: { color: colors.palette.lightGray1 } }}
//           LeftAccessory={phoneLeftAccessory}
//           helperTx={error?.otpInput}
//           status={error?.otpInput ? 'error' : undefined}
//           maxLength={6}
//         />
//         <View style={$resendOTPContainer}>
//           <Text
//             tx="verification.resendCode"
//             size="sm"
//             weight="regular"
//             style={timerOn ? $whiteColor : $resendButton}
//             disabled={timerOn}
//             onPress={() => {
//               timerOn = true;
//               timer(countDown);
//               if (props.route.params.from === 'signup') {
//                 props.resendUserVerifyOTP({
//                   user_id: params.user_id,
//                 });
//               } else {
//                 props.resendUserVerifyOTP({
//                   user_id: params.user_id,
//                 });
//               }
//             }}
//           />
//           {timerOn && (
//             <Text size="sm" weight="regular" style={$whiteColor} text={wait} />
//           )}
//         </View>

//         <Button
//           tx="verification.submit"
//           onPress={() => {
//             if (otpInput.length === 6) {
//               Keyboard.dismiss();
//               setError({});
//               if (props.route.params.from === 'forgotPassword') {
//                 props.verifyOTP({
//                   user_id: params.user_id,
//                   otp: otpInput,
//                   serviceSid: params.serviceSid,
//                 })
//               } else {
//                 props.userVerification({
//                   serviceSid: params.serviceSid,
//                   otp: otpInput,
//                   user_id: params.user_id,
//                 });
//               }
//             } else {
//               setError({
//                 otpInput: 'validation.required',
//               });
//             }
//           }}
//           style={$buttonStyle}
//         />
//       </View>
//       <Loader
//         loading={
//           props.verifyLoading === 'loading' ||
//           props.resendVerifyOTPLoading === 'loading' ||
//           props.loading === 'loading'
//         }
//       />
//     </Screen>
//   );
// };

// const $topTap: ViewStyle = {
//   flex: 1,
// };

// const $container: ViewStyle = {
//   flex: 1,
//   justifyContent: 'flex-end',
// };

// const $main: ViewStyle = {
//   gap: spacing.xs,
//   paddingVertical: spacing.xl,
//   paddingHorizontal: spacing.xs,
//   borderTopEndRadius: spacing.xl,
//   borderTopStartRadius: spacing.xl,
//   backgroundColor: colors.palette.black,
// };

// const $header: ViewStyle = {
//   alignItems: 'center',
//   flexDirection: 'row',
//   marginBottom: spacing.xs,
//   paddingHorizontal: spacing.md,
//   justifyContent: 'space-between',
// };

// const $wrapCrossIcon: ViewStyle = {
//   padding: spacing.xs,
//   borderRadius: spacing.md,
//   backgroundColor: colors.primary,
// };

// const $description: TextStyle = {
//   marginBottom: spacing.md,
//   paddingHorizontal: spacing.md,
// };

// const $primaryColor: TextStyle = {
//   color: colors.primary,
// };

// const $whiteColor: TextStyle = {
//   color: colors.palette.white,
// };

// const $textInputContainer: ViewStyle = {
//   marginBottom: spacing.xs,
//   borderColor: colors.palette.grayLight,
//   backgroundColor: colors.palette.black,
// };

// const $buttonStyle: ViewStyle = {
//   marginTop: spacing.sm,
//   marginHorizontal: spacing.md,
// };

// const $resendOTPContainer: ViewStyle = {
//   alignItems: 'center',
//   flexDirection: 'row',
//   marginVertical: spacing.sm,
//   paddingHorizontal: spacing.md,
//   justifyContent: 'space-between',
// };

// const $resendButton: TextStyle = {
//   textDecorationLine: 'underline',
//   color: colors.palette.white,
// };

// const mapStateToProps = (state: RootState) => ({
//   loading: state.auth.verifyOTPLoading,
//   // data: state.auth.otpResponse,
//   resendVerifyOTPLoading: state.auth.resendVerifyOTPLoading,
//   verifyLoading: state.auth.userVerificationLoading,
// });

// const mapDispatch = {
//   resendOTP: (params: UserVerificationParam) => resendOTP(params),
//   verifyOTP: (params: VerifyOTPParam) => verifyOTP(params),
//   resetVerifyOtp: () => authActions.resetVerifyOTPLoading(),
//   userVerification: (params: UserVerificationParam) => userVerification(params),
//   resendUserVerifyOTP: (params: UserVerificationParam) =>
//     resendUserVerifyOTP(params),
//   clearUserVerification: () => authActions.resetUserVerificationLoading(),
// };

// const connector = connect(mapStateToProps, mapDispatch);

// export const VerificationScreen = connector(Verification);
