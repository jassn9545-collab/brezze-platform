// import {
//   Image,
//   ImageStyle,
//   TextStyle,
//   TouchableOpacity,
//   View,
//   ViewStyle,
// } from 'react-native';
// import React, {FC, useState} from 'react';
// import {colors, images, spacing} from '../theme';

// import {AddressParam} from './AddressSearchModal';
// import {DashedLine} from './DashedLine';
// import {Text} from './Text';

// export type AddressType = 'none' | 'pick' | 'drop';
// type ViewAddressProps = Omit<AddressParam, 'location'>;

// type Props = {
//   type: 'both' | 'pickup' | 'dropoff';
//   pickupAddress?: ViewAddressProps;
//   dropupAddress?: ViewAddressProps;
//   size?: 'small' | 'large';
//   numberOfLines?: number;
//   editable?: boolean;
//   onChange?: (type: AddressType) => void;
//   onPressCurrent?: () => void;
// };

// export const AddressView: FC<Props> = ({
//   type,
//   pickupAddress,
//   dropupAddress,
//   size = 'large',
//   editable = true,
//   numberOfLines,
//   onChange,
//   onPressCurrent,
// }) => {
//   const [margin, setMargin] = useState<number>(spacing.md);
//   const [needUpdate, setNeedUpdate] = useState<boolean>(false);
//   const iconStyle: ImageStyle = {
//     height: size === 'small' ? 17 : 24,
//     width: size === 'small' ? 17 : 24,
//     resizeMode: 'contain',
//   };

//   const currentLocation: ImageStyle = {
//     height: size === 'small' ? 28 : 42,
//     width: size === 'small' ? 28 : 42,
//     resizeMode: 'contain',
//   };

//   const textSize = size === 'small' ? 'xxs' : 'sm';

//   const minHeight =
//     type === 'both'
//       ? size === 'small'
//         ? 92
//         : 128
//       : size === 'small'
//       ? 46
//       : 64;

//   const extraStyle = {minHeight, marginHorizontal: editable ? 24 : 0};
//   const mergedTextStyle = editable ? [$textViewStyle, $border] : $textViewStyle;
//   const extraViewStyle = {
//     minWidth: size === 'small' ? spacing.lg + spacing.xxs : spacing.xl,
//   };
//   const extraView = [$extraView, extraViewStyle];
//   if (type === 'both') {
//     return (
//       <View style={[$addressView, extraStyle]}>
//         <View style={[$locationIcons, {marginBottom: margin}]}>
//           <Image source={images.ring} style={iconStyle} />
//           <View style={$line}>
//             {needUpdate && (
//               <DashedLine
//                 dashLength={4}
//                 dashThickness={2}
//                 dashGap={3}
//                 dashColor={colors.palette.verticalLine}
//                 axis="vertical"
//               />
//             )}
//           </View>
//           <Image source={images.icPin} style={iconStyle} />
//         </View>
//         <View style={$addresses}>
//           <TouchableOpacity
//             disabled={!editable}
//             style={mergedTextStyle}
//             onPress={() => onChange?.('pick')}>
//             {pickupAddress?.terminal && (
//               <View style={extraView}>
//                 <Text size={textSize}>{pickupAddress?.terminal}</Text>
//               </View>
//             )}
//             {pickupAddress?.zone && (
//               <View style={extraView}>
//                 <Text size={textSize}>{pickupAddress?.zone}</Text>
//               </View>
//             )}
//             <Text
//               size={textSize}
//               numberOfLines={numberOfLines}
//               preset={!editable && size === 'large' ? 'bold' : 'default'}
//               style={[
//                 {color: pickupAddress ? colors.text : colors.textDim},
//                 $textStyle,
//               ]}>
//               {pickupAddress?.address ?? 'Enter Pickup location'}
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             disabled={!editable}
//             style={[mergedTextStyle, {marginTop: spacing.md}]}
//             onPress={() => onChange?.('drop')}>
//             {dropupAddress?.zone && (
//               <View style={extraView}>
//                 <Text size={textSize}>{dropupAddress?.zone}</Text>
//               </View>
//             )}
//             {dropupAddress?.terminal && (
//               <View style={extraView}>
//                 <Text size={textSize}>{dropupAddress?.terminal}</Text>
//               </View>
//             )}
//             <Text
//               size={textSize}
//               preset={!editable && size === 'large' ? 'bold' : 'default'}
//               numberOfLines={numberOfLines}
//               onLayout={event => {
//                 if (needUpdate) {
//                   return;
//                 }
//                 const {height} = event.nativeEvent.layout;
//                 let buffer = size === 'small' ? spacing.xxxs : spacing.xs;
//                 let absoluteMargin = height - buffer;
//                 setNeedUpdate(true);
//                 setMargin(absoluteMargin);
//               }}
//               style={[
//                 {color: dropupAddress ? colors.text : colors.textDim},
//                 $textStyle,
//               ]}>
//               {dropupAddress?.address ?? 'Enter Destination'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//         {editable && (
//           <TouchableOpacity
//             style={{marginTop: spacing.sm}}
//             onPress={onPressCurrent}>
//             <Image source={images.currentLocation} style={currentLocation} />
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   } else if (type === 'pickup') {
//     return (
//       <View style={[$addressView, extraStyle]}>
//         <View style={$locationIcons}>
//           <Image source={images.ring} style={iconStyle} />
//         </View>
//         <View style={$addresses}>
//           <TouchableOpacity
//             disabled={!editable}
//             style={mergedTextStyle}
//             onPress={() => onChange?.('pick')}>
//             {pickupAddress?.terminal && (
//               <View style={extraView}>
//                 <Text size={textSize}>{pickupAddress?.terminal}</Text>
//               </View>
//             )}
//             {pickupAddress?.zone && (
//               <View style={extraView}>
//                 <Text size={textSize}>{pickupAddress?.zone}</Text>
//               </View>
//             )}
//             <Text
//               size={textSize}
//               numberOfLines={numberOfLines}
//               preset={!editable && size === 'large' ? 'bold' : 'default'}
//               style={[
//                 {color: pickupAddress ? colors.text : colors.textDim},
//                 $textStyle,
//               ]}>
//               {pickupAddress?.address ?? 'Enter Pickup location'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//         {editable && (
//           <TouchableOpacity
//             style={{marginTop: spacing.sm}}
//             onPress={onPressCurrent}>
//             <Image source={images.currentLocation} style={currentLocation} />
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   } else {
//     return (
//       <View style={[$addressView, extraStyle]}>
//         <View style={$locationIcons}>
//           <Image source={images.icPin} style={iconStyle} />
//         </View>
//         <View style={$addresses}>
//           <TouchableOpacity
//             disabled={!editable}
//             style={mergedTextStyle}
//             onPress={() => onChange?.('drop')}>
//             {dropupAddress?.zone && (
//               <View style={extraView}>
//                 <Text size={textSize}>{dropupAddress?.zone}</Text>
//               </View>
//             )}
//             {dropupAddress?.terminal && (
//               <View style={extraView}>
//                 <Text size={textSize}>{dropupAddress?.terminal}</Text>
//               </View>
//             )}
//             <Text
//               size={textSize}
//               preset={!editable && size === 'large' ? 'bold' : 'default'}
//               numberOfLines={numberOfLines}
//               style={[
//                 {color: dropupAddress ? colors.text : colors.textDim},
//                 $textStyle,
//               ]}>
//               {dropupAddress?.address ?? 'Enter Destination'}
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }
// };

// const $addressView: ViewStyle = {
//   flexDirection: 'row',
//   marginHorizontal: 24,
// };

// const $textStyle: ViewStyle = {
//   flex: 1,
// };

// const $locationIcons: ViewStyle = {
//   marginVertical: spacing.md,
// };

// const $addresses: ViewStyle = {
//   flex: 1,
//   marginVertical: spacing.md,
//   marginHorizontal: spacing.xs,
//   justifyContent: 'space-between',
// };

// const $line: ViewStyle = {
//   flex: 1,
//   alignItems: 'center',
// };

// const $textViewStyle: TextStyle = {
//   marginHorizontal: spacing.xs,
//   paddingHorizontal: spacing.xs,
//   flexDirection: 'row',
//   alignItems: 'center',
//   gap: spacing.xs,
// };

// const $border: ViewStyle = {
//   borderBottomWidth: 1,
//   borderBottomColor: colors.primary,
//   paddingBottom: spacing.xs,
// };

// const $extraView: ViewStyle = {
//   borderWidth: 1,
//   borderColor: colors.primary,
//   paddingVertical: spacing.xxs,
//   paddingHorizontal: spacing.xxs + spacing.xxxs,
//   borderRadius: 5,
//   alignItems: 'center',
// };
