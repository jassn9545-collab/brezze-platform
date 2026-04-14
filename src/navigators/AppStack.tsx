import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import React, { FC, useEffect } from 'react';

import { colors } from '../theme';
import { NavigatorScreenParams } from '@react-navigation/native';

import * as Screens from '../screens';
// import { TxKeyPath } from '../i18n';
// import { ImageSourcePropType } from 'react-native';
import { DrawerNavigator, DrawerParamsList } from './DrawerNavigator';
import {
  BottomTabNavigator,
  BottomTabNavigatorParamList,
} from './BottomTabNavigator';
import { HireHistoryScreen, JobPostConfirmScreen, jobPostDetailsScreen, jobPostListScreen, JobPostScreen, ProfessionalProfileScreen, HelpSupportScreen } from '../screens';
import { CategoriesScreen } from '../screens';
import { JobPostFirstParams } from '../apis/schema';

// import { useAppDispatch } from '../store/hooks';
// import { getProfile } from '../slices/auth.slice';

/**
 * This type allows TypeScript to know what routes are defined in this navigator
 * as well as what properties (if any) they might take when navigating to them.
 *
 * If no params are allowed, pass through `undefined`. Generally speaking, we
 * recommend using your MobX-State-Tree store(s) to keep application state
 * rather than passing state through navigation params.
 *
 * For more information, see this documentation:
 *   https://reactnavigation.org/docs/params/
 *   https://reactnavigation.org/docs/typescript#type-checking-the-navigator
 *   https://reactnavigation.org/docs/typescript/#organizing-types
 */

export type AppStackParamList = {
  BottomTab: NavigatorScreenParams<BottomTabNavigatorParamList>;
  Drawer: NavigatorScreenParams<DrawerParamsList>;
  JobPost: undefined;
  JobPostStep2: JobPostFirstParams;
  JobPostList: undefined;
  jobPostDetails: Screens.JobPostDetailParams;
  HireHistory: undefined;
  Categories: undefined;
  HireHistoryDetails: undefined;
  ProfessionalProfile: undefined;
  HelpSupport: undefined;
  ChatDetail: undefined;


  //modal
  CenterModal: Screens.CenterModalParams
};

export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T, 'App'>;

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList, 'App'>();

export const AppStack: FC = () => {
  //   const dispatch = useAppDispatch();

  useEffect(() => {
    // bootstrap();
    // let notifeeSubscribe = notifee.onForegroundEvent(({ type, detail }) => {
    //   if (type === EventType.PRESS && detail.notification) {
    //     Firebase.redirectionFunction(detail.notification.data ?? {});
    //   }
    // });
    // return () => ;
    // notifeeSubscribe();
  }, []);

  //   useEffect(() => {
  //     dispatch(getProfile());
  //   }, [dispatch]);

  // const bootstrap = async () => {
  //   let messaging = getMessaging();
  //   const notification = await getInitialNotification(messaging);
  //   if (notification) {
  //     await delay(2600); // wait for the splash to finish
  //     Firebase.redirectionFunction(notification.data ?? {});
  //   } else {
  //     const notifeeData = await notifee.getInitialNotification();
  //     if (notifeeData) {
  //       await delay(2600); // wait for the splash to finish
  //       Firebase.redirectionFunction(notifeeData.notification.data ?? {});
  //     }
  //   }
  // };

  return (
    <Stack.Navigator
      id="App"
      screenOptions={() => ({
        headerShown: false,
        navigationBarColor: colors.background,
      })}
      initialRouteName="Drawer"
      >
      <Stack.Screen name="Drawer" component={DrawerNavigator} />
      <Stack.Screen name="BottomTab" component={BottomTabNavigator} />

      <Stack.Screen name="JobPost" component={JobPostScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="JobPostStep2" component={JobPostConfirmScreen} />
      <Stack.Screen name="JobPostList" component={jobPostListScreen} />
      <Stack.Screen name="jobPostDetails" component={jobPostDetailsScreen} />
      <Stack.Screen name="HireHistory" component={HireHistoryScreen} />
      <Stack.Screen name="ProfessionalProfile" component={ProfessionalProfileScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="ChatDetail" component={Screens.ChatDetailScreen} />
      <Stack.Group
        screenOptions={{
          presentation: 'transparentModal',
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen
          name="CenterModal"
          component={Screens.CenterModal}
        />
      </Stack.Group>
      {/* <Stack.Screen name="EditProfile" component={Screens.EditProfileScreen} />
      <Stack.Screen
        name="SavedAddress"
        component={Screens.SavedAddressScreen}
      />
      <Stack.Screen name="AddAddress" component={Screens.AddAddressScreen} />
     
      <Stack.Screen name="ReferEarn" component={Screens.ReferEarnScreen} />
      <Stack.Screen
        name="Notification"
        component={Screens.NotificationScreen}
      />
      <Stack.Screen name="FAQ" component={Screens.FAQScreen} />
      <Stack.Screen
        name="ChangeLanguage"
        component={Screens.ChangeLanguageScreen}
      />

      <Stack.Screen
        name="PrivacyPolicy"
        component={Screens.StaticScreen<'PrivacyPolicy'>}
        initialParams={{ type: 'privacy', title: 'profile.privacyPolicyTitle' }}
      />
      <Stack.Screen
        name="TermsCondition"
        component={Screens.StaticScreen<'TermsCondition'>}
        initialParams={{ type: 'terms', title: 'profile.termsConditionsTitle' }}
      />
      <Stack.Screen
        name="AboutUs"
        component={Screens.StaticScreen<'AboutUs'>}
        initialParams={{ type: 'about', title: 'profile.aboutUsTitle' }}
      />
 */}


    </Stack.Navigator>
  );
};
