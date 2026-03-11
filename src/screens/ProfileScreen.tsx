// import {
//   Image,
//   ImageSourcePropType,
//   ScrollView,
//   Share,
//   StyleSheet,
//   TextStyle,
//   TouchableOpacity,
//   View,
//   ViewStyle,
// } from 'react-native';
// import { Loader, Screen, Text } from '../components';
// import React, { FC } from 'react';
// import { colors, images, spacing } from '../theme';

// import { scale } from 'react-native-size-matters';
// import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';
// import { translate, TxKeyPath } from '../i18n';
// import { AppStackParamList } from '../navigators';
// import { RootState } from '../store';
// import { connect, ConnectedProps } from 'react-redux';
// import FastImage, { ImageStyle } from '@d11/react-native-fast-image';

// type NavigationProps = AppBottomTabScreenProps<'Profile'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

// type KeysWithUndefinedValues<T> = {
//   [K in keyof T]: T[K] extends undefined ? K : never;
// }[keyof T];

// type Screens =
//   | KeysWithUndefinedValues<AppStackParamList>
//   | 'TermsCondition'
//   | 'PrivacyPolicy'
//   | 'AboutUs';

// type DrawerDataType = {
//   title: TxKeyPath;
//   description?: TxKeyPath;
//   image?: ImageSourcePropType;
//   screen?: Screens;
//   type?: 'heading';
// };

// const DrawerData: DrawerDataType[] = [
//   {
//     title: 'profile.ordersTitle',
//     description: 'profile.ordersDesc',
//     image: images.yourOrder,
//     screen: 'Orders',
//   },
//   {
//     title: 'profile.wishlistTitle',
//     description: 'profile.wishlistDesc',
//     image: images.yourWishlist,
//     screen: 'Wishlist',
//   },
//   // {
//   //   title: 'profile.savedAddressTitle',
//   //   description: 'profile.savedAddressDesc',
//   //   image: images.savedAddress,
//   //   screen: 'SavedAddress',
//   // },
//   {
//     title: 'profile.cartTitle',
//     description: 'profile.cartDesc',
//     image: images.cartIcon,
//     screen: 'Cart',
//   },
//   {
//     title: 'profile.referEarn',
//     description: 'profile.referEarnDesc',
//     image: images.referEarnIcon,
//     screen: 'ReferEarn',
//   },
//   {
//     title: 'profile.bankAccounts',
//     description: 'profile.bankAccountDesc',
//     image: images.bank2Icon,
//     screen: 'BankAccounts',
//   },
//   {
//     title: 'profile.changeLanguage',
//     description: 'profile.changeLanguageDesc',
//     image: images.languageIcon,
//     screen: 'ChangeLanguage',
//   },
//   // {
//   //   title: 'profile.shareTitle',
//   //   description: 'profile.shareDesc',
//   //   image: images.shareIcon,
//   // },
//   {
//     type: 'heading',
//     title: 'profile.supportLegal',
//   },
//   {
//     title: 'profile.aboutUsTitle',
//     description: 'profile.aboutUsDesc',
//     image: images.aboutIcon,
//     screen: 'AboutUs',
//   },
//   // {
//   //   title: 'profile.contactUsTitle',
//   //   description: 'profile.contactUsDesc',
//   //   image: images.helpCenterIcon,
//   //   screen: 'ContactUs',
//   // },
//   {
//     title: 'profile.privacyPolicyTitle',
//     description: 'profile.privacyPolicyDesc',
//     image: images.privacyPolicyIcon,
//     screen: 'PrivacyPolicy',
//   },
//   {
//     title: 'profile.termsConditionsTitle',
//     description: 'profile.termsConditionsDesc',
//     image: images.termsCondIcon,
//     screen: 'TermsCondition',
//   },
//   // {
//   //   title: 'profile.rateAppTitle',
//   //   description: 'profile.rateAppDesc',
//   //   image: images.rateAppTabIcon,
//   //   // screen: 'RateApp',
//   // },
//   // {
//   //   title: 'profile.versionTitle',
//   //   description: 'profile.versionDesc',
//   //   image: images.versionTabIcon,
//   //   // screen: 'Version',
//   // },
//   {
//     title: 'profile.logout',
//     description: 'profile.logoutDesc',
//     image: images.logoutIcon,
//   },
// ];

// const Profile: FC<Props> = props => {
//   const appUrl =
//     'https://play.google.com/store/search?q=Gandharva&c=apps&hl=en_IN';

//   return (
//     <>
//       <Screen
//         preset="fixed"
//         safeAreaEdges={['top']}
//         contentContainerStyle={styles.container}
//       >
//         <ScrollView
//           bouncesZoom={false}
//           bounces={false}
//           alwaysBounceVertical={false}
//           style={styles.scrollView}
//           showsVerticalScrollIndicator={false}
//         >
//           <View style={styles.main}>
//             <View style={styles.profileSection}>
//               <FastImage
//                 source={
//                   props.profileData?.profile
//                     ? {
//                         uri: props.baseUrl + '/' + props.profileData?.profile,
//                       }
//                     : images.vector
//                 }
//                 style={styles.userImage}
//               />
//               <Text
//                 style={styles.boldTextStyle}
//                 weight="medium"
//                 size="lg"
//                 tx="profile.hiUser"
//                 txOptions={{
//                   name: props.profileData?.name,
//                 }}
//               />
//               <TouchableOpacity
//                 onPress={() => props.navigation.navigate('EditProfile')}
//                 style={styles.wrapEditIcon}
//               >
//                 <Image source={images.editIcon} />
//                 <Text weight="medium" size="xxs" tx="profile.editProfile" />
//               </TouchableOpacity>
//             </View>
//             <View
//               style={{
//                 marginBottom: spacing.xxl,
//               }}
//             >
//               {DrawerData?.map((item, index) => {
//                 return (
//                   <DrawerItemView
//                     key={index + item.title}
//                     screen={item.screen}
//                     title={item.title}
//                     type={item.type}
//                     description={item.description}
//                     image={item.image}
//                     onPress={screen => {
//                       if (item.title === 'profile.shareTitle') {
//                         Share.share({
//                           message: `${translate(
//                             'profile.shareAppTitle',
//                           )}\n${appUrl}`,
//                         });
//                       } else if (item.title === 'profile.logout') {
//                         props.navigation.navigate('BottomModal', {
//                           modalType: 'logout',
//                           image: images.logoutIcon,
//                           title: 'profile.logoutConfirmtion',
//                           desc: 'profile.logoutConfirmtionDesc',
//                           btnText: 'profile.yesLogout',
//                         });
//                       } else if (screen) {
//                         props.navigation.navigate(screen as Screens);
//                       }

//                       // } else if (item.label === 'Delete Account') {
//                       //   props.navigation.navigate('CenterModal', {
//                       //     modalType: 'deleteAccount',
//                       //     image: images.deleteGif,
//                       //     title: 'profile.deleteaccount',
//                       //     desc: 'profile.deleteAccountMessage',
//                       //     btnText: 'profile.yesDeleteAccount',
//                       //   });
//                     }}
//                   />
//                 );
//               })}
//               <Text
//                 tx="home.poweredBy"
//                 style={styles.poweredBy}
//                 size="md"
//                 weight="semiBold"
//               />
//             </View>
//           </View>
//         </ScrollView>
//       </Screen>
//       <Loader loading={props.logoutLoading === 'loading'} />
//     </>
//   );
// };

// const mapStateToProps = (state: RootState) => ({
//   profileData: state.auth.myProfile?.data,
//   logoutLoading: state.auth.logoutLoading,
//   baseUrl: state.home.baseURl
// });

// const connector = connect(mapStateToProps);

// export const ProfileScreen = connector(Profile);
// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//   },
//   scrollView: { flex: 1, paddingBottom: 50 },
//   profileSection: {
//     gap: spacing.xxs,
//     alignItems: 'center',
//     marginBottom: spacing.lg,
//     marginHorizontal: spacing.md,
//   } as ViewStyle,

//   boldTextStyle: {
//     flex: 1,
//     color: colors.text,
//     marginTop: spacing.xs,
//   } as TextStyle,

//   primaryTextStyle: {
//     color: colors.primary,
//   } as TextStyle,

//   userImage: {
//     height: 100,
//     width: 100,
//     borderRadius: scale(50),
//     backgroundColor: colors.palette.grayLight3,
//   } as ImageStyle,

//   wrapEditIcon: {
//     gap: spacing.xs,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: spacing.xxs,
//     paddingVertical: spacing.sm,
//     paddingHorizontal: spacing.lg,
//     backgroundColor: colors.primary,
//     marginTop: spacing.xs - spacing.xxxs,
//   } as ViewStyle,

//   main: {
//     flex: 1,
//     marginTop: spacing.sm,
//     justifyContent: 'center',
//   } as ViewStyle,
//   emptyView: { width: 35, height: 35 } as ViewStyle,

//   drawerItemContainer: {
//     padding: spacing.md,
//     minHeight: scale(45),
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: spacing.md,
//     borderRadius: spacing.sm,
//     marginHorizontal: spacing.md,
//     backgroundColor: colors.palette.primaryDimmed,
//   } as ViewStyle,

//   drawerTitleContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     paddingHorizontal: 10,
//   } as ViewStyle,

//   poweredBy: {
//     textAlign: 'center',
//     marginVertical: spacing.md,
//   } as TextStyle,

//   heading: {
//     marginStart: spacing.md,
//     marginBottom: spacing.sm,
//   } as TextStyle,
// });

// const DrawerItemView = ({
//   screen,
//   title,
//   image,
//   type,
//   onPress,
//   description,
// }: {
//   screen?: Screens;
//   title: TxKeyPath;
//   type?: 'heading';
//   description?: TxKeyPath;
//   image?: ImageSourcePropType;
//   onPress: (screen?: Screens) => void;
// }) => {
//   if (type === 'heading') {
//     return <Text style={styles.heading} weight="medium" size="lg" tx={title} />;
//   }
//   return (
//     <TouchableOpacity
//       onPress={() => onPress(screen)}
//       style={styles.drawerItemContainer}
//     >
//       <Image resizeMode='contain' source={image} />
//       <View style={styles.drawerTitleContainer}>
//         <Text weight="medium" size="md" tx={title} />
//         <Text weight="medium" size="xxs" tx={description} />
//       </View>

//       <Image source={images.rightArrow} />
//     </TouchableOpacity>
//   );
// };
