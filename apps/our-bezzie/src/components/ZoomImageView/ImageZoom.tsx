import { ForwardedRef, forwardRef } from 'react';
import Animated, { SharedValue, interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import ZoomableImage from './ZoomableImage';
import { StyleSheet, View } from 'react-native';
import { ImageZoomProps, ImageZoomRef, ZOOM_TYPE } from './types';
import { colors } from '../../theme';

type Props = {
  uri: string;
  scale?: SharedValue<number>;
  minScale?: number;
  maxScale?: number;
  ref: ForwardedRef<ImageZoomRef>;
  setIsZoomed: (value: boolean) => void;
  style?: ImageZoomProps['style'];
};
export const ImageZoom = forwardRef<ImageZoomRef, Props>(
  ({ uri, scale, minScale = 0.5, maxScale = 5, setIsZoomed, style }, ref) => {
    const onZoom = (zoomType?: ZOOM_TYPE) => {
      if (!zoomType || zoomType === ZOOM_TYPE.ZOOM_IN) {
        setIsZoomed(true);
      }
    };

    const onAnimationEnd = (finished?: boolean) => {
      if (finished) {
        setIsZoomed(false);
      }
    };

    return (
      <ZoomableImage
        ref={ref}
        uri={uri}
        minScale={minScale}
        maxScale={maxScale}
        scale={scale}
        doubleTapScale={3}
        isSingleTapEnabled
        isDoubleTapEnabled
        onInteractionStart={() => {
          console.log('onInteractionStart');
          onZoom();
        }}
        onInteractionEnd={() => console.log('onInteractionEnd')}
        onPanStart={() => console.log('onPanStart')}
        onPanEnd={() => console.log('onPanEnd')}
        onPinchStart={() => console.log('onPinchStart')}
        onPinchEnd={() => console.log('onPinchEnd')}
        onSingleTap={() => console.log('onSingleTap')}
        onDoubleTap={zoomType => {
          console.log('onDoubleTap', zoomType);
          onZoom(zoomType);
        }}
        onProgrammaticZoom={zoomType => {
          console.log('onZoom', zoomType);
          onZoom(zoomType);
        }}
        style={[styles.image, style]}
        onResetAnimationEnd={(finished, values) => {
          console.log('onResetAnimationEnd', finished);
          console.log('lastScaleValue:', values?.SCALE.lastValue);
          onAnimationEnd(finished);
        }}
        resizeMode="contain"
      />
    );
  },
);

interface ItemProps {
  uri: string;
  animationValue: SharedValue<number>;
  setIsZoomed: (value: boolean) => void;
}

export const ImageZoomItem: React.FC<ItemProps> = ({ uri, animationValue, setIsZoomed }) => {
  const maskStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      animationValue.value,
      [-1, 0, 1],
      ['#000000dd', 'transparent', '#000000dd'],
    );

    return {
      backgroundColor,
    };
  }, [animationValue]);

  return (
    <View style={styles.container}>
      <ImageZoom uri={uri} setIsZoomed={setIsZoomed} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, maskStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.palette.black,
  },
  image: {
    flex: 1,
  },
});
