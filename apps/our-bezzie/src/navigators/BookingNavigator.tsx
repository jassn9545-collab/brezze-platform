import React, { FC } from 'react';
import {
  MaterialTopTabBarProps,
  createMaterialTopTabNavigator,
} from '@react-navigation/material-top-tabs';
import * as Screens from '../screens';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {colors} from '../theme';
import {Screen, Text} from '../components';
import {CompositeScreenProps} from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {translate} from '../i18n';
import {
  AppBottomTabScreenProps,
  BottomTabNavigatorParamList,
} from './BottomTabNavigator';
import { AppStackParamList } from './AppStack';
import {AppliedJobsList} from '../screens/ApplyJobScreen';

export type BookingStackParamList = {
  AppliedJob: undefined;
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

const tabLabels = {
  AppliedJob: 'job.appliedjob',
  ActiveJob: 'job.activejob',
  CompleteJob: 'job.completejob',
} as const;

const JobsTabs = ({state, navigation}: MaterialTopTabBarProps) => (
  <View style={styles.tabs}>
    {state.routes.map((route, index) => (
      <TouchableOpacity key={route.key} accessibilityRole="tab"
        accessibilityLabel={translate(tabLabels[route.name as keyof typeof tabLabels])}
        accessibilityState={{selected: state.index === index}}
        onPress={() => {
          const event = navigation.emit({type: 'tabPress', target: route.key, canPreventDefault: true});
          if (!event.defaultPrevented && state.index !== index) navigation.navigate(route.name);
        }}
        onLongPress={() => navigation.emit({type: 'tabLongPress', target: route.key})}
        style={[styles.tab, state.index === index && styles.selectedTab]}>
        <Text tx={tabLabels[route.name as keyof typeof tabLabels]} weight={state.index === index ? 'semiBold' : 'medium'}
          style={[styles.tabLabel, state.index === index && styles.selectedTabLabel]} />
      </TouchableOpacity>
    ))}
  </View>
);

export const BookingTabbar: FC<Props> = ({navigation}) => {
  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      backgroundColor="#F7F9FB"
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to Home"
          onPress={() => navigation.navigate('Home')} style={styles.backButton}>
          <View style={styles.backIcon} />
        </TouchableOpacity>
        <Text tx="job.hireJob" weight="semiBold" style={styles.heading} />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open notifications"
          onPress={() => navigation.navigate('Notification')} style={styles.notificationButton}>
          <View style={styles.bellIcon} pointerEvents="none" accessible={false}>
            <View style={styles.bellTop} />
            <View style={styles.bellBody} />
            <View style={styles.bellBase} />
            <View style={styles.bellClapper} />
          </View>
        </TouchableOpacity>
      </View>
      <Tab.Navigator initialRouteName="ActiveJob" tabBar={JobsTabs} screenOptions={{sceneStyle: styles.container}}>
        <Tab.Screen name="AppliedJob" component={AppliedJobsList} />
        <Tab.Screen name="ActiveJob" component={Screens.ActiveJobScreen} />
        <Tab.Screen name="CompleteJob" component={Screens.CompleteJobScreen} />
      </Tab.Navigator>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB',
  },
  header: {height: 64, marginHorizontal: 20, marginBottom: 6, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between'},
  backButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.palette.white, borderRadius: 20, borderWidth: 1, borderColor: '#DFE7F1'},
  backIcon: {width: 10, height: 10, borderLeftWidth: 2, borderBottomWidth: 2,
    borderColor: '#47576F', transform: [{rotate: '45deg'}], marginLeft: 4},
  heading: {fontSize: 20, lineHeight: 28, color: '#131C2F'},
  notificationButton: {width: 40, height: 40, alignItems: 'center', justifyContent: 'center'},
  bellIcon: {width: 20, height: 22},
  bellTop: {position: 'absolute', top: 1, left: 9, width: 2, height: 3, borderRadius: 1, backgroundColor: '#8FA1BA'},
  bellBody: {position: 'absolute', top: 3, left: 4, width: 12, height: 13, borderWidth: 1.7,
    borderBottomWidth: 0, borderTopLeftRadius: 7, borderTopRightRadius: 7, borderColor: '#8FA1BA'},
  bellBase: {position: 'absolute', top: 15, left: 2, width: 16, height: 2, borderRadius: 1, backgroundColor: '#8FA1BA'},
  bellClapper: {position: 'absolute', top: 18, left: 8, width: 4, height: 3, borderWidth: 1.5,
    borderTopWidth: 0, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, borderColor: '#8FA1BA'},
  tabs: {minHeight: 44, flexDirection: 'row', marginHorizontal: 20, marginBottom: 6,
    padding: 4, borderRadius: 16, backgroundColor: '#E7ECF3'},
  tab: {flex: 1, minHeight: 36, paddingVertical: 7, paddingHorizontal: 3,
    borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  selectedTab: {backgroundColor: colors.primary},
  tabLabel: {fontSize: 13, lineHeight: 20, color: '#47576F'},
  selectedTabLabel: {color: colors.palette.white},
});
