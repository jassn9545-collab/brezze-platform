// import { AuthHeader, Button, Loader, Screen } from '../components';
// import { Image, TouchableOpacity, View, ViewStyle } from 'react-native';
// import React, { FC, useEffect, useMemo, useState } from 'react';
// import { TextField, TextFieldAccessoryProps } from '../components/TextField';
// import {
//   buildError,
//   ResetPasswordParams,
//   resetPasswordSchema,
// } from '../apis/schema';
// import { images, spacing } from '../theme';

// import { AuthStackScreenProps } from '../navigators';
// import { TxKeyPath } from '../i18n';
// import { useAppDispatch, useAppSelector } from '../store/hooks';
// import { authActions, resetPassword } from '../slices/auth.slice';

// type Props = AuthStackScreenProps<'ResetPassword'>;

// type FieldError = {
//   new_password?: TxKeyPath | undefined;
//   confirmed_password?: TxKeyPath | undefined;
// };

// export type ResetParams = {
//   user_id: number;
// };

// const ResetPassword: FC<Props> = props => {
//   const dispatch = useAppDispatch();
//   const { resetPasswordLoading: loading } = useAppSelector(store => store.auth);

//   const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(false);
//   const [newPass, setNewPass] = useState<string>('');
//   const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(false);
//   const [confirmNewPass, setConfirmNewPass] = useState<string>('');
//   const [error, setError] = useState<FieldError>({});

//   useEffect(() => {
//     if (loading === 'loaded') {
//       dispatch(authActions.resetResetPasswordLoading());
//       props.navigation.replace('Login');
//     }
//   }, [dispatch, loading, props.navigation]);

//   const validate = () => {
//     const params: ResetPasswordParams = {
//       new_password: newPass,
//       confirmed_password: confirmNewPass,
//       user_id: props.route.params.user_id,
//     };
//     resetPasswordSchema
//       .validate(params, { abortEarly: false })
//       .then(res => {
//         dispatch(resetPassword(res));
//         setError({});
//       })
//       .catch(errors => {
//         const err = buildError<FieldError>(errors);
//         setError(err);
//       });
//   };

//   const PasswordRightAccessory = useMemo(
//     () =>
//       // eslint-disable-next-line react/no-unstable-nested-components
//       function ({ style }: TextFieldAccessoryProps) {
//         return (
//           <TouchableOpacity
//             style={style}
//             onPress={() => setIsAuthPasswordHidden(!isAuthPasswordHidden)}
//           >
//             <Image
//               source={
//                 isAuthPasswordHidden ? images.eyeIcon : images.eyeCloseIcon
//               }
//             />
//           </TouchableOpacity>
//         );
//       },
//     [isAuthPasswordHidden],
//   );

//   const ConfirmPasswordRightAccessory = useMemo(
//     () =>
//       // eslint-disable-next-line react/no-unstable-nested-components
//       function ({ style }: TextFieldAccessoryProps) {
//         return (
//           <TouchableOpacity
//             style={style}
//             onPress={() => setIsConfirmPasswordHidden(!isConfirmPasswordHidden)}
//           >
//             <Image
//               source={
//                 isConfirmPasswordHidden ? images.eyeIcon : images.eyeCloseIcon
//               }
//             />
//           </TouchableOpacity>
//         );
//       },
//     [isConfirmPasswordHidden],
//   );

//   return (
//     <>
//       <Screen
//         preset="auto"
//         contentContainerStyle={$container}
//         safeAreaEdges={['top']}
//       >
//         <AuthHeader tx="resetPassword.heading" />
//         <View style={$main}>
//           <TextField
//             containerStyle={$fields}
//             value={newPass}
//             labelTx="changePassword.newPass"
//             placeholderTx="changePassword.newPassPlaceholder"
//             secureTextEntry={!isAuthPasswordHidden}
//             onChangeText={setNewPass}
//             RightAccessory={PasswordRightAccessory}
//             helperTx={error?.new_password}
//             status={error?.new_password ? 'error' : undefined}
//           />
//           <TextField
//             containerStyle={$fields}
//             value={confirmNewPass}
//             labelTx="changePassword.confirmNewPass"
//             placeholderTx="changePassword.confirmNewPassPlaceholder"
//             secureTextEntry={!isConfirmPasswordHidden}
//             onChangeText={setConfirmNewPass}
//             RightAccessory={ConfirmPasswordRightAccessory}
//             helperTx={error?.confirmed_password}
//             status={error?.confirmed_password ? 'error' : undefined}
//           />
//           <Button
//             tx="changePassword.update"
//             style={$buttonStyle}
//             onPress={validate}
//           />
//         </View>
//       </Screen>
//       <Loader loading={loading === 'loading'} />
//     </>
//   );
// };

// const $container: ViewStyle = {
//   flexGrow: 1,
// };

// const $main: ViewStyle = {
//   flex: 1,
// };

// const $fields: ViewStyle = {
//   marginTop: spacing.sm,
// };

// const $buttonStyle: ViewStyle = {
//   marginVertical: spacing.lg,
//   marginHorizontal: spacing.md,
// };
// export const ResetPasswordScreen = ResetPassword;
