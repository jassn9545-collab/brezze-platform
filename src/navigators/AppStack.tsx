// import {
//   NativeStackScreenProps,
//   createNativeStackNavigator,
// } from '@react-navigation/native-stack';
// import React, { FC, useEffect } from 'react';

// import { colors } from '../theme';
// import { NavigatorScreenParams } from '@react-navigation/native';

// import * as Screens from '../screens';
// import { TxKeyPath } from '../i18n';
// import { ImageSourcePropType } from 'react-native';
// import { DrawerNavigator, DrawerParamsList } from './DrawerNavigator';
// import {
//   BottomTabNavigator,
//   BottomTabNavigatorParamList,
// } from './BottomTabNavigator';
// import { Product } from '../slices/types';

// // import { useAppDispatch } from '../store/hooks';
// // import { getProfile } from '../slices/auth.slice';

// /**
//  * This type allows TypeScript to know what routes are defined in this navigator
//  * as well as what properties (if any) they might take when navigating to them.
//  *
//  * If no params are allowed, pass through `undefined`. Generally speaking, we
//  * recommend using your MobX-State-Tree store(s) to keep application state
//  * rather than passing state through navigation params.
//  *
//  * For more information, see this documentation:
//  *   https://reactnavigation.org/docs/params/
//  *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
//  *   https://reactnavigation.org/docs/typescript/#organizing-types
//  */

// export type AppStackParamList = {
//   BottomTab: NavigatorScreenParams<BottomTabNavigatorParamList>;
//   Drawer: NavigatorScreenParams<DrawerParamsList>;
//   AdvanceBooking: { type: Screens.AdvanceBookingParams };
//   CustomOrders: undefined;
//   AddCustomOrder: undefined;
//   CategoryList: undefined;
//   ProductDetail: { data: Product };

//   SpecialOfferModal: undefined;

//   EditProfile: undefined;
//   SavedAddress: undefined;
//   AddAddress: undefined;
//   Wishlist: undefined;
//   Cart: undefined;
//   Orders: undefined;
//   ReferEarn: undefined;
//   Notification: undefined;
//   FAQ: undefined;
//   Vault: undefined;
//   Withdrawal: undefined;
//   Transection: {
//     type: 'sip' | 'gold' | 'silver';
//     heading: TxKeyPath;
//     investmentText: TxKeyPath;
//     histroyHeading: TxKeyPath;
//   };
//   Thankyou: {
//     type: 'sip' | 'gold' | 'cart';
//     desc: string;
//   };
//   BankAccounts: undefined;
//   AddBankAccount: {
//     type: 'add' | 'edit';
//     data?: MyAccountResponse;
//   };
//   ChangeLanguage: undefined;
//   PrivacyPolicy:
//     | { title: TxKeyPath; type: Screens.StaticType; data?: string }
//     | undefined;
//   TermsCondition:
//     | {
//         title: TxKeyPath;
//         type: Screens.StaticType;
//         data?: string;
//         from?: string;
//       }
//     | undefined;
//   AboutUs:
//     | { title: TxKeyPath; type: Screens.StaticType; data?: string }
//     | undefined;
//   BottomModal: {
//     modalType: 'logout' | 'deleteAccount';
//     title: TxKeyPath;
//     desc: TxKeyPath;
//     image: ImageSourcePropType;
//     btnText: TxKeyPath;
//   };
// };

// export type AppStackScreenProps<T extends keyof AppStackParamList> =
//   NativeStackScreenProps<AppStackParamList, T, 'App'>;

// // Documentation: https://reactnavigation.org/docs/stack-navigator/
// const Stack = createNativeStackNavigator<AppStackParamList, 'App'>();

// export const AppStack: FC = () => {
//   //   const dispatch = useAppDispatch();

//   useEffect(() => {
//     // bootstrap();
//     // let notifeeSubscribe = notifee.onForegroundEvent(({ type, detail }) => {
//     //   if (type === EventType.PRESS && detail.notification) {
//     //     Firebase.redirectionFunction(detail.notification.data ?? {});
//     //   }
//     // });
//     // return () => ;
//     // notifeeSubscribe();
//   }, []);

//   //   useEffect(() => {
//   //     dispatch(getProfile());
//   //   }, [dispatch]);

//   // const bootstrap = async () => {
//   //   let messaging = getMessaging();
//   //   const notification = await getInitialNotification(messaging);
//   //   if (notification) {
//   //     await delay(2600); // wait for the splash to finish
//   //     Firebase.redirectionFunction(notification.data ?? {});
//   //   } else {
//   //     const notifeeData = await notifee.getInitialNotification();
//   //     if (notifeeData) {
//   //       await delay(2600); // wait for the splash to finish
//   //       Firebase.redirectionFunction(notifeeData.notification.data ?? {});
//   //     }
//   //   }
//   // };

//   return (
//     <Stack.Navigator
//       id="App"
//       screenOptions={() => ({
//         headerShown: false,
//         navigationBarColor: colors.background,
//       })}
//       initialRouteName="Drawer"
//     >
//       <Stack.Screen name="Drawer" component={DrawerNavigator} />
//       <Stack.Screen name="BottomTab" component={BottomTabNavigator} />

    
//       <Stack.Screen name="EditProfile" component={Screens.EditProfileScreen} />
//       <Stack.Screen
//         name="SavedAddress"
//         component={Screens.SavedAddressScreen}
//       />
//       <Stack.Screen name="AddAddress" component={Screens.AddAddressScreen} />
     
//       <Stack.Screen name="ReferEarn" component={Screens.ReferEarnScreen} />
//       <Stack.Screen
//         name="Notification"
//         component={Screens.NotificationScreen}
//       />
//       <Stack.Screen name="FAQ" component={Screens.FAQScreen} />
//       <Stack.Screen
//         name="ChangeLanguage"
//         component={Screens.ChangeLanguageScreen}
//       />

//       <Stack.Screen
//         name="PrivacyPolicy"
//         component={Screens.StaticScreen<'PrivacyPolicy'>}
//         initialParams={{ type: 'privacy', title: 'profile.privacyPolicyTitle' }}
//       />
//       <Stack.Screen
//         name="TermsCondition"
//         component={Screens.StaticScreen<'TermsCondition'>}
//         initialParams={{ type: 'terms', title: 'profile.termsConditionsTitle' }}
//       />
//       <Stack.Screen
//         name="AboutUs"
//         component={Screens.StaticScreen<'AboutUs'>}
//         initialParams={{ type: 'about', title: 'profile.aboutUsTitle' }}
//       />

//       <Stack.Group
//         screenOptions={{
//           presentation: 'transparentModal',
//           contentStyle: { backgroundColor: 'transparent' },
//           animation: 'fade_from_bottom',
//         }}
//       >
//         <Stack.Screen name="BottomModal" component={Screens.BottomModal} />
//       </Stack.Group>

//     </Stack.Navigator>
//   );
// };
