import {
  ActivityIndicator,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {Easing, ZoomIn, ZoomOut} from 'react-native-reanimated';
import {colors, spacing} from '../theme';

import {ColorValue} from 'react-native';
import React from 'react';
import {Text} from './Text';
import {Translations} from '../i18n/en';
import {TxKeyPath} from '../i18n';

type LoadingTxKey = keyof Translations['loaderText'];

export type LoaderProps = {
  loading: boolean;
  tx?: LoadingTxKey;
  inOutAnimation?: boolean;
  backgroundColor?: ColorValue;
};

export const Loader = ({
  loading,
  tx = 'default',
  inOutAnimation = true,
  backgroundColor = colors.palette.overlay20,
}: LoaderProps) => {
  const message: TxKeyPath = `${'loaderText'}.${tx}`;
  if (!loading) {
    return <></>;
  }
  return (
    <View style={[$main, {backgroundColor}]}>
      <Animated.View
        style={$loader}
        entering={inOutAnimation ? ZoomIn.easing(Easing.ease) : undefined}
        exiting={inOutAnimation ? ZoomOut : undefined}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text tx={message} preset="subheading" size="xs" style={$text} />
      </Animated.View>
    </View>
  );
};

const $main: ViewStyle = {
  ...StyleSheet.absoluteFillObject,
  justifyContent: 'center',
  alignItems: 'center',
};

const $loader: ViewStyle = {
  backgroundColor: colors.palette.white,
  padding: spacing.lg,
  paddingBottom: spacing.sm,
  borderRadius: spacing.sm,
  shadowColor: colors.palette.black,
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,

  elevation: 2,
};

const $text: TextStyle = {
  marginTop: spacing.xs,
  maxWidth: 112,
  textAlign: 'center',
};
