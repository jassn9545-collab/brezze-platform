// import {Button, Loader, Screen} from '../components';
// import {
//   ChangePasswordParams,
//   buildError,
//   changePasswordSchema,
// } from '../apis/schema';
// import {Image, TouchableOpacity, ViewStyle} from 'react-native';
// import React, {FC, useEffect, useMemo, useState} from 'react';
// import {authActions, changePassword} from '../slices/auth.slice';
// import {useAppDispatch, useAppSelector} from '../store/hooks';

// import {AppStackScreenProps} from '../navigators';
// import {TextField, TextFieldAccessoryProps} from '../components/TextField';
// import {TxKeyPath} from '../i18n';
// import {images, spacing} from '../theme';
// import Header from '../components/Header';

// type Props = AppStackScreenProps<'ChangePassword'>;

// type FieldError = {
//   currentPassword?: TxKeyPath | undefined;
//   password?: TxKeyPath | undefined;
//   confirmPassword?: TxKeyPath | undefined;
// };

// const ChangePassword: FC<Props> = props => {
//   const dispatch = useAppDispatch();
//   const {changePasswordLoading: loading} = useAppSelector(store => store.auth);
//   const [oldPass, setOldPass] = useState<string>('');
//   const [isOldPasswordHidden, setIsOldPasswordHidden] = useState(false);
//   const [newPass, setNewPass] = useState<string>('');
//   const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(false);
//   const [confirmNewPass, setConfirmNewPass] = useState<string>('');
//   const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(false);

//   const [error, setError] = useState<FieldError>({});

//   const validate = () => {
//     const params: ChangePasswordParams = {
//       currentPassword: oldPass,
//       password: newPass,
//       confirmPassword: confirmNewPass,
//     };
//     changePasswordSchema
//       .validate(params, {abortEarly: false})
//       .then(res => {
//         dispatch(changePassword(res));
//         setError({});
//       })
//       .catch(errors => {
//         const err = buildError<FieldError>(errors);
//         setError(err);
//       });
//   };

//   useEffect(() => {
//     if (loading === 'loaded') {
//       dispatch(authActions.resetChangePasswordLoading());
//       props.navigation.goBack();
//     }
//   }, [dispatch, loading, props.navigation]);

//   const OldPasswordRightAccessory = useMemo(
//     () =>
//       // eslint-disable-next-line react/no-unstable-nested-components
//       function ({ style }: TextFieldAccessoryProps) {
//         return (
//           <TouchableOpacity
//             style={style}
//             onPress={() => setIsOldPasswordHidden(!isOldPasswordHidden)}
//           >
//             <Image
//               source={isOldPasswordHidden ? images.eye : images.eyeClose}
//             />
//           </TouchableOpacity>
//         );
//       },
//     [isOldPasswordHidden],
//   );

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
//               source={isAuthPasswordHidden ? images.eye : images.eyeClose}
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
//               source={isConfirmPasswordHidden ? images.eye : images.eyeClose}
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
//         safeAreaEdges={['bottom']}
//         contentContainerStyle={$container}>
//         <Header headingTx="changePassword.heading" />
//         <TextField
//           containerStyle={$fields}
//           value={oldPass}
//           labelTx="changePassword.oldPass"
//           placeholderTx="changePassword.oldPassPlaceholder"
//           secureTextEntry={!isOldPasswordHidden}
//           onChangeText={setOldPass}
//           RightAccessory={OldPasswordRightAccessory}
//           helperTx={error?.currentPassword}
//           status={error?.currentPassword ? 'error' : undefined}
//         />
//         <TextField
//           containerStyle={$fields}
//           value={newPass}
//           labelTx="changePassword.newPass"
//           placeholderTx="changePassword.newPassPlaceholder"
//           secureTextEntry={!isAuthPasswordHidden}
//           onChangeText={setNewPass}
//           RightAccessory={PasswordRightAccessory}
//           helperTx={error?.password}
//           status={error?.password ? 'error' : undefined}
//           />
//         <TextField
//           containerStyle={$fields}
//           value={confirmNewPass}
//           labelTx="changePassword.confirmNewPass"
//           placeholderTx="changePassword.confirmNewPassPlaceholder"
//           secureTextEntry={!isConfirmPasswordHidden}
//           onChangeText={setConfirmNewPass}
//           RightAccessory={ConfirmPasswordRightAccessory}
//           helperTx={error?.confirmPassword}
//           status={error?.confirmPassword ? 'error' : undefined}
//         />
//         <Button
//           tx="changePassword.update"
//           style={$buttonStyle}
//           onPress={validate}
//         />
//       </Screen>
//       <Loader loading={loading === 'loading'} />
//     </>
//   );
// };

// const $container: ViewStyle = {
//   flexGrow: 1,
// };

// const $fields: ViewStyle = {
//   marginHorizontal: spacing.md,
//   marginTop: spacing.sm,
// };

// const $buttonStyle: ViewStyle = {
//   margin: spacing.md,
// };

// export const ChangePasswordScreen = ChangePassword;
