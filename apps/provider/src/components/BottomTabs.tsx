import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, LayoutAnimation } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigators/AppStack';
import {
  ProviderBottomBar,
  ProviderBottomTabName,
} from './ProviderBottomBar';
import { getConversations } from '../apis/chat';

const BottomTabs = ({ state, navigation }: BottomTabBarProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadRequestInFlight = useRef(false);

  const refreshUnreadCount = useCallback(async () => {
    if (unreadRequestInFlight.current) return;
    unreadRequestInFlight.current = true;
    try {
      const conversations = await getConversations();
      setUnreadCount(
        conversations.reduce(
          (total, conversation) => total + Number(conversation.unread_count || 0),
          0,
        ),
      );
    } catch {
      // Keep the previous badge count during temporary network failures.
    } finally {
      unreadRequestInFlight.current = false;
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();
    const timer = setInterval(() => {
      if (AppState.currentState === 'active') {
        refreshUnreadCount();
      }
    }, 5000);
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        refreshUnreadCount();
      }
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [refreshUnreadCount]);

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
      chatUnreadCount={unreadCount}
      onAddCatalog={() =>
        navigation
          .getParent<NativeStackNavigationProp<AppStackParamList>>('App')
          ?.navigate('AddCatalogModal')
      }
    />
  );
};

const TabBar = (props: BottomTabBarProps) => <BottomTabs {...props} />;

export default TabBar;
