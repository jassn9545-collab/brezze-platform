// import {
//   AuthHeader,
//   Button,
//   Country,
//   CountryPickerModal,
//   Loader,
//   Screen,
// } from '../components';
// import { Keyboard, View, ViewStyle } from 'react-native';
// import React, { FC, useEffect, useState } from 'react';
// import { TextField } from '../components/TextField';
// import { buildError, forgotPasswordSchema } from '../apis/schema';
// import { spacing } from '../theme';

// import { AuthStackScreenProps } from '../navigators';
// import { TxKeyPath } from '../i18n';
// import { DefaultCountry } from '../config/defaults';
// import { phoneLeftAccessory } from './LoginScreen';
// import { useAppDispatch, useAppSelector } from '../store/hooks';
// import { authActions, forgotPassword } from '../slices/auth.slice';

// type Props = AuthStackScreenProps<'ForgotPassword'>;

// type FieldError = {
//   phone?: TxKeyPath | undefined;
// };

// const ForgotPassword: FC<Props> = () => {
//   const dispatch = useAppDispatch();
//   const loadingState = useAppSelector(
//     store => store.auth.forgotPasswordLoading,
//   );

//   const [mobile, setMobile] = useState('');
//   const [country, setCountry] = useState<Country>(DefaultCountry);
//   const [showCountries, setShowCountries] = useState<boolean>(false);
//   const [error, setError] = useState<FieldError>({});

//   useEffect(() => {
//     if (loadingState === 'loaded') {
//       dispatch(authActions.resetForgotPasswordLoading());
//     }
//   }, [dispatch, loadingState]);

//   const validate = () => {
//     forgotPasswordSchema
//       .validate(
//         {
//           phone: mobile,
//           country_code: country.dial_code,
//           country: country.code,
//         },
//         { abortEarly: false },
//       )
//       .then(res => {
//         Keyboard.dismiss();
//         console.log('res', res);
//         dispatch(forgotPassword(res));
//         setError({});
//       })
//       .catch(errors => {
//         const err = buildError<FieldError>(errors);
//         setError(err);
//       });
//   };

//   return (
//     <>
//       <Screen
//         preset="auto"
//         contentContainerStyle={$containerStyle}
//         safeAreaEdges={['top']}
//       >
//         <AuthHeader tx="forgotPassword.forgotPassword" />
//         <View style={$main}>
//           <TextField
//             value={mobile ? `${country.dial_code} ${mobile}` : ''}
//             onChangeText={text => {
//               const dialCode = country.dial_code.replace('+', '\\+');
//               const cleaned = text
//                 .replace(new RegExp(`^${dialCode}\\s?`), '')
//                 .replace(/\D/g, '');
//               setMobile(cleaned);
//             }}
//             containerStyle={$inputContainer}
//             labelTx="forgotPassword.mobileNumber"
//             keyboardType="number-pad"
//             placeholderTx="forgotPassword.mobilePlaceholder"
//             returnKeyType="done"
//             LeftAccessory={phoneLeftAccessory}
//             helperTx={error?.phone}
//             status={error?.phone ? 'error' : undefined}
//           />

//           <Button
//             tx="forgotPassword.send"
//             onPress={validate}
//             style={$buttonStyle}
//           />
//         </View>
//       </Screen>
//         <Loader loading={loadingState === 'loading'} />
//       <CountryPickerModal
//         onSelect={data => {
//           setCountry(data);
//           setShowCountries(false);
//         }}
//         modalVisible={showCountries}
//         onClose={() => {
//           setShowCountries(false);
//         }}
//       />
//     </>
//   );
// };

// const $containerStyle: ViewStyle = {
//   flexGrow: 1,
// };

// const $main: ViewStyle = {
//   flex: 1,
// };

// const $inputContainer: ViewStyle = {
//   marginTop: spacing.xl,
// };

// const $buttonStyle: ViewStyle = {
//   marginVertical: spacing.lg,
//   marginHorizontal: spacing.md,
// };
// export const ForgotPasswordScreen = ForgotPassword;
