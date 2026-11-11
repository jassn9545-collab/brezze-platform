import React, { FC } from 'react';
import {
  createDrawerNavigator,
  DrawerScreenProps,
} from '@react-navigation/drawer';
import { colors } from '../theme';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { AppStackParamList } from './AppStack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  BottomTabNavigator,
  BottomTabNavigatorParamList,
} from './BottomTabNavigator';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NavigationProps } from './AppNavigator';
import SideMenu from '../components/CustomDrawer';

export type DrawerParamsList = {
  BottomTab: NavigatorScreenParams<BottomTabNavigatorParamList>;
};

const Drawer = createDrawerNavigator<DrawerParamsList>();

export type AppDrawerScreenProps<T extends keyof DrawerParamsList> =
  CompositeScreenProps<
    DrawerScreenProps<DrawerParamsList, T>,
    CompositeScreenProps<
      NativeStackScreenProps<AppStackParamList>,
      BottomTabScreenProps<BottomTabNavigatorParamList>
    >
  >;

export const DrawerNavigator: FC<NavigationProps> = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerType: 'front',
        headerShown: false,
        drawerStyle: { backgroundColor: colors.background },
      }}
      drawerContent={SideMenu}
      initialRouteName="BottomTab"
    >

      <Drawer.Screen name="BottomTab" component={BottomTabNavigator} />
    </Drawer.Navigator>
  );
};
