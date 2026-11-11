import { forwardRef, ForwardRefRenderFunction } from 'react';
import { GestureDetector } from 'react-native-gesture-handler';
import FastImage, { ImageStyle } from '@d11/react-native-fast-image';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useZoomable } from './hooks/useZoomable';
import type { ImageZoomProps, ImageZoomRef } from './types';

const Zoomable: ForwardRefRenderFunction<ImageZoomRef, ImageZoomProps> = (
  {
    uri = '',
    minScale,
    maxScale,
    scale,
    doubleTapScale,
    maxPanPointers,
    isPanEnabled,
    isPinchEnabled,
    isSingleTapEnabled,
    isDoubleTapEnabled,
    onInteractionStart,
    onInteractionEnd,
    onPinchStart,
    onPinchEnd,
    onPanStart,
    onPanEnd,
    onSingleTap,
    onDoubleTap,
    onProgrammaticZoom,
    onResetAnimationEnd,
    onLayout,
    style = {},
    ...props
  },
  ref,
) => {
  const { animatedStyle, gestures, onZoomableLayout } = useZoomable({
    minScale,
    maxScale,
    scale,
    doubleTapScale,
    maxPanPointers,
    isPanEnabled,
    isPinchEnabled,
    isSingleTapEnabled,
    isDoubleTapEnabled,
    onInteractionStart,
    onInteractionEnd,
    onPinchStart,
    onPinchEnd,
    onPanStart,
    onPanEnd,
    onSingleTap,
    onDoubleTap,
    onProgrammaticZoom,
    onResetAnimationEnd,
    onLayout,
    ref,
  });

  return (
    <GestureDetector gesture={gestures}>
      <Animated.View style={[style, animatedStyle]} entering={FadeIn} exiting={FadeOut}>
        <FastImage
          style={[$image, style]}
          source={{ uri }}
          resizeMode="contain"
          pointerEvents="none"
          onLayout={onZoomableLayout}
          {...props}
        />
      </Animated.View>
    </GestureDetector>
  );
};

const $image: ImageStyle = {
  flex: 1,
};

export default forwardRef(Zoomable);
