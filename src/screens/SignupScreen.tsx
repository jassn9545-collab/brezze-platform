// import {
//   AuthHeader,
//   Country,
//   CountryPickerModal,
//   DatePickerModal,
//   Loader,
//   Screen,
//   Text,
// } from '../components';
// import {
//   Image,
//   ImageSourcePropType,
//   Keyboard,
//   TextInput,
//   TextStyle,
//   TouchableOpacity,
//   View,
//   ViewStyle,
// } from 'react-native';
// import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
// import { buildError, Registration, userSchema } from '../apis/schema';
// import { TextField, TextFieldAccessoryProps } from '../components/TextField';
// import { spacing } from '../theme';
// import { AuthStackScreenProps } from '../navigators';
// import { Button } from '../components/Button';
// import { DefaultCountry } from '../config/defaults';
// import { translate, TxKeyPath } from '../i18n';
// import { ValidationError } from 'yup';
// import { images } from '../theme/images';
// import moment from 'moment';
// import {
//   DataType,
//   DropDownList,
//   DropDownRightAccessory,
//   sizeForSheet,
// } from '../components/DropDownList';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { TrueSheet } from '@lodev09/react-native-true-sheet';
// import { connect, ConnectedProps } from 'react-redux';
// import { RootState } from '../store';
// import { userRegistration } from '../slices/auth.slice';
// import { getMessaging, getToken } from '@react-native-firebase/messaging';

// interface SignupScreenProps extends AuthStackScreenProps<'Signup'> {}
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = SignupScreenProps & StoreProps;

// export const nomineeList: DataType[] = [
//   { name: 'relationShipNames.father', id: 'father' },
//   { name: 'relationShipNames.mother', id: 'mother' },
//   { name: 'relationShipNames.brother', id: 'brother' },
//   { name: 'relationShipNames.sister', id: 'sister' },
//   { name: 'relationShipNames.wife', id: 'wife' },
// ];

// type FieldError = {
//   name?: TxKeyPath | undefined;
//   phone?: TxKeyPath | undefined;
//   alternate_phone?: TxKeyPath | undefined;
//   email?: TxKeyPath | undefined;
//   dob?: TxKeyPath | undefined;
//   nominee_name?: TxKeyPath | undefined;
//   nominee_dob?: TxKeyPath | undefined;
//   nominee_phone?: TxKeyPath | undefined;
//   relation_with_nominee?: TxKeyPath | undefined;
//   refrence?: TxKeyPath | undefined;
//   password?: TxKeyPath | undefined;
//   confirmPassword?: TxKeyPath | undefined;
// };

// export const leftAccessory =
//   (icon: ImageSourcePropType) => (props: TextFieldAccessoryProps) =>
//     (
//       <View style={[props.style, $inputAccessoryStyle]}>
//         <Image source={icon} />
//       </View>
//     );

// const Signup: FC<Props> = props => {
//   const insets = useSafeAreaInsets();
//   const fields = [
//     useRef<TextInput>(null),
//     useRef<TextInput>(null),
//     useRef<TextInput>(null),
//     useRef<TextInput>(null),
//     useRef<TextInput>(null),
//     useRef<TextInput>(null),
//     useRef<TextInput>(null),
//     useRef<TextInput>(null),
//     useRef<TextInput>(null),
//   ];
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [mobile, setMobile] = useState('');
//   const [alternativeMobile, setAlternativeMobile] = useState('');
//   const [country, setCountry] = useState<Country>(DefaultCountry);
//   const [dob, setDOB] = useState<Date>();
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [nomineeName, setNomineeName] = useState('');
//   const [nomineeDOB, setNomineeDOB] = useState<Date>();
//   const [nomineeMobile, setNomineeMobile] = useState('');
//   const [showNomineeDOBPicker, setNomineeDOBPicker] = useState(false);
//   const [relashipNominee, setRelashipNominee] = useState<DataType>();
//   const [refrence, setRefrence] = useState('');

//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showCountries, setShowCountries] = useState(false);
//   const [isAuthPasswordHidden, setIsAuthPasswordHidden] = useState(false);
//   const [isConfirmPasswordHidden, setIsConfirmPasswordHidden] = useState(false);
//   const [firebaseToken, setFirebaseToken] = useState('');
//   const [error, setError] = useState<FieldError>({});
//   //   const [tnc, setTnc] = useState(false);

//   const nomineeSheet = useRef<TrueSheet>(null);

//   useEffect(() => {
//     if (__DEV__) {
//       setName('Mandeep Singh');
//       setMobile('7814667566');
//       setAlternativeMobile('9779505523');
//       setEmail('mandeep.swt.suffescom@gmail.com');
//       setPassword('Admin@123');
//       setConfirmPassword('Admin@123');
//     }
//   }, []);

//   useEffect(() => {
//     if (props.inviteCode) {
//       setRefrence(props.inviteCode);
//     }
//   }, [props.inviteCode]);

//   useEffect(() => {
//     (async () => {
//       const messaging = getMessaging();
//       const token = await getToken(messaging);
//       setFirebaseToken(token);
//     })();
//     return () => {
//       setName('');
//       setMobile('');
//       setCountry(DefaultCountry);
//       setAlternativeMobile('');
//       setEmail('');
//       setDOB(undefined);
//       setNomineeName('');
//       setNomineeDOB(undefined);
//       setNomineeMobile('');
//       setRelashipNominee(undefined);
//       setRefrence('');
//       setPassword('');
//       setConfirmPassword('');
//     };
//   }, []);

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

//   const validate = () => {
//     userSchema
//       .validate(
//         {
//           name,
//           email,
//           phone: mobile,
//           country_code: country.dial_code.replace('+', ''),
//           alternate_phone: alternativeMobile,
//           dob: dob ? moment(dob).format('YYYY-MM-DD') : undefined,
//           nominee_name: nomineeName,
//           nominee_dob: nomineeDOB
//             ? moment(nomineeDOB).format('YYYY-MM-DD')
//             : undefined,
//           nominee_phone: nomineeMobile,
//           relation_with_nominee: relashipNominee?.id,
//           refrence,
//           password,
//           confirmPassword,
//           firebaseToken,
//         },
//         { abortEarly: false, context: { isSignup: true } },
//       )
//       .then(res => {
//         Keyboard.dismiss();
//         props.signup(res);
//         setError({});
//       })
//       .catch((errors: ValidationError) => {
//         const err = buildError<FieldError>(errors);
//         setError(err);
//       });
//   };

//   return (
//     <>
//       <Screen
//         preset="auto"
//         safeAreaEdges={['top']}
//         contentContainerStyle={$containerStyle}
//       >
//         <AuthHeader tx="auth.heading" />
//         <View style={$mainView}>
//           <TextField
//             value={name}
//             onChangeText={setName}
//             containerStyle={$userNameContainer}
//             labelTx="auth.fullName"
//             placeholderTx="auth.namePlaceholder"
//             LeftAccessory={leftAccessory(images.emailBoxIcon)}
//             onSubmitEditing={() => fields[0].current?.focus()}
//             helperTx={error?.name}
//             status={error?.name ? 'error' : undefined}
//           />
//           <TextField
//             value={mobile ? `${country.dial_code} ${mobile}` : ''}
//             onChangeText={text => {
//               const dialCode = country.dial_code.replace('+', '\\+');
//               const cleaned = text
//                 .replace(new RegExp(`^${dialCode}\\s?`), '')
//                 .replace(/\D/g, '');
//               setMobile(cleaned);
//             }}
//             ref={fields[0]}
//             labelTx="auth.mobileNumber"
//             placeholderTx="auth.mobilePlaceholder"
//             keyboardType="phone-pad"
//             containerStyle={$inputContainer}
//             LeftAccessory={leftAccessory(images.callIcon)}
//             onSubmitEditing={() => fields[1].current?.focus()}
//             helperTx={error?.phone}
//             status={error?.phone ? 'error' : undefined}
//           />
//           <TextField
//             value={
//               alternativeMobile
//                 ? `${country.dial_code} ${alternativeMobile}`
//                 : ''
//             }
//             onChangeText={text => {
//               const dialCode = country.dial_code.replace('+', '\\+');
//               const cleaned = text
//                 .replace(new RegExp(`^${dialCode}\\s?`), '')
//                 .replace(/\D/g, '');
//               setAlternativeMobile(cleaned);
//             }}
//             ref={fields[1]}
//             labelTx="auth.mobileNumberAlernative"
//             placeholderTx="auth.mobilePlaceholderAlernative"
//             keyboardType="phone-pad"
//             containerStyle={$inputContainer}
//             LeftAccessory={leftAccessory(images.callIcon)}
//             onSubmitEditing={() => fields[2].current?.focus()}
//             helperTx={error?.alternate_phone}
//             status={error?.alternate_phone ? 'error' : undefined}
//           />
//           <TextField
//             value={email}
//             onChangeText={setEmail}
//             ref={fields[2]}
//             containerStyle={$inputContainer}
//             LeftAccessory={leftAccessory(images.emailBoxIcon)}
//             labelTx="auth.emailAddress"
//             placeholderTx="auth.emailPlaceholder"
//             keyboardType="email-address"
//             onSubmitEditing={() => fields[3].current?.focus()}
//             helperTx={error?.email}
//             status={error?.email ? 'error' : undefined}
//           />
//           <TouchableOpacity
//             onPress={() => setShowDatePicker(true)}
//             activeOpacity={0.8}
//           >
//             <TextField
//               ref={fields[3]}
//               editable={false}
//               pointerEvents="none"
//               containerStyle={$inputContainer}
//               LeftAccessory={leftAccessory(images.birthdayLogoIcon)}
//               value={dob ? moment(dob).format('DD/MM/YYYY') : ''}
//               labelTx="auth.dateBirth"
//               placeholderTx="auth.dateBirthPlaceholder"
//               onSubmitEditing={() => fields[4].current?.focus()}
//               helperTx={error?.dob}
//               status={error?.dob ? 'error' : undefined}
//             />
//           </TouchableOpacity>
//           <TextField
//             ref={fields[4]}
//             value={nomineeName}
//             onChangeText={setNomineeName}
//             containerStyle={$inputContainer}
//             labelTx="auth.nomineeName"
//             placeholderTx="auth.nomineeNamePlaceholder"
//             LeftAccessory={leftAccessory(images.multipleUserLogo)}
//             onSubmitEditing={() => fields[5].current?.focus()}
//             helperTx={error?.nominee_name}
//             status={error?.nominee_name ? 'error' : undefined}
//           />
//           <TouchableOpacity
//             onPress={() => setNomineeDOBPicker(true)}
//             activeOpacity={0.8}
//           >
//             <TextField
//               ref={fields[5]}
//               editable={false}
//               pointerEvents="none"
//               containerStyle={$inputContainer}
//               LeftAccessory={leftAccessory(images.cakeIcon)}
//               value={nomineeDOB ? moment(nomineeDOB).format('DD/MM/YYYY') : ''}
//               labelTx="auth.nomineeDOB"
//               placeholderTx="auth.nomineeDOBPlaceholder"
//               onSubmitEditing={() => fields[6].current?.focus()}
//               helperTx={error?.nominee_dob}
//               status={error?.nominee_dob ? 'error' : undefined}
//             />
//           </TouchableOpacity>
//           <TextField
//             value={nomineeMobile ? `${country.dial_code} ${nomineeMobile}` : ''}
//             onChangeText={text => {
//               const dialCode = country.dial_code.replace('+', '\\+');
//               const cleaned = text
//                 .replace(new RegExp(`^${dialCode}\\s?`), '')
//                 .replace(/\D/g, '');
//               setNomineeMobile(cleaned);
//             }}
//             ref={fields[6]}
//             labelTx="auth.mobileNominee"
//             placeholderTx="auth.mobilePlaceholderNominee"
//             keyboardType="phone-pad"
//             containerStyle={$inputContainer}
//             LeftAccessory={leftAccessory(images.callIcon)}
//             onSubmitEditing={() => fields[7].current?.focus()}
//             helperTx={error?.nominee_phone}
//             status={error?.nominee_phone ? 'error' : undefined}
//           />
//           <TouchableOpacity onPress={() => nomineeSheet.current?.present()}>
//             <TextField
//               editable={false}
//               pointerEvents="none"
//               value={
//                 relashipNominee?.name ? translate(relashipNominee.name) : ''
//               }
//               ref={fields[7]}
//               labelTx="auth.relationshipNominee"
//               placeholderTx="auth.relationshipNomineePlaceholder"
//               containerStyle={$inputContainer}
//               LeftAccessory={leftAccessory(images.relationshipIcon)}
//               RightAccessory={DropDownRightAccessory}
//               onSubmitEditing={() => fields[8].current?.focus()}
//               helperTx={error?.relation_with_nominee}
//               status={error?.relation_with_nominee ? 'error' : undefined}
//             />
//           </TouchableOpacity>

//           <TextField
//             ref={fields[8]}
//             value={refrence}
//             onChangeText={setRefrence}
//             containerStyle={$inputContainer}
//             labelTx="auth.referralCode"
//             placeholderTx="auth.referralCodePlaceholder"
//             LeftAccessory={leftAccessory(images.referEarnLogo)}
//             onSubmitEditing={() => fields[9].current?.focus()}
//             helperTx={error?.refrence}
//             status={error?.refrence ? 'error' : undefined}
//           />

//           <TextField
//             value={password}
//             onChangeText={setPassword}
//             ref={fields[9]}
//             labelTx="auth.password"
//             placeholderTx="auth.passwordPlaceholder"
//             secureTextEntry={!isAuthPasswordHidden}
//             containerStyle={$inputContainer}
//             LeftAccessory={leftAccessory(images.passwordIcon)}
//             RightAccessory={PasswordRightAccessory}
//             onSubmitEditing={() => fields[10].current?.focus()}
//             helperTx={error?.password}
//             status={error?.password ? 'error' : undefined}
//           />
//           <TextField
//             value={confirmPassword}
//             onChangeText={setConfirmPassword}
//             ref={fields[10]}
//             labelTx="auth.confirmPassword"
//             placeholderTx="auth.confirmPasswordPlaceholder"
//             secureTextEntry={!isConfirmPasswordHidden}
//             containerStyle={$inputContainer}
//             LeftAccessory={leftAccessory(images.passwordIcon)}
//             RightAccessory={ConfirmPasswordRightAccessory}
//             helperTx={error?.confirmPassword}
//             status={error?.confirmPassword ? 'error' : undefined}
//           />
//           {/* <TouchableOpacity
//             style={$tncContainer}
//             onPress={() => {
//               setTnc(!tnc);
//             }}
//             activeOpacity={1}
//           >
//             <AnimatedIcon
//               source={tnc ? images.checkboxFilled : images.checkboxOutline}
//               style={$checkBox}
//               onPress={() => {
//                 setTnc(!tnc);
//               }}
//             />
//             <Text style={$tncText}>
//               <Text style={$dimtext} tx="auth.agree" size="xs" />
//               <Text
//                 tx="auth.privacyPolicy"
//                 size="xs"
//                 style={$primaryColorStyle}
//                 onPress={() => props.navigation.navigate('PrivacyPolicy')}
//               />
//               <Text style={$dimtext} tx="auth.and" size="xs" />
//               <Text
//                 tx="auth.termsAndConditions"
//                 size="xs"
//                 style={$primaryColorStyle}
//                 onPress={() => props.navigation.navigate('TermsCondition')}
//               />
//               <Text style={$dimtext} tx="auth.dot" size="xs" />
//             </Text>
//           </TouchableOpacity> */}
//           <Button tx="auth.signUp" onPress={validate} style={$buttonStyle} />
//           <Text style={$signUp}>
//             <Text tx="auth.alreadyMember" size="sm" preset="subheading" />
//             <Text
//               tx="auth.signIn"
//               size="sm"
//               weight="semiBold"
//               onPress={() => {
//                 Keyboard.dismiss();
//                 props.navigation.navigate('Login');
//               }}
//             />
//           </Text>
//         </View>
//       </Screen>
//       <CountryPickerModal
//         onSelect={data => {
//           setCountry(data);
//           setShowCountries(false);
//         }}
//         modalVisible={showCountries}
//         onClose={() => setShowCountries(false)}
//       />
//       <DatePickerModal
//         mode="date"
//         display="auto"
//         visible={showDatePicker}
//         onChangeDate={setDOB}
//         maximumDate={
//           new Date(new Date().setFullYear(new Date().getFullYear() - 18))
//         }
//         value={dob ?? new Date()}
//         onDismiss={() => setShowDatePicker(false)}
//       />
//       <DatePickerModal
//         mode="date"
//         display="auto"
//         visible={showNomineeDOBPicker}
//         onChangeDate={setNomineeDOB}
//         maximumDate={
//           new Date(new Date().setFullYear(new Date().getFullYear() - 18))
//         }
//         value={nomineeDOB ?? new Date()}
//         onDismiss={() => setNomineeDOBPicker(false)}
//       />
//       <DropDownList
//         title="auth.relationshipNominee"
//         ref={nomineeSheet}
//         data={nomineeList}
//         selectedId={relashipNominee?.id}
//         onSelect={data => setRelashipNominee(data)}
//         sizes={sizeForSheet(nomineeList.length, insets)}
//       />
//       <Loader loading={props.loading === 'loading'} tx="signing" />
//     </>
//   );
// };

// const $containerStyle: ViewStyle = {
//   flexGrow: 1,
// };

// const $mainView: ViewStyle = {
//   flex: 1,
// };

// const $userNameContainer: ViewStyle = {
//   marginTop: spacing.lg,
// };

// const $inputContainer: ViewStyle = {
//   marginTop: spacing.sm,
// };

// const $buttonStyle: ViewStyle = {
//   marginTop: spacing.xxl,
//   marginHorizontal: spacing.md,
// };

// const $signUp: TextStyle = {
//   textAlign: 'center',
//   marginVertical: spacing.lg,
//   justifyContent: 'center',
// };

// const $inputAccessoryStyle: ViewStyle = {
//   marginVertical: spacing.sm,
//   height: 24,
// };

// // const $tncContainer: ViewStyle = {
// //   flexDirection: 'row',
// //   alignItems: 'center',
// //   marginTop: spacing.md,
// // };
// // const $checkBox: ImageStyle = {
// //   marginRight: spacing.xs,
// // };

// // const $tncText: TextStyle = {
// //   flex: 1,
// //   marginHorizontal: spacing.xxxs,
// // };

// // const $dimtext: TextStyle = {
// //   color: colors.textDim,
// // };

// const mapStateToProps = (state: RootState) => ({
//   loading: state.auth.userRegistrationLoading,
//   inviteCode: state.auth.inviteCode,
// });

// const mapDispatch = {
//   signup: (params: Registration) => userRegistration(params),
// };

// const connector = connect(mapStateToProps, mapDispatch);

// export const SignupScreen = connector(Signup);
