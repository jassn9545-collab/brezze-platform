import Carousel from 'react-native-reanimated-carousel';
import { Image, StyleSheet, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import {  useState } from 'react';
import { ImageZoomItem } from './ZoomImageView/ImageZoom';
import { colors, images, spacing } from '../theme';
import { AppStackScreenProps } from '../navigators';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ImageViewerParams = {
  urls: string[];
  initialIndex: number;
};

type Props = AppStackScreenProps<'ImageViewer'>;

export const ImageViewerScreen = (props: Props) => {
  const insets = useSafeAreaInsets()
  const goBack = props.navigation.goBack;

  const { urls, initialIndex } = props.route.params;
  const { width, height } = useWindowDimensions();
  const [isZoomed, setIsZoomed] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.cross, {marginTop: insets.top}]} onPress={goBack}>
        <Image source={images.crossIcon} tintColor={colors.palette.white} />
      </TouchableOpacity>
      <Carousel
        data={urls}
        loop={false}
        width={width}
        height={height}
        style={styles.container}
        defaultIndex={initialIndex}
        renderItem={({ item, index, animationValue }) => {
          return (
            <ImageZoomItem
              uri={item}
              key={index}
              animationValue={animationValue}
              setIsZoomed={setIsZoomed}
            />
          );
        }}
        containerStyle={styles.container}
        scrollAnimationDuration={1200}
        enabled={!isZoomed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.palette.black,
  },
  cross: {
    zIndex: 5,
    position: 'absolute',
    end: spacing.md,
    padding: spacing.xs,
    borderRadius: spacing.lg,
    backgroundColor: colors.palette.overlay20,
  },
});
