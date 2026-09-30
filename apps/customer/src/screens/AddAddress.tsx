// import {
//   ScrollView,
//   TextInput,
//   TextStyle,
//   TouchableOpacity,
//   View,
//   ViewStyle,
// } from 'react-native';
// import { colors, spacing } from '../theme';
// import { BackButtom, Button, Screen, Text } from '../components';
// import React, { FC, useEffect, useRef, useState } from 'react';
// import { TextField } from '../components/TextField';
// import { TxKeyPath } from '../i18n';

// import { AppStackScreenProps } from '../navigators';
// import { AddressPrediction, LatLng } from '../components/Address.types';
// import { debouncedSearch, getPlaceDetails } from '../apis/googleAPIs';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { addAddressParams, addAddressScheme, buildError } from '../apis/schema';

// type NavigationProps = AppStackScreenProps<'AddAddress'>;
// // type Props = NavigationProps & StoreProps;

// type FieldError = {
//   name?: TxKeyPath | undefined;
//   address?: TxKeyPath | undefined;
//   landmark?: TxKeyPath | undefined;
//   pinCode?: TxKeyPath | undefined;
//   city?: TxKeyPath | undefined;
//   state?: TxKeyPath | undefined;
//   mobileNumber?: TxKeyPath | undefined;
//   anotherMobileNumber?: TxKeyPath | undefined;
// };
// interface SavedAddressParams {
//   address: string;
//   location: LatLng;
// }

// const AddAddress: FC<NavigationProps> = () => {
//   //   const {
//   //    name: oldName,
//   //     countryCode: oldCountryCode,
//   //     mobileNumber: oldMobileNumber,
//   //   } = props.profile ?? {};

//   const {
//     oldName = 'Mandeep Saini',
//     oldCountryCode = '+91',
//     oldMobileNumber = '7814667566',
//   } = {};

//   const insets = useSafeAreaInsets();
//   const input = useRef<TextInput>(null);

//   const [name, setName] = useState(oldName ?? '');
//   const [finished, setFinished] = useState(false);
//   const [results, setResults] = useState<AddressPrediction[]>([]);
//   const [selectedAddress, setSelectedAddress] = useState<SavedAddressParams>();
//   const [query, setQuery] = useState('');

//   const [landmark, setLandmark] = useState('');
//   const [pinCode, setPinCode] = useState('');
//   const [city, setCity] = useState('');
//   const [state, setState] = useState('');
//   const [mobileNumber, setMobileNumber] = useState(oldMobileNumber ?? '');
//   const [anotherMobileNumber, setAnotherMobileNumber] = useState('');

//   const [error, setError] = useState<FieldError>({});

//   useEffect(() => {
//     if (query !== '' && finished !== true) {
//       (async () => {
//         try {
//           const address = await debouncedSearch(query);
//           if (address) {
//             setResults(address);
//           }
//         } catch (err) {
//           console.log('Error is address search:', err);
//         }
//       })();
//     } else {
//       setResults([]);
//     }
//   }, [finished, query]);

//   const onSelectAddress = (item: AddressPrediction) => {
//     input.current?.blur();
//     setQuery(item.description ?? '');
//     if (input.current) {
//       input.current.setNativeProps({ text: item.description });
//     }
//     getPlaceDetails(item.place_id)
//       .then(address => {
//         const components = address.address_components || [];
//         const getComponent = (type: string) => {
//           const component = components?.find(c => c.types.includes(type));
//           return component?.long_name || '';
//         };
//         const stateName = getComponent('administrative_area_level_1');
//         const cityName =
//           getComponent('locality') ||
//           getComponent('administrative_area_level_2');
//         const postalCode = getComponent('postal_code');

//         setState(stateName);
//         setCity(cityName);
//         setPinCode(postalCode);

//         setQuery(address.formatted_address ?? '');
//         setSelectedAddress({
//           address: address.formatted_address ?? '',
//           location: address.geometry.location,
//         });
//         setFinished(true);
//         setResults([]);
//       })
//       .catch(err => toast?.show(err.message, { type: 'danger' }));
//   };

//   const validate = () => {
//     const params: addAddressParams = {
//       name: name,
//       address: selectedAddress?.address!,
//       landmark: landmark,
//       pinCode: pinCode,
//       city: city,
//       state: state,
//       country_code: oldCountryCode,
//       mobileNumber: mobileNumber,
//       anotherMobileNumber: mobileNumber,
//     };
//     addAddressScheme
//       .validate(params, { abortEarly: false })
//       .then(res => {
//         console.log('res', res);
//         setError({});
//       })
//       .catch(errors => {
//         const err = buildError<FieldError>(errors);
//         setError(err);
//       });
//   };

//   return (
//     <>
//       <BackButtom
//         headingTx="address.addAdress"
//         style={[
//           $header,
//           {
//             paddingTop: insets.top + spacing.xs,
//           },
//         ]}
//       />
//       <Screen
//         preset="fixed"
//         safeAreaEdges={['bottom']}
//         contentContainerStyle={$container}
//       >
//         <ScrollView
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//         >
//           <View style={$inputContainer}>
//             <TextField
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
//               value={name}
//               onChangeText={setName}
//               labelTx="editProfile.fullName"
//               placeholderTx="editProfile.namePlaceholder"
//               helperTx={error?.name}
//               status={error?.name ? 'error' : undefined}
//             />
//             <TextField
//               ref={input}
//               value={query}
//               onChangeText={text => {
//                 setFinished(false);
//                 setQuery(text);
//               }}
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
//               labelTx="address.address"
//               multiline
//               helperTx={error?.address}
//               status={error?.address ? 'error' : undefined}
//             />
//             {!finished && input.current?.isFocused() && results.length > 0 && (
//               <ScrollView
//                 style={$addressSearch}
//                 nestedScrollEnabled
//                 keyboardShouldPersistTaps="handled"
//               >
//                 {results.map(item => (
//                   <TouchableOpacity
//                     key={item.place_id}
//                     style={{ padding: spacing.xs }}
//                     onPress={() => onSelectAddress(item)}
//                   >
//                     <Text text={item.description} />
//                   </TouchableOpacity>
//                 ))}
//               </ScrollView>
//             )}

//             <TextField
//               LabelTextProps={{
//                 style: $inputLabel,
//               }}
//               containerStyle={$fields}
//               placeholderTextColor={colors.palette.grayLight}
//               inputWrapperStyle={$inputWrapper}
//               style={$inputStyle}
//               value={landmark}
//               onChangeText={setLandmark}
//               labelTx="address.landmark"
//               placeholderTx="address.landmarkPlaceholder"
//               helperTx={error?.landmark}
//               status={error?.landmark ? 'error' : undefined}
//             />
//             <TextField
//               LabelTextProps={{
//                 style: $inputLabel,
//               }}
//               containerStyle={$fields}
//               placeholderTextColor={colors.palette.grayLight}
//               inputWrapperStyle={$inputWrapper}
//               style={$inputStyle}
//               value={pinCode}
//               onChangeText={setPinCode}
//               labelTx="address.pincode"
//               placeholderTx="address.pincodePlaceholder"
//               helperTx={error?.pinCode}
//               status={error?.pinCode ? 'error' : undefined}
//             />
//             <TextField
//               LabelTextProps={{
//                 style: $inputLabel,
//               }}
//               containerStyle={$fields}
//               placeholderTextColor={colors.palette.grayLight}
//               inputWrapperStyle={$inputWrapper}
//               style={$inputStyle}
//               value={city}
//               onChangeText={setCity}
//               labelTx="address.city"
//               placeholderTx="address.cityPlaceholder"
//               helperTx={error?.city}
//               status={error?.city ? 'error' : undefined}
//             />
//             <TextField
//               LabelTextProps={{
//                 style: $inputLabel,
//               }}
//               containerStyle={$fields}
//               placeholderTextColor={colors.palette.grayLight}
//               inputWrapperStyle={$inputWrapper}
//               style={$inputStyle}
//               value={state}
//               onChangeText={setState}
//               labelTx="address.state"
//               placeholderTx="address.statePlaceholder"
//               helperTx={error?.state}
//               status={error?.state ? 'error' : undefined}
//             />
//             <TextField
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
//               value={mobileNumber ? `${oldCountryCode} ${mobileNumber}` : ''}
//               onChangeText={text => {
//                 const dialCode = oldCountryCode.replace('+', '\\+');
//                 const cleaned = text
//                   .replace(new RegExp(`^${dialCode}\\s?`), '')
//                   .replace(/\D/g, '');
//                 setMobileNumber(cleaned);
//               }}
//               keyboardType="phone-pad"
//               labelTx="address.phoneNumber"
//               placeholderTx="address.phonePlaceholder"
//               helperTx={error?.mobileNumber}
//               status={error?.mobileNumber ? 'error' : undefined}
//             />
//             <TextField
//               LabelTextProps={{
//                 style: $inputLabel,
//               }}
//               containerStyle={$fields}
//               placeholderTextColor={colors.palette.grayLight}
//               inputWrapperStyle={$inputWrapper}
//               style={$inputStyle}
//               value={
//                 anotherMobileNumber
//                   ? `${oldCountryCode} ${anotherMobileNumber}`
//                   : ''
//               }
//               onChangeText={text => {
//                 const dialCode = oldCountryCode.replace('+', '\\+');
//                 const cleaned = text
//                   .replace(new RegExp(`^${dialCode}\\s?`), '')
//                   .replace(/\D/g, '');
//                 setAnotherMobileNumber(cleaned);
//               }}
//               keyboardType="phone-pad"
//               labelTx="address.alternativePhoneNumber"
//               placeholderTx="address.alternativePhonePlaceholder"
//               helperTx={error?.anotherMobileNumber}
//               status={error?.anotherMobileNumber ? 'error' : undefined}
//             />
//             <Button
//               tx="address.saveAddress"
//               style={$buttonStyle}
//               onPress={validate}
//             />
//           </View>
//         </ScrollView>
//       </Screen>
//       {/* <Loader loading={props.loading === 'loading'} /> */}
//     </>
//   );
// };

// const $container: ViewStyle = {
//   flexGrow: 1,
// };

// const $header: ViewStyle = {
//   paddingTop: spacing.sm,
//   paddingHorizontal: spacing.md,
// };

// const $addressSearch: ViewStyle = {
//   height: 200,
//   overflow: 'hidden',
//   marginTop: spacing.xs,
//   marginHorizontal: spacing.md,
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

// const $helperInputText: TextStyle = {
//   marginStart: 0,
// };

// const $buttonStyle: ViewStyle = {
//   margin: spacing.md,
//   marginTop: spacing.lg,
//   borderRadius: spacing.xs,
// };

// const $inputLabel: TextStyle = {
//   marginStart: 0,
//   marginBottom: spacing.xs,
// };

// export const AddAddressScreen = AddAddress;
