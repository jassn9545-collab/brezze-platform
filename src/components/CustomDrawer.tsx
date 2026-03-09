// import React, { FC, useState } from 'react';
// import {
//   View,
//   TouchableOpacity,
//   StyleSheet,
//   Image,
//   ScrollView,
//   ImageSourcePropType,
//   Animated,
// } from 'react-native';
// import { DrawerContentComponentProps } from '@react-navigation/drawer';
// import { colors, images, spacing } from '../theme';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { Text } from './Text';
// import { scale } from 'react-native-size-matters';
// import { TxKeyPath } from '../i18n';
// import { Loader } from './Loader';
// import { useAppSelector } from '../store/hooks';
// import FastImage from '@d11/react-native-fast-image';

// const CustomDrawer: FC<DrawerContentComponentProps> = props => {
//   const insets = useSafeAreaInsets();
//   // const drawerStatus = useDrawerStatus();
//   const [expandedCategory, setExpandedCategory] = useState<boolean>(true);

//   const loadingState = useAppSelector(store => store.auth.logoutLoading);
//   const profile = useAppSelector(store => store.auth.myProfile?.data);
//   const baseUrl = useAppSelector(store => store.home.baseURl);
//   const categories = useAppSelector(store => store.home.categoryList);

//   return (
//     <View style={styles.container}>
//       {/* {drawerStatus === 'open' && (
//         <TouchableOpacity
//           style={[styles.closeBtn, { top: insets.top }]}
//           onPress={() => props.navigation.goBack()}
//           hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
//         >
//           <Animated.Image
//             source={images.rightArrow}
//             style={{ transform: [{ rotate: '180deg' }] }}
//           />
//         </TouchableOpacity>
//       )} */}

//       {/* Header */}
//       <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
//         <FastImage
//           source={
//             profile?.profile
//               ? {
//                   uri: baseUrl + '/' + profile?.profile,
//                 }
//               : images.vector
//           }
//           style={styles.userImage}
//         />
//         <Text
//           weight="medium"
//           size="sm"
//           tx="drawer.hi"
//           style={{ color: colors.palette.white }}
//         />
//         <Text weight="medium" size="xl" text={profile?.name} />
//       </View>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         style={styles.scrollView}
//         contentContainerStyle={styles.scrollViewContainer}
//       >
//         {/* Main Menu */}
//         <View style={styles.menuContainer}>
//           <DrawerItem
//             image={images.paymentHistory}
//             tx="drawer.paymentHistory"
//             onPress={() => props.navigation.navigate('Vault')}
//           />
//           <DrawerItem
//             image={images.withDrawal}
//             tx="drawerScreens.withdrawal"
//             onPress={() => props.navigation.navigate('Withdrawal')}
//           />
//           <DrawerItem
//             image={images.yourOrder}
//             tx="drawer.yourOrder"
//             onPress={() => props.navigation.navigate('Orders')}
//           />
//           <DrawerItem
//             image={images.yourWishlist}
//             tx="drawer.yourWishlist"
//             onPress={() => props.navigation.navigate('Wishlist')}
//           />
//           <View style={styles.categoryContainer}>
//             <TouchableOpacity
//               activeOpacity={0.9}
//               style={styles.categoryHeader}
//               onPress={() => setExpandedCategory(!expandedCategory)}
//             >
//               <Image source={images.category} style={styles.categoryImage} />
//               <Text
//                 size="lg"
//                 weight="medium"
//                 tx="home.category"
//                 style={styles.flexOne}
//               />

//               <Animated.Image
//                 source={images.rightArrow}
//                 style={{
//                   transform: [
//                     {
//                       rotate: expandedCategory ? '-90deg' : '90deg',
//                     },
//                   ],
//                 }}
//               />
//             </TouchableOpacity>

//             <View style={expandedCategory && styles.subCategoryContainer}>
//               {expandedCategory &&
//                 categories.map(item => (
//                   <TouchableOpacity
//                     key={item.id}
//                     style={styles.subItem}
//                     onPress={() =>
//                       props.navigation.navigate('BottomTab', {
//                         screen: 'ProductList',
//                         params: { categoryId: item.id },
//                       })
//                     }
//                   >
//                     <Text weight="medium" size="lg" text={item.name} />
//                     <View
//                       style={{
//                         width: spacing.xs,
//                         height: spacing.xs,
//                         borderRadius: spacing.xxs,
//                         backgroundColor: colors.primary,
//                       }}
//                     />
//                   </TouchableOpacity>
//                 ))}
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//       <TouchableOpacity
//         style={[
//           styles.signOutItem,
//           { paddingBottom: insets.bottom + spacing.xs },
//         ]}
//         onPress={() =>
//           props.navigation.navigate('BottomModal', {
//             modalType: 'logout',
//             image: images.logoutIcon,
//             title: 'profile.logoutConfirmtion',
//             desc: 'profile.logoutConfirmtionDesc',
//             btnText: 'profile.yesLogout',
//           })
//         }
//       >
//         <Image source={images.signOut} />
//         <Text
//           weight="medium"
//           size="lg"
//           tx="drawer.signOut"
//           style={{ color: colors.error }}
//         />
//       </TouchableOpacity>
//       <Loader loading={loadingState === 'loading'} />
//     </View>
//   );
// };

// type DrawerItemParams = {
//   tx: TxKeyPath;
//   image: ImageSourcePropType;
//   onPress: () => void;
// };
// const DrawerItem = ({ tx, onPress, image }: DrawerItemParams) => (
//   <TouchableOpacity style={styles.singleItem} onPress={onPress}>
//     <Image source={image} />
//     <Text weight="medium" size="lg" tx={tx} style={styles.flexOne} />
//     <Image source={images.rightArrow} />
//   </TouchableOpacity>
// );

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: colors.primary,
//   },
//   flexOne: {
//     flex: 1,
//   },
//   // closeBtn: {
//   //   zIndex: 1,
//   //   right: -spacing.xs,
//   //   padding: spacing.xxs,
//   //   position: 'absolute',
//   //   borderRadius: spacing.md,
//   //   backgroundColor: colors.primary,
//   // },
//   header: {
//     marginBottom: spacing.lg,
//     marginHorizontal: spacing.md,
//   },
//   userImage: {
//     height: 70,
//     width: 70,
//     borderRadius: scale(10),
//     marginBottom: spacing.xs,
//   },
//   scrollViewContainer: {
//     flexGrow: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   menuContainer: {
//     flex: 1,
//     backgroundColor: colors.palette.primaryDimmed,
//   },
//   singleItem: {
//     gap: spacing.sm,
//     alignItems: 'center',
//     flexDirection: 'row',
//     padding: spacing.md,
//     borderRadius: spacing.sm,
//     marginVertical: spacing.xs,
//     marginHorizontal: spacing.md,
//     justifyContent: 'space-between',
//     backgroundColor: colors.primary,
//   },
//   categoryContainer: {
//     overflow: 'hidden',
//     margin: spacing.md,
//     marginTop: spacing.xs,
//     borderRadius: spacing.sm,
//     backgroundColor: colors.primary,
//   },
//   categoryHeader: {
//     gap: spacing.xs,
//     alignItems: 'center',
//     flexDirection: 'row',
//     paddingVertical: spacing.md,
//     backgroundColor: colors.primary,
//     paddingHorizontal: spacing.md,
//   },
//   categoryImage: {
//     width: scale(35),
//     height: scale(35),
//     padding: spacing.xxs,
//     borderRadius: spacing.sm,
//     backgroundColor: colors.palette.black,
//   },
//   subCategoryContainer: {
//     marginBottom: spacing.md,
//     borderRadius: spacing.sm,
//     paddingVertical: spacing.md,
//     marginHorizontal: spacing.md,
//     backgroundColor: colors.palette.primaryDimmed,
//   },
//   subItem: {
//     gap: spacing.xs,
//     alignItems: 'center',
//     flexDirection: 'row',
//     paddingVertical: spacing.xs,
//     marginHorizontal: spacing.xl,
//     justifyContent: 'space-between',
//   },
//   signOutItem: {
//     gap: spacing.xs,
//     padding: spacing.md,
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     backgroundColor: colors.palette.dimRed,
//   },
// });

// const SideMenu = (props: DrawerContentComponentProps) => (
//   <CustomDrawer {...props} />
// );
// export default SideMenu;
