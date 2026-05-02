import { AppImage, colors, images, spacing } from '../theme';
import {
  Image,
  ImageBackground,
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
      <ImageBackground
        source={require('../assets/images/bottomTab.png')}
        style={[$tabBarContainer, { marginBottom: insets.bottom }]}
      >
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
              {key === 'job' ? (
                <View style={$activeTab}>
                  <Image source={images[`${key}` as ImageKeys]} />
                </View>
              ) : (
                <Image
                  style={$tabBarIcon}
                  resizeMode="contain"
                  tintColor={colors.palette.white}
                  source={images[`${key}` as ImageKeys]}
                />
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

const $tabBarLabel: TextStyle = {
  textAlign: 'center',
  marginTop: scale(4),
  color: colors.palette.white,
};

const $tab: ViewStyle = {
  flex: 1,
  alignItems: 'center',
};

const TabBar = (props: BottomTabBarProps) => <BottomTabs {...props} />;

export default TabBar;
