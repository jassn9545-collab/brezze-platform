// import {
//   Image,
//   StyleProp,
//   TextStyle,
//   TouchableOpacity,
//   View,
//   ViewStyle,
// } from 'react-native';
// import { colors, spacing } from '../theme';

// import React from 'react';
// import { Text } from '.';
// import { TxKeyPath } from '../i18n';
// import { images } from '../theme/images';
// import { useNavigation } from '@react-navigation/native';

// export type BackButtomProps = {
//   style?: StyleProp<ViewStyle>;
//   heading?: string;
//   headingTx?: TxKeyPath;
//   // Extras
//   rightComponent?: React.ReactNode;
// };

// export const BackButtom = ({
//   heading,
//   headingTx,
//   style = { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
//   rightComponent,
// }: BackButtomProps) => {
//   const navigation = useNavigation();

//   return (
//     <View style={[$container, style]}>
//       <TouchableOpacity onPress={() => navigation.goBack()} style={$wrapArrow}>
//         <Image source={images.leftArrowIcon} tintColor={colors.palette.white} />
//       </TouchableOpacity>
//       {headingTx && (
//         <Text tx={headingTx} preset="heading" size="lg" style={$heading} />
//       )}
//       {heading && (
//         <Text text={heading} preset="heading" size="lg" style={$heading} />
//       )}
//       {rightComponent}
//     </View>
//   );
// };

// const $container: ViewStyle = {
//   gap: spacing.sm,
//   flexDirection: 'row',
//   alignItems: 'center',
//   backgroundColor: colors.background,
// };
// const $wrapArrow: ViewStyle = {
//   padding: spacing.xs,
//   alignSelf: 'flex-end',
//   borderRadius: spacing.xxs,
//   backgroundColor: colors.palette.black,
// };

// const $heading: TextStyle = {
//   flex: 1,
// };
