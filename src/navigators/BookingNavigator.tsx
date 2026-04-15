import React, { FC } from 'react';
import {
  MaterialTopTabNavigationOptions,
  createMaterialTopTabNavigator,
} from '@react-navigation/material-top-tabs';
import * as Screens from '../screens';
import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { BackButtom, Screen } from '../components';
import { CompositeScreenProps, RouteProp } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TxKeyPath, translate } from '../i18n';
import {
  AppBottomTabScreenProps,
  BottomTabNavigatorParamList,
} from './BottomTabNavigator';
import { AppStackParamList } from './AppStack';

export type BookingStackParamList = {
  ActiveJob: undefined;
  CompleteJob: undefined;
};

const Tab = createMaterialTopTabNavigator<BookingStackParamList>();

export type BookingScreenProps<T extends keyof BookingStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<BookingStackParamList, T>,
    CompositeScreenProps<
      NativeStackScreenProps<BottomTabNavigatorParamList>,
      NativeStackScreenProps<AppStackParamList>
    >
  >;

type Props = AppBottomTabScreenProps<'HireJobs'>;

type Route = RouteProp<BookingStackParamList, keyof BookingStackParamList>;
type OptionParams = {
  route: Route;
};

type TxKeys = Extract<TxKeyPath, string>;

const screenOptions = ({
  route,
}: OptionParams): MaterialTopTabNavigationOptions => {
  const { name } = route;
  const key = name.toLowerCase();
  const txNames = `job.${key}` as TxKeys;
  return {
    tabBarLabel: translate(txNames),
    tabBarAllowFontScaling: false,
    tabBarLabelStyle: {
      marginTop: 0,
      fontSize: 16,
      fontFamily: typography.primary.medium,
    },
    tabBarActiveTintColor: colors.palette.white,
    tabBarInactiveTintColor: colors.text,
    tabBarIndicatorStyle: {
      height: 44,
      borderRadius: spacing.xl,
      backgroundColor: colors.primary,
    },
    tabBarStyle: {
      backgroundColor: colors.palette.offWhite2,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      borderRadius: spacing.xl,
      height: 44,
    },
    sceneStyle: styles.container,
  };
};

export const BookingTabbar: FC<Props> = () => {
  // const rightHeaderComponent = React.useMemo(
  //   () => (
  //     <TouchableOpacity>
  //       <Image resizeMode="contain" source={images.threeDotIcon} />
  //     </TouchableOpacity>
  //   ),
  //   [],
  // );

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom
        headingTx="job.hireJob"
      // rightComponent={rightHeaderComponent}
      />
      <Tab.Navigator screenOptions={screenOptions}>
        <Tab.Screen name="ActiveJob" component={Screens.ActiveJobScreen} />
        <Tab.Screen name="CompleteJob" component={Screens.CompleteJobScreen} />
      </Tab.Navigator>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
});
