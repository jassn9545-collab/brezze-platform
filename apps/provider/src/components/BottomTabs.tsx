import React from 'react';
import { LayoutAnimation } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigators/AppStack';
import {
  ProviderBottomBar,
  ProviderBottomTabName,
} from './ProviderBottomBar';

const BottomTabs = ({ state, navigation }: BottomTabBarProps) => {
  const getRoute = (tab: ProviderBottomTabName) =>
    state.routes.find(route => route.name === tab);

  const onTabPress = (tab: ProviderBottomTabName) => {
    const route = getRoute(tab);
    if (!route) return;

    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (state.routes[state.index].key !== route.key && !event.defaultPrevented) {
      navigation.navigate(route.name, route.params);
    }
  };

  const onTabLongPress = (tab: ProviderBottomTabName) => {
    const route = getRoute(tab);
    if (route) {
      navigation.emit({ type: 'tabLongPress', target: route.key });
    }
  };

  return (
    <ProviderBottomBar
      activeTab={state.routes[state.index]?.name as ProviderBottomTabName}
      onTabPress={onTabPress}
      onTabLongPress={onTabLongPress}
      onAddCatalog={() =>
        navigation
          .getParent<NativeStackNavigationProp<AppStackParamList>>('App')
          ?.navigate('AddCatalogModal')
      }
    />
  );
};

export default BottomTabs;
