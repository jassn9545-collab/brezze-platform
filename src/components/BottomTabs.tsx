import { AppImage, colors, images, spacing } from '../theme';
import {
  Image,
  ImageStyle,
  LayoutAnimation,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React from 'react';

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ScreenWidth } from '../utils/util';
import { Text } from './Text';
import { scale } from 'react-native-size-matters';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TxKeyPath } from '../i18n';

type ImageKeys = Extract<AppImage, string>;

const BottomTabs = (props: BottomTabBarProps) => {
  const { state, descriptors, navigation } = props;
  const insets = useSafeAreaInsets();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <View style={[$tabBarContainer, { marginBottom: insets.bottom }]}>
        {state?.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = route.name;
          const key =
            route.name.substring(0, 1).toLowerCase() + route.name.substring(1);
          const isFocused = state.index === index;

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
              {isFocused ? (
                <View style={$wrapActiveTab}>
                  <View style={$activeTab}>
                    <Image
                      source={images[`${key}` as ImageKeys]}
                      tintColor={colors.palette.white}
                      style={$activeTabBarIcon}
                    />
                  </View>
                </View>
              ) : (
                <Image
                  source={images[`${key}` as ImageKeys]}
                  tintColor={colors.palette.white}
                  style={$tabBarIcon}
                />
              )}
              {options.tabBarShowLabel !== false && (
                <Text
                  size="xs"
                  weight="regular"
                  style={[
                    $tabBarLabel,
                    isFocused && { marginTop: scale(18) },
                  ]}
                  tx={`bottomTab.${label}` as TxKeyPath}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const $tabBarContainer: ViewStyle = {
  width: ScreenWidth,
  alignSelf: 'center',
  flexDirection: 'row',
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  backgroundColor: colors.primary,
};

const $wrapActiveTab: ViewStyle = {
  top: -scale(35),
  alignItems: 'center',
  justifyContent: 'center',
  position: 'absolute',
  backgroundColor: colors.transparent,
};

const $activeTab: ViewStyle = {
  borderWidth: 4,
  alignItems: 'center',
  borderRadius: spacing.xxxl,
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.md,
  borderColor: colors.palette.white,
  backgroundColor: colors.palette.black,
};

const $activeTabBarIcon: ImageStyle = {
  resizeMode: 'contain',
  width: scale(22),
  height: scale(22),
  marginTop: scale(4),
};

const $tabBarIcon: ImageStyle = {
  resizeMode: 'contain',
  width: scale(15),
  height: scale(15),
  marginTop: scale(4),
};
const $tabBarLabel: TextStyle = {
  textAlign: 'center',
  marginTop: scale(4),
  color: colors.palette.white
};

const $tab: ViewStyle = {
  alignItems: 'center',
  flex: 1,
};

const TabBar = (props: BottomTabBarProps) => <BottomTabs {...props} />;

export default TabBar;
