import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import React, { FC, useEffect } from 'react';

import { colors } from '../theme';
import { NavigatorScreenParams } from '@react-navigation/native';
import * as Screens from '../screens';
import { DrawerNavigator, DrawerParamsList } from './DrawerNavigator';
import {
  BottomTabNavigator,
  BottomTabNavigatorParamList,
} from './BottomTabNavigator';
import {
  ImageViewerParams,
  ImageViewerScreen,
} from '../components/ImageViewer';
import { useAppDispatch } from '../store/hooks';
import { getProfile } from '../slices/auth.slice';

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
  JobDetail: Screens.JobDetailParams;
  JobApply: undefined;
  AdvanceFilter: undefined;
  ApplyJob: undefined;
  SavedJob: undefined;
  SubmitWork: undefined;
  Wallet: undefined;
  ServiceCatalog: undefined;
  ChatDetail: undefined;
  Notification: undefined;
  EditProfile: undefined;
  HelpSupport: undefined;

  //modal
  JobApplySucessModal: undefined;
  AddCatalogModal: undefined;
  CenterModal: Screens.CenterModalParams;
  ImageViewer: ImageViewerParams;

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
};

export type AppStackScreenProps<T extends keyof AppStackParamList> =
  NativeStackScreenProps<AppStackParamList, T, 'App'>;

// Documentation: https://reactnavigation.org/docs/stack-navigator/
const Stack = createNativeStackNavigator<AppStackParamList, 'App'>();

export const AppStack: FC = () => {
  const dispatch = useAppDispatch();

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

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

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
      <Stack.Screen name="JobDetail" component={Screens.JobDetailScreen} />
      <Stack.Screen
        name="AdvanceFilter"
        component={Screens.AdvanceFilterScreen}
      />
      <Stack.Screen name="JobApply" component={Screens.JobApplyScreen} />
      <Stack.Screen name="ApplyJob" component={Screens.ApplyJobScreen} />
      <Stack.Screen name="SavedJob" component={Screens.SavedJobScreen} />
      <Stack.Screen name="SubmitWork" component={Screens.SubmitWorkScreen} />
      <Stack.Screen
        name="ServiceCatalog"
        component={Screens.ServiceCatalogScreen}
      />
      <Stack.Screen name="Wallet" component={Screens.WalletScreen} />
      <Stack.Screen name="ChatDetail" component={Screens.ChatDetailScreen} />
      <Stack.Screen
        name="Notification"
        component={Screens.NotificationScreen}
      />
      <Stack.Screen name="EditProfile" component={Screens.EditProfileScreen} />
      <Stack.Screen name="HelpSupport" component={Screens.HelpSupportScreen} />

      <Stack.Group
        screenOptions={{
          presentation: 'transparentModal',
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade_from_bottom',
        }}
      >
        <Stack.Screen
          name="JobApplySucessModal"
          component={Screens.JobApplySucessModal}
        />
        <Stack.Screen
          name="AddCatalogModal"
          component={Screens.AddCatalogModal}
        />
        <Stack.Screen name="CenterModal" component={Screens.CenterModal} />
      </Stack.Group>

      <Stack.Group
        screenOptions={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      >
        <Stack.Screen name="ImageViewer" component={ImageViewerScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
};
