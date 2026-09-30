// import {
//   Image,
//   TextStyle,
//   TouchableOpacity,
//   View,
//   ViewStyle,
// } from 'react-native';
// import { BackButtom, Screen, Text } from '../components';
// import React, { FC } from 'react';

// import { AppStackScreenProps } from '../navigators';
// import { colors, images, spacing } from '../theme';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// type NavigationProps = AppStackScreenProps<'SavedAddress'>;
// // type Props = NavigationProps & StoreProps;

// const SavedAddress: FC<NavigationProps> = props => {
//   const insets = useSafeAreaInsets();

//   return (
//     <>
//       <BackButtom
//         headingTx="address.savedAddress"
//         style={[
//           $header,
//           {
//             paddingTop: insets.top + spacing.xs,
//           },
//         ]}
//       />

//       <Screen
//         preset="scroll"
//         safeAreaEdges={['bottom']}
//         contentContainerStyle={$container}
//       >
//         <TouchableOpacity
//           style={$addAddressBtn}
//           onPress={() => props.navigation.navigate('AddAddress')}
//         >
//           <Image source={images.location} />
//           <Text
//             size="sm"
//             weight="medium"
//             tx="address.addAdress"
//             style={$flex}
//           />
//           <Image source={images.rightArrow} />
//         </TouchableOpacity>

//         <View style={$wrapEmptyContent}>
//           <Image source={images.noData} style={{ marginBottom: spacing.md }} />
//           <Text
//             size="md"
//             weight="medium"
//             tx="address.noData"
//             style={$textCenter}
//           />
//           <Text
//             size="xs"
//             weight="light"
//             tx="address.noDataDesc"
//             style={$textCenter}
//           />
//         </View>
//       </Screen>
//       {/* <Loader loading={props.loading === 'loading'} /> */}
//     </>
//   );
// };

// const $container: ViewStyle = {
//   flexGrow: 1,
// };

// const $flex: ViewStyle = {
//   flex: 1,
// };

// const $header: ViewStyle = {
//   paddingBottom: spacing.md,
//   paddingHorizontal: spacing.md,
// };

// const $addAddressBtn: ViewStyle = {
//   borderWidth: 1,
//   gap: spacing.xs,
//   alignItems: 'center',
//   flexDirection: 'row',
//   borderRadius: spacing.xs,
//   paddingVertical: spacing.sm,
//   marginHorizontal: spacing.md,
//   paddingHorizontal: spacing.sm,
//   backgroundColor: colors.primary,
// };

// const $wrapEmptyContent: ViewStyle = {
//   flex: 1,
//   gap: spacing.xs,
//   alignItems: 'center',
//   justifyContent: 'center',
//   marginHorizontal: spacing.xl,
// };

// const $textCenter: TextStyle = {
//   textAlign: 'center',
// };

// export const SavedAddressScreen = SavedAddress;
