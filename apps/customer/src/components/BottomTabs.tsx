import { AppImage, colors, images, spacing } from '../theme';
import {
  Image,
  ImageBackground,
  ImageStyle,
  LayoutAnimation,
  AppState,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ScreenWidth } from '../utils/util';
import { Text } from './Text';
import { scale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TxKeyPath } from '../i18n';
import { getChatConversations } from '../apis/chat';

type ImageKeys = Extract<AppImage, string>;

const BottomTabs = (props: BottomTabBarProps) => {
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadRequestInFlight = useRef(false);
  const activeRouteName = state.routes[state.index]?.name;
  const visibleRoutes = state.routes.filter(
    route => route.name !== 'Categories' && route.name !== 'FeaturedProfessionals',
  );

  const refreshUnreadCount = useCallback(async () => {
    if (unreadRequestInFlight.current) return;
    unreadRequestInFlight.current = true;
    try {
      const conversations = await getChatConversations();
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

  return (
    <View style={{ backgroundColor: colors.background }}>
      <ImageBackground
        source={require('../assets/images/bottomTab.png')}
        style={[$tabBarContainer, { marginBottom: insets.bottom }]}
      >
        {visibleRoutes.map(route => {
          const { options } = descriptors[route.key];
          const label = route.name;

          const key =
            route.name.substring(0, 1).toLowerCase() + route.name.substring(1);
          const isFocused =
            activeRouteName === route.name ||
            ((activeRouteName === 'Categories' || activeRouteName === 'FeaturedProfessionals') &&
              route.name === 'Home');

          const onPress = () => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              activeOpacity={0.4}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              key={route.key}
              style={$tab}
            >
              {key === 'job' ? (
                <View style={$activeTab}>
                  <Image source={images[`${key}` as ImageKeys]} />
                </View>
              ) : (
                <View style={$tabIconContainer}>
                  <Image
                    style={$tabBarIcon}
                    resizeMode="contain"
                    tintColor={colors.palette.white}
                    source={images[`${key}` as ImageKeys]}
                  />
                  {key === 'chat' && unreadCount > 0 && (
                    <View style={$unreadBadge}>
                      <Text
                        size="xxs"
                        weight="bold"
                        text={unreadCount > 99 ? '99+' : String(unreadCount)}
                        style={$unreadBadgeText}
                      />
                    </View>
                  )}
                </View>
              )}

              {key !== 'job' && (
                <Text
                  size="xs"
                  weight="regular"
                  style={$tabBarLabel}
                  tx={`bottomTab.${label}` as TxKeyPath}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ImageBackground>
    </View>
  );
};

const $tabBarContainer: ViewStyle = {
  width: ScreenWidth,
  alignSelf: 'center',
  flexDirection: 'row',
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  backgroundColor: colors.transparent,
};

const $tab: ViewStyle = {
  flex: 1,
  alignItems: 'center',
};

const $activeTab: ViewStyle = {
  bottom: '50%',
  position: 'absolute',
  marginBottom: scale(4),
};

const $tabBarIcon: ImageStyle = {
  width: scale(15),
  height: scale(15),
};

const $tabIconContainer: ViewStyle = {
  position: 'relative',
};

const $unreadBadge: ViewStyle = {
  minWidth: 18,
  height: 18,
  top: -9,
  right: -12,
  borderRadius: 9,
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 4,
  borderWidth: 1,
  borderColor: colors.palette.white,
  backgroundColor: colors.error,
};

const $unreadBadgeText: TextStyle = {
  color: colors.palette.white,
  lineHeight: 14,
};

const $tabBarLabel: TextStyle = {
  textAlign: 'center',
  marginTop: scale(4),
  color: colors.palette.white,
};

const TabBar = (props: BottomTabBarProps) => <BottomTabs {...props} />;

export default TabBar;
