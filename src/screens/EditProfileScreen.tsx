// import {
//   Image,
//   TextStyle,
//   TouchableOpacity,
//   View,
//   ViewStyle,
// } from 'react-native';
// import { colors, images, spacing } from '../theme';
// import {
//   BackButtom,
//   Button,
//   countries,
//   CountryPickerModal,
//   CustomImagePicker,
//   DatePickerModal,
//   Loader,
//   Screen,
//   Text,
// } from '../components';
// import React, {
//   FC,
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from 'react';
// import { TextField, TextFieldAccessoryProps } from '../components/TextField';
// import { translate, TxKeyPath } from '../i18n';
// import { buildError, userSchema } from '../apis/schema';

// import { AppStackScreenProps } from '../navigators';
// import { DefaultCountry } from '../config/defaults';
// import { ImagePickerResponse } from 'react-native-image-picker';
// import moment from 'moment';
// import { RootState } from '../store';
// import { connect, ConnectedProps } from 'react-redux';
// import { authActions, getProfile, updateProfile } from '../slices/auth.slice';
// import { useFocusEffect } from '@react-navigation/native';
// import {
//   DataType,
//   DropDownList,
//   DropDownRightAccessory,
//   sizeForSheet,
// } from '../components/DropDownList';
// import { leftAccessory, nomineeList } from './SignupScreen';
// import { TrueSheet } from '@lodev09/react-native-true-sheet';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import FastImage, { ImageStyle } from '@d11/react-native-fast-image';

// type NavigationProps = AppStackScreenProps<'EditProfile'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

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
// };

// const EditProfile: FC<Props> = props => {
//   const insets = useSafeAreaInsets();
//   const {
//     oldName = props.profile?.name,
//     oldEmail = props.profile?.email,
//     oldCountryCode = `+${props.profile?.country_code ?? '91'}`,
//     oldMobileNumber = props.profile?.phone,
//     oldAlterNativeMobile = props.profile?.alternate_phone,
//     oldDOB = props.profile?.dob
//       ? moment(props.profile?.dob, 'YYYY-MM-DD').toDate()
//       : undefined,
//     oldNomineeName = props.profile?.nominee_name,
//     oldNomineeDOB = props.profile?.nominee_dob
//       ? moment(props.profile?.nominee_dob, 'YYYY-MM-DD').toDate()
//       : undefined,
//     oldNomineePhone = props.profile?.nominee_phone ?? '',
//     // profile
//   } = {};

//   const [imagePickerVisible, setImagePickerVisible] = useState(false);
//   const [imageURI, setImageURI] = useState(
//     props.profile?.profile
//       ? props.baseUrl + '/' + props.profile.profile
//       : ''
//   );
  
//   const [imageFormData, setImageFormData] = useState<{
//     uri: string;
//     name: string;
//     type: string;
//   } | null>(null);
//   const [name, setName] = useState(oldName ?? '');
//   const [email, setEmail] = useState(oldEmail ?? '');
//   const [showCountries, setShowCountries] = useState<boolean>(false);
//   const [countryCode, setCountryCode] = useState(
//     oldCountryCode ?? DefaultCountry.dial_code,
//   );
//   const [number, setNumber] = useState(oldMobileNumber ?? '');
//   const [alternativeMobile, setAlternativeMobile] = useState(
//     oldAlterNativeMobile ?? '',
//   );
//   const [dob, setDOB] = useState<Date | undefined>(oldDOB ?? undefined);
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [nomineeName, setNomineeName] = useState(oldNomineeName ?? '');
//   const [nomineeDOB, setNomineeDOB] = useState<Date | undefined>(
//     oldNomineeDOB ?? undefined,
//   );
//   const [showNomineeDOBPicker, setNomineeDOBPicker] = useState(false);

//   const [nomineeMobile, setNomineeMobile] = useState(oldNomineePhone ?? '');
//   const [relashipNominee, setRelashipNominee] = useState<DataType | undefined>(
//     nomineeList.find(item => item.id === props.profile?.relation_with_nominee),
//   );
//   const [error, setError] = useState<FieldError>({});

//   const nomineeSheet = useRef<TrueSheet>(null);

//   const uploadImage = (image: ImagePickerResponse) => {
//     if ((image.assets?.length ?? 0) > 0) {
//       setImageURI(image.assets?.[0].uri!);
//       setImageFormData({
//         uri: image.assets?.[0].uri!,
//         name: image.assets?.[0].fileName!,
//         type: image.assets?.[0].type!,
//       });
//     }
//   };

//   useFocusEffect(
//     useCallback(() => {
//       props.getProfile();
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []),
//   );

//   const PhoneIcon = useMemo(
//     () =>
//       // eslint-disable-next-line react/no-unstable-nested-components
//       function (accessoryProps: TextFieldAccessoryProps) {
//         const currentCountry = countries.find(
//           item => item.dial_code === countryCode,
//         );
//         return (
//           <TouchableOpacity
//             disabled={!!oldMobileNumber}
//             style={[accessoryProps.style, $countryCodeStyle]}
//             // onPress={() => setShowCountries(true)}
//           >
//             <Text>{currentCountry?.dial_code}</Text>
//           </TouchableOpacity>
//         );
//       },
//     [countryCode, oldMobileNumber],
//   );

//   const updateProfileAction = () => {
//     const params = {
//       name,
//       email,
//       phone: number,
//       country_code: countryCode,
//       alternate_phone: alternativeMobile,
//       dob: dob ? moment(dob).format('YYYY-MM-DD') : undefined,
//       nominee_name: nomineeName,
//       nominee_dob: nomineeDOB
//         ? moment(nomineeDOB).format('YYYY-MM-DD')
//         : undefined,
//       nominee_phone: nomineeMobile,
//       relation_with_nominee: relashipNominee?.id,
//     };

//     userSchema
//       .validate(params, { abortEarly: false, context: { isSignup: false } })
//       .then(() => {
//         const formData = new FormData();
//         formData.append('name', name);
//         formData.append('phone', number);
//         formData.append('country_code', countryCode);
//         formData.append('email', email);
//         formData.append('alternate_phone', alternativeMobile);
//         formData.append('dob', dob ? moment(dob).format('YYYY-MM-DD') : '');
//         formData.append('nominee_name', nomineeName);
//         formData.append(
//           'nominee_dob',
//           nomineeDOB ? moment(nomineeDOB).format('YYYY-MM-DD') : '',
//         );
//         formData.append('nominee_phone', nomineeMobile);
//         formData.append('relation_with_nominee', relashipNominee?.id ?? '');
//         if (imageFormData) {
//           formData.append('profile', {
//             uri: imageFormData.uri,
//             name: imageFormData.name,
//             type: imageFormData.type,
//           });
//         }
//         props.update(formData);
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
//       props.reset();
//     }
//   }, [props]);

//   return (
//     <>
//       <Screen
//         preset="scroll"
//         safeAreaEdges={['top', 'bottom']}
//         contentContainerStyle={$container}
//       >
//         <BackButtom headingTx="editProfile.heading" />
//         <View style={$header}>
//           <View style={$mainImageView}>
//             <FastImage
//               source={imageURI ? { uri: imageURI } : images.vector}
//               style={$mainImage}
//             />
//             <TouchableOpacity
//               style={$editImage}
//               onPress={() => setImagePickerVisible(true)}
//             >
//               <Image source={images.upload} />
//             </TouchableOpacity>
//           </View>
//           <View style={$wrapUserDetail}>
//             <Text text={oldName} size="xl" weight="semiBold" />
//             <Text
//               text={oldCountryCode + oldMobileNumber}
//               size="xs"
//               weight="medium"
//             />
//             <Text text={oldEmail} size="xs" weight="medium" />
//           </View>
//         </View>
//         <View style={$inputContainer}>
//           <TextField
//             LabelTextProps={{
//               style: $inputLabel,
//             }}
//             HelperTextProps={{
//               style: $helperInputText,
//             }}
//             containerStyle={$fields}
//             placeholderTextColor={colors.palette.grayLight}
//             inputWrapperStyle={$inputWrapper}
//             style={$inputStyle}
//             value={name}
//             onChangeText={setName}
//             labelTx="editProfile.fullName"
//             placeholderTx="editProfile.namePlaceholder"
//             helperTx={error?.name}
//             status={error?.name ? 'error' : undefined}
//           />
//           <TextField
//             LabelTextProps={{
//               style: $inputLabel,
//             }}
//             HelperTextProps={{
//               style: $helperInputText,
//             }}
//             containerStyle={$fields}
//             placeholderTextColor={colors.palette.grayLight}
//             inputWrapperStyle={$inputWrapper}
//             style={$inputStyle}
//             keyboardType="email-address"
//             value={email}
//             editable={!oldEmail}
//             onChangeText={setEmail}
//             labelTx="editProfile.emailAddress"
//             placeholderTx="editProfile.emailPlaceholder"
//             helperTx={error?.email}
//             status={error?.email ? 'error' : undefined}
//           />
//           <TextField
//             LabelTextProps={{
//               style: $inputLabel,
//             }}
//             HelperTextProps={{
//               style: $helperInputText,
//             }}
//             containerStyle={$fields}
//             placeholderTextColor={colors.palette.grayLight}
//             inputWrapperStyle={$inputWrapper}
//             style={$inputStyle}
//             keyboardType="phone-pad"
//             value={number}
//             editable={!oldMobileNumber}
//             onChangeText={setNumber}
//             labelTx="editProfile.phoneNumber"
//             placeholderTx="editProfile.phonePlaceholder"
//             LeftAccessory={PhoneIcon}
//             helperTx={error?.phone}
//             status={error?.phone ? 'error' : undefined}
//           />
//           <TextField
//             LabelTextProps={{
//               style: $inputLabel,
//             }}
//             HelperTextProps={{
//               style: $helperInputText,
//             }}
//             containerStyle={$fields}
//             placeholderTextColor={colors.palette.grayLight}
//             inputWrapperStyle={$inputWrapper}
//             style={$inputStyle}
//             keyboardType="phone-pad"
//             value={alternativeMobile}
//             onChangeText={setAlternativeMobile}
//             labelTx="editProfile.mobileNumberAlernative"
//             placeholderTx="editProfile.mobilePlaceholderAlernative"
//             LeftAccessory={PhoneIcon}
//             helperTx={error?.alternate_phone}
//             status={error?.alternate_phone ? 'error' : undefined}
//           />
//           <TouchableOpacity
//             onPress={() => setShowDatePicker(true)}
//             activeOpacity={0.8}
//           >
//             <TextField
//               editable={false}
//               pointerEvents="none"
//               LabelTextProps={{
//                 style: $inputLabel,
//               }}
//               containerStyle={$fields}
//               placeholderTextColor={colors.palette.grayLight}
//               inputWrapperStyle={$inputWrapper}
//               style={$inputStyle}
//               value={dob ? moment(dob).format('DD/MM/YYYY') : ''}
//               labelTx="editProfile.dobBirth"
//               placeholderTx="editProfile.dobPlaceholder"
//               helperTx={error?.dob}
//               status={error?.dob ? 'error' : undefined}
//             />
//           </TouchableOpacity>
//           <TextField
//             LabelTextProps={{
//               style: $inputLabel,
//             }}
//             HelperTextProps={{
//               style: $helperInputText,
//             }}
//             containerStyle={$fields}
//             placeholderTextColor={colors.palette.grayLight}
//             inputWrapperStyle={$inputWrapper}
//             style={$inputStyle}
//             value={nomineeName}
//             onChangeText={setNomineeName}
//             labelTx="editProfile.nomineeName"
//             placeholderTx="editProfile.nomineeNamePlaceholder"
//             helperTx={error?.nominee_name}
//             status={error?.nominee_name ? 'error' : undefined}
//           />
//           <TouchableOpacity
//             onPress={() => setNomineeDOBPicker(true)}
//             activeOpacity={0.8}
//           >
//             <TextField
//               editable={false}
//               pointerEvents="none"
//               LabelTextProps={{
//                 style: $inputLabel,
//               }}
//               containerStyle={$fields}
//               placeholderTextColor={colors.palette.grayLight}
//               inputWrapperStyle={$inputWrapper}
//               style={$inputStyle}
//               value={nomineeDOB ? moment(nomineeDOB).format('DD/MM/YYYY') : ''}
//               labelTx="editProfile.nomineeDOB"
//               placeholderTx="editProfile.nomineeDOBPlaceholder"
//               helperTx={error?.nominee_dob}
//               status={error?.nominee_dob ? 'error' : undefined}
//             />
//           </TouchableOpacity>
//           <TextField
//             LabelTextProps={{
//               style: $inputLabel,
//             }}
//             HelperTextProps={{
//               style: $helperInputText,
//             }}
//             containerStyle={$fields}
//             placeholderTextColor={colors.palette.grayLight}
//             inputWrapperStyle={$inputWrapper}
//             style={$inputStyle}
//             value={nomineeMobile}
//             onChangeText={setNomineeMobile}
//             labelTx="editProfile.nomineePhone"
//             placeholderTx="editProfile.nomineePhonePlaceholder"
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
//               labelTx="editProfile.relationshipNominee"
//               placeholderTx="editProfile.relationshipNomineePlaceholder"
//               LabelTextProps={{
//                 style: $inputLabel,
//               }}
//               HelperTextProps={{
//                 style: $helperInputText,
//               }}
//               containerStyle={$fields}
//               placeholderTextColor={colors.palette.grayLight}
//               inputWrapperStyle={$inputWrapper}
//               style={$inputStyle}
//               LeftAccessory={leftAccessory(images.relationshipIcon)}
//               RightAccessory={DropDownRightAccessory}
//               helperTx={error?.relation_with_nominee}
//               status={error?.relation_with_nominee ? 'error' : undefined}
//             />
//           </TouchableOpacity>

//           <Button
//             tx="editProfile.updateProfile"
//             style={$buttonStyle}
//             onPress={updateProfileAction}
//           />
//         </View>
//       </Screen>
//       <CountryPickerModal
//         onSelect={data => {
//           setCountryCode(data.dial_code);
//           setShowCountries(false);
//         }}
//         modalVisible={showCountries}
//         onClose={() => {
//           setShowCountries(false);
//         }}
//       />
//       <CustomImagePicker
//         imagePickerModal={imagePickerVisible}
//         onDismiss={() => setImagePickerVisible(false)}
//         callback={uploadImage}
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
//         title="editProfile.relationshipNominee"
//         ref={nomineeSheet}
//         data={nomineeList}
//         selectedId={relashipNominee?.id}
//         onSelect={data => setRelashipNominee(data)}
//         sizes={sizeForSheet(nomineeList.length, insets)}
//       />
//       <Loader loading={props.loading === 'loading'} />
//     </>
//   );
// };

// const $container: ViewStyle = {
//   flexGrow: 1,
// };

// const $header: ViewStyle = {
//   alignItems: 'center',
//   flexDirection: 'row',
//   marginTop: spacing.sm,
//   borderRadius: spacing.xs,
//   marginHorizontal: spacing.md,
//   backgroundColor: colors.palette.white,
// };

// const $mainImageView: ViewStyle = {
//   width: 115,
//   height: 115,
//   margin: spacing.md,
// };

// const $mainImage: ImageStyle = {
//   width: '100%',
//   height: '100%',
//   borderWidth: 1,
//   borderRadius: spacing.xs,
// };

// const $wrapUserDetail: ViewStyle = {
//   flex: 1,
//   gap: spacing.xs,
// };

// const $inputContainer: ViewStyle = {
//   marginTop: spacing.sm,
//   borderRadius: spacing.xs,
//   marginHorizontal: spacing.md,
//   backgroundColor: colors.palette.white,
// };

// const $fields: ViewStyle = {
//   marginHorizontal: spacing.md,
//   marginTop: spacing.sm,
// };

// const $inputWrapper: ViewStyle = {
//   borderWidth: 1,
//   borderRadius: spacing.xs,
//   backgroundColor: colors.palette.white,
// };

// const $inputStyle: TextStyle = {
//   color: colors.palette.black,
// };

// const $buttonStyle: ViewStyle = {
//   margin: spacing.md,
//   marginTop: spacing.lg,
//   borderRadius: spacing.xs,
// };

// const $editImage: ViewStyle = {
//   top: -10,
//   right: -10,
//   position: 'absolute',
// };

// const $countryCodeStyle: ViewStyle = {
//   flexDirection: 'row',
//   height: spacing.lg,
//   marginVertical: spacing.sm,
// };

// const $inputLabel: TextStyle = {
//   marginStart: 0,
//   marginBottom: spacing.xs,
// };

// const $helperInputText: TextStyle = {
//   marginStart: 0,
// };

// const mapStateToProps = (state: RootState) => ({
//   profile: state.auth.myProfile?.data,
//   loading: state.auth.updateLoading,
//   baseUrl: state.home.baseURl,
// });

// const mapDispatch = {
//   getProfile,
//   update: (params: FormData) => updateProfile(params),
//   reset: () => authActions.resetUpdateLoading(),
// };

// const connector = connect(mapStateToProps, mapDispatch);

// export const EditProfileScreen = connector(EditProfile);
