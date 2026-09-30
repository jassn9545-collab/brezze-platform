import Animated, {
  Easing,
  FlipInEasyX,
  ZoomIn,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, typography } from '../theme';
import { ImageStyle, TextStyle, View, ViewStyle } from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import { Toast, ToastOptions } from 'react-native-toast-notifications';

import { Props } from 'react-native-toast-notifications/lib/typescript/toast-container';
import { ToastProps } from 'react-native-toast-notifications/lib/typescript/toast';
import { AppImage, images } from '../theme/images';
import { Text } from '../components';

declare global {
  let toast: {
    show: (message: string, toastOptions?: ToastOptions | undefined) => string;
  };
}

toast = {
  show: (message: string, toastOptions?: ToastOptions | undefined) => {
    Toast.hideAll();
    return Toast.show(message, toastOptions);
  },
};

const ToastIcon: FC<{ image: AppImage }> = ({ image }) => {
  return (
    <Animated.Image
      entering={ZoomIn.duration(1000).easing(Easing.bounce)}
      source={images[image]}
      style={$icon}
    />
  );
};

const $icon: ImageStyle = {
  resizeMode: 'center',
  height: spacing.lg,
  width: spacing.lg,
};

export const toastOptions: ToastOptions = {
  placement: 'top',
  duration: 3000,
  animationType: 'slide-in',
  animationDuration: 100,
  successColor: colors.palette.success,
  dangerColor: colors.palette.danger,
  warningColor: colors.palette.warning,
  normalColor: colors.palette.faded,
  textStyle: {
    fontFamily: typography.primary.regular,
    fontSize: 14,
    lineHeight: 21,
    marginHorizontal: spacing.sm,
    color: colors.textDim,
  },
  //   icon: <ToastIcon image="logo" />,
  successIcon: <ToastIcon image="success" />,
  dangerIcon: <ToastIcon image="danger" />,
  warningIcon: <ToastIcon image="warning" />,
};

export const toastProps: Props = {
  ...toastOptions,
  offset: 50, // offset for both top and bottom toasts
  offsetTop: 30,
  offsetBottom: 40,
  swipeEnabled: true,
  renderToast: toast => <CustomToast {...toast} />,
};

const CustomToast: FC<ToastProps> = toast => {
  const [width, setWidth] = useState(0);
  const progress = useSharedValue(0);

  const color =
    toast.type === 'warning'
      ? colors.palette.warning
      : toast.type === 'danger'
      ? colors.palette.danger
      : toast.type === 'success'
      ? colors.palette.success
      : colors.palette.faded;
  const Icon =
    toast.type === 'warning'
      ? toast.warningIcon
      : toast.type === 'danger'
      ? toast.dangerIcon
      : toast.type === 'success'
      ? toast.successIcon
      : undefined;

  useEffect(() => {
    if (width > 0) {
      progress.value = withTiming(width, { duration: toast.duration });
    }
  }, [progress, toast.duration, width]);

  return (
    <Animated.View
      entering={FlipInEasyX}
      onLayout={e => {
        setWidth(e.nativeEvent.layout.width);
      }}
      style={[$main, { borderLeftColor: color }]}
    >
      <View style={$container}>
        <View style={$mainView}>
          {Icon}
          <Text style={[$textStyle, toast.textStyle]}>{toast.message}</Text>
        </View>
        <Animated.View
          style={[$progress, { width: progress, backgroundColor: color }]}
        />
      </View>
    </Animated.View>
  );
};

const $main: ViewStyle = {
  maxWidth: '95%',
  backgroundColor: colors.background,
  marginVertical: 4,
  borderRadius: 8,
  borderLeftWidth: 6,
  shadowColor: colors.palette.black,
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.27,
  shadowRadius: 4.65,

  elevation: 6,
};

const $container: ViewStyle = {
  minHeight: spacing.xxl,
  overflow: 'hidden',
  borderBottomEndRadius: 8,
  justifyContent: 'center',
};

const $mainView: ViewStyle = {
  padding: spacing.xs,
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
};

const $progress: ViewStyle = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  height: 4,
  alignSelf: 'flex-end',
};

const $textStyle: TextStyle = {
  paddingLeft: spacing.xxs,
  maxWidth: '88%',
};
