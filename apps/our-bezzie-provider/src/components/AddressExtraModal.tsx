// import {
//   ExtraAddressParams,
//   buildError,
//   extraAddressScheme,
// } from '../apis/schema';
// import {
//   Modal,
//   TextStyle,
//   TouchableOpacity,
//   View,
//   ViewStyle,
// } from 'react-native';
// import React, {FC, useState} from 'react';
// import {TxKeyPath, translate} from '../i18n';
// import {colors, spacing} from '../theme';

// import {Button} from './Button';
// import {Screen} from './Screen';
// import {Text} from './Text';
// import {TextField} from './TextField';

// type AddressExtraModalProps = {
//   visible: boolean;
//   type: string;
//   onClose: () => void;
//   onSubmit: (extra: ExtraAddressParams) => void;
// };

// type FieldError = {
//   zone: TxKeyPath | undefined;
//   terminal: TxKeyPath | undefined;
// };

// const AddressExtraModal: FC<AddressExtraModalProps> = props => {
//   const [zone, setZone] = useState('');
//   const [terminal, setTerminal] = useState('');
//   const [error, setError] = useState<FieldError>();

//   const submit = () => {
//     extraAddressScheme
//       .validate(
//         {
//           type: props.type,
//           zone,
//           terminal,
//         },
//         {abortEarly: false},
//       )
//       .then(res => {
//         props.onSubmit(res);
//         close();
//         setError(undefined);
//       })
//       .catch(errors => {
//         const err = buildError<FieldError>(errors);
//         setError(err);
//       });
//   };

//   const close = () => {
//     setZone('');
//     setTerminal('');
//     setError(undefined);
//     props.onClose();
//   };

//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={props.visible}
//       onRequestClose={close}>
//       <Screen
//         backgroundColor={colors.palette.overlay20}
//         contentContainerStyle={$modalContainer}>
//         <View style={$modalContainer}>
//           <TouchableOpacity onPress={close} style={$container} />
//           <View style={[$modalContent, {paddingBottom: spacing.lg}]}>
//             <Text tx="address.airport" preset="semibold" size="lg" />
//             <Text
//               tx="address.airportNote"
//               txOptions={{
//                 type: translate(('address.' + props.type) as TxKeyPath),
//               }}
//               preset="subheading"
//             />
//             <View style={$buttonsView}>
//               <TextField
//                 value={terminal}
//                 onChangeText={setTerminal}
//                 placeholderTx="address.terminal"
//                 containerStyle={$fieldStyle}
//                 status={error?.terminal ? 'error' : undefined}
//                 helperTx={error?.terminal}
//               />
//               <TextField
//                 value={zone}
//                 onChangeText={setZone}
//                 placeholderTx="address.zone"
//                 containerStyle={$fieldStyle}
//                 status={error?.zone ? 'error' : undefined}
//                 helperTx={error?.zone}
//               />
//             </View>
//             <View style={$buttonsView}>
//               <TouchableOpacity style={$notApplicable} onPress={close}>
//                 <Text tx="address.notApplicable" />
//               </TouchableOpacity>
//               <Button tx="address.submit" style={$container} onPress={submit} />
//             </View>
//           </View>
//         </View>
//       </Screen>
//     </Modal>
//   );
// };

// export default AddressExtraModal;

// const $container: ViewStyle = {
//   flex: 1,
// };

// const $modalContainer: ViewStyle = {
//   flexGrow: 1,
//   backgroundColor: colors.palette.overlay20,
// };

// const $modalContent: ViewStyle = {
//   backgroundColor: colors.background,
//   padding: spacing.lg,
//   borderTopLeftRadius: spacing.xl,
//   borderTopRightRadius: spacing.xl,
// };

// const $fieldStyle: TextStyle = {
//   borderRadius: 10,
//   flex: 1,
// };

// const $notApplicable: ViewStyle = {
//   flexDirection: 'row',
//   alignItems: 'center',
//   gap: spacing.sm,
//   flex: 1,
// };

// const $buttonsView: ViewStyle = {
//   flexDirection: 'row',
//   marginTop: spacing.md,
//   marginHorizontal: spacing.md,
//   gap: spacing.md,
// };
