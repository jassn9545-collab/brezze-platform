// import {BackButtom, Button, Loader, Screen, Text} from '../components';
// import {ConnectedProps, connect} from 'react-redux';
// import {HelpParams, buildError, helpSchema} from '../apis/schema';
// import {TextInput, TextStyle, View, ViewStyle} from 'react-native';
// import React, {FC, useEffect, useRef, useState} from 'react';
// import {spacing} from '../theme';
// import {postHelpSupport, staticActions} from '../slices/static.slice';

// import {AppStackScreenProps} from '../navigators';
// import {RootState} from '../store';
// import {TextField} from '../components/TextField';
// import {TxKeyPath} from '../i18n';

// type NavigationProps = AppStackScreenProps<'HelpSupport'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

// type FieldError = {
//   email?: TxKeyPath | undefined;
//   msg?: TxKeyPath | undefined;
// };
// const HelpSupport: FC<Props> = props => {
//   const messageField = useRef<TextInput>(null);
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState('');
//   const [error, setError] = useState<FieldError>({});

//   const validate = () => {
//     const params: HelpParams = {
//       name: props.profile?.name,
//       email: email,
//       msg: message,
//       mobileNumber: props.profile?.mobileNumber,
//       countryCode: props.profile?.countryCode,
//     };
//     helpSchema
//       .validate(params, {abortEarly: false})
//       .then(res => {
//         props.postSupport(res);
//         setError({});
//       })
//       .catch(errors => {
//         const err = buildError<FieldError>(errors);
//         setError(err);
//       });
//   };

//   useEffect(() => {
//     if (props.loading === 'loaded') {
//       props.navigation.goBack();
//       props.clean();
//       setEmail('');
//       setMessage('');
//     }
//   }, [props]);

//   return (
//     <>
//       <Screen
//         preset="auto"
//         safeAreaEdges={['top', 'bottom']}
//         contentContainerStyle={$container}>
//         <BackButtom onPress={props.navigation.goBack} />
//         <Text
//           tx={'profile.helpAndSupport'}
//           preset="heading"
//           style={$heading}
//           size="xl"
//         />
//         <TextField
//           value={email}
//           onChangeText={setEmail}
//           containerStyle={$emailContainer}
//           placeholderTx="support.emailPlaceHolder"
//           keyboardType="email-address"
//           helperTx={error?.email}
//           status={error?.email ? 'error' : undefined}
//           onSubmitEditing={() => messageField.current?.focus()}
//         />
//         <TextField
//           ref={messageField}
//           value={message}
//           multiline
//           onChangeText={setMessage}
//           containerStyle={$emailContainer}
//           placeholderTx="support.messagePlaceholder"
//           helperTx={error?.msg}
//           status={error?.msg ? 'error' : undefined}
//         />
//         <View style={$fill} />
//         <Button
//           tx="support.submitButton"
//           style={$buttonStyle}
//           onPress={validate}
//         />
//       </Screen>
//       <Loader loading={props.loading === 'loading'} />
//     </>
//   );
// };

// const $container: ViewStyle = {
//   flexGrow: 1,
// };

// const $heading: TextStyle = {
//   fontSize: 32,
//   lineHeight: 40,
//   marginHorizontal: spacing.lg,
// };

// const $emailContainer: ViewStyle = {
//   marginHorizontal: spacing.md,
//   marginTop: spacing.lg,
// };

// const $buttonStyle: ViewStyle = {
//   margin: spacing.md,
// };

// const $fill: ViewStyle = {
//   flex: 1,
// };

// const mapStateToProps = (state: RootState) => ({
//   profile: state.auth.myProfile,
//   loading: state.static.loading,
// });

// const mapDispatch = {
//   clean: () => staticActions.cleanUp(),
//   postSupport: (params: HelpParams) => postHelpSupport(params),
// };

// const connector = connect(mapStateToProps, mapDispatch);

// export const HelpSupportScreen = connector(HelpSupport);
