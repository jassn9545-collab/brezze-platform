import * as Screens from '../screens';

import { AppStackParamList } from './AppStack';
import {
  BottomTabScreenProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import React, { FC } from 'react';

import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import TabBar from '../components/BottomTabs';
// import {BookingTabbar} from './BookingNavigator';
// import {EarningTabbar} from './EarningsNavigator';
import { colors } from '../theme';
// import { AppDrawerScreenProps, DrawerParamsList } from './DrawerNavigator';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { AppDrawerScreenProps, DrawerParamsList } from './DrawerNavigator';

export type BottomTabNavigatorParamList = {
  Home: undefined;
//   Search: undefined;
//   ProductList: { categoryId?: number, search?: string} | undefined;
//   Sip: undefined;
//   Profile: undefined;
};

// Documentation: https://reactnavigation.org/docs/tab-based-navigation/
const Tab = createBottomTabNavigator<BottomTabNavigatorParamList>();

export type AppBottomTabScreenProps<
  T extends keyof BottomTabNavigatorParamList,
> = CompositeScreenProps<
  BottomTabScreenProps<BottomTabNavigatorParamList, T>,
  CompositeScreenProps<
    NativeStackScreenProps<AppStackParamList>,
    DrawerScreenProps<DrawerParamsList>
  >
>;

type NavigationProps = AppDrawerScreenProps<'BottomTab'>;

export const BottomTabNavigator: FC<NavigationProps> = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={TabBar}
      screenOptions={() => ({
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
      })}
    >
      <Tab.Screen name="Home" component={Screens.HomeScreen} />
      {/* <Tab.Screen name="Search" component={Screens.SearchScreen} />
      <Tab.Screen
        name="ProductList"
        component={Screens.ProductListScreen}
        listeners={({ navigation }) => ({
          tabPress: e => {
            e.preventDefault();

            navigation.navigate('ProductList', {
              categoryId: undefined,
            });
          },
        })}
      />
      <Tab.Screen name="Sip" component={Screens.SipScreen} />
      <Tab.Screen name="Profile" component={Screens.ProfileScreen} /> */}
    </Tab.Navigator>
  );
};
