import React, { FC, useRef, useState } from 'react';
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButtom, SafeRemoteImage, Screen, Text } from '../components';
import { Currency } from '../config/defaults';
import { AppStackScreenProps } from '../navigators';
import { colors, spacing } from '../theme';

type Props = AppStackScreenProps<'CatalogDetail'>;

export const CatalogDetailScreen: FC<Props> = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const carouselRef = useRef<ScrollView>(null);
  const { catalog } = route.params;
  const imageUrls = (catalog.image_urls ?? []).filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(0);
  const galleryWidth = width - spacing.md * 2;
  const galleryHeight = galleryWidth * 0.75;
  const numericPrice = Number(catalog.price);
  const price = Number.isFinite(numericPrice)
    ? numericPrice.toFixed(2)
    : catalog.price;

  const selectImage = (index: number) => {
    setSelectedImage(index);
    carouselRef.current?.scrollTo({ x: galleryWidth * index, animated: true });
  };

  const onGalleryScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / galleryWidth);
    setSelectedImage(Math.max(0, Math.min(index, imageUrls.length - 1)));
  };

  const openImageViewer = (index: number) => {
    navigation.navigate('ImageViewer', {
      urls: imageUrls,
      initialIndex: index,
    });
  };

  return (
    <>
      <BackButtom
        headingTx="catalog.serviceDetails"
        style={{
          paddingHorizontal: spacing.md,
          paddingTop: insets.top + spacing.sm,
          paddingBottom: spacing.xs,
        }}
      />
      <Screen
        preset="scroll"
        safeAreaEdges={['bottom']}
        backgroundColor={colors.palette.offWhite}
        contentContainerStyle={styles.container}
      >
        <View style={[styles.gallery, { height: galleryHeight }]}>
          {imageUrls.length > 0 ? (
            <ScrollView
              ref={carouselRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onGalleryScrollEnd}
            >
              {imageUrls.map((uri, index) => (
                <TouchableOpacity
                  key={uri + '-' + index}
                  activeOpacity={0.9}
                  accessibilityRole="button"
                  accessibilityLabel={
                    'Open service photo ' +
                    (index + 1) +
                    ' of ' +
                    imageUrls.length
                  }
                  onPress={() => openImageViewer(index)}
                >
                  <SafeRemoteImage
                    uri={uri}
                    fallback={require('../assets/images/dummy/plug.png')}
                    resizeMode="cover"
                    style={{ width: galleryWidth, height: galleryHeight }}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Image
              source={require('../assets/images/dummy/plug.png')}
              resizeMode="contain"
              style={[
                styles.placeholderImage,
                { width: galleryWidth, height: galleryHeight },
              ]}
            />
          )}
          {imageUrls.length > 0 && (
            <View style={styles.photoCounter} pointerEvents="none">
              <Text
                text={selectedImage + 1 + ' / ' + imageUrls.length}
                size="xxs"
                weight="semiBold"
                style={styles.photoCounterText}
              />
            </View>
          )}
        </View>

        {imageUrls.length > 1 && (
          <View style={styles.dots}>
            {imageUrls.map((uri, index) => (
              <TouchableOpacity
                key={uri + '-dot-' + index}
                accessibilityRole="button"
                accessibilityLabel={'Show service photo ' + (index + 1)}
                accessibilityState={{ selected: index === selectedImage }}
                onPress={() => selectImage(index)}
                style={styles.dotTouchTarget}
              >
                <View
                  style={[
                    styles.dot,
                    index === selectedImage && styles.activeDot,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.summaryCard}>
          <Text
            text={catalog.heading}
            size="xl"
            weight="bold"
            style={styles.serviceTitle}
          />
          <View style={styles.priceBanner}>
            <Text
              tx="catalog.servicePrice"
              size="xs"
              style={styles.priceLabel}
            />
            <Text
              text={Currency.code + ' ' + Currency.sign + price}
              size="lg"
              weight="bold"
              style={styles.price}
            />
          </View>
        </View>

        <View style={styles.overviewCard}>
          <Text tx="catalog.serviceOverview" size="md" weight="semiBold" />
          <Text
            text={catalog.description?.trim() || 'No description added yet.'}
            size="xs"
            style={styles.description}
          />
        </View>
      </Screen>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  gallery: {
    overflow: 'hidden',
    borderRadius: spacing.sm,
    backgroundColor: colors.palette.offWhite2,
  },
  placeholderImage: {
    backgroundColor: colors.palette.offWhite2,
  },
  photoCounter: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: spacing.lg,
    backgroundColor: colors.palette.overlay50,
  },
  photoCounterText: {
    color: colors.palette.white,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  dotTouchTarget: {
    minWidth: spacing.md,
    minHeight: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.palette.borderColor,
  },
  activeDot: {
    width: 20,
    backgroundColor: colors.primary,
  },
  summaryCard: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.palette.white,
    elevation: 2,
    shadowColor: colors.palette.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  serviceTitle: {
    lineHeight: 32,
  },
  priceBanner: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
    backgroundColor: colors.palette.offWhite,
  },
  priceLabel: {
    color: colors.textDim,
  },
  price: {
    color: colors.primary,
  },
  overviewCard: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.palette.white,
    elevation: 2,
    shadowColor: colors.palette.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  description: {
    marginTop: spacing.xs,
    lineHeight: 22,
    color: colors.textDim,
  },
});
