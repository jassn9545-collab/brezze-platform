import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getFreelancerCatalogs,
  CatalogProvider,
  ServiceCatalog,
} from '../apis/catalogs';
import {
  createServiceBooking,
  getServiceBookings,
  ServiceBooking,
} from '../apis/bookings';
import { BackButtom, Screen, Text } from '../components';
import { Currency } from '../config/defaults';
import { AppStackScreenProps } from '../navigators/AppStack';
import { colors, images, spacing } from '../theme';

type Props = AppStackScreenProps<'ServiceDetails'>;

const formatPrice = (price: string) => {
  const amount = Number(price);
  return (
    Currency.code +
    ' ' +
    Currency.sign +
    (Number.isFinite(amount) ? amount.toFixed(2) : price)
  );
};

export const ServiceDetailsScreen: FC<Props> = ({ navigation, route }) => {
  const { providerId, initialCatalogId } = route.params;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const galleryWidth = width - spacing.md * 2;
  const galleryRef = useRef<FlatList<string>>(null);
  const mounted = useRef(false);

  const [provider, setProvider] = useState<CatalogProvider | null>(null);
  const [catalogs, setCatalogs] = useState<ServiceCatalog[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(
    initialCatalogId ?? null,
  );
  const [slideIndex, setSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [booking, setBooking] = useState<ServiceBooking | null>(null);
  const [openingChat, setOpeningChat] = useState(false);
  const [requestingBooking, setRequestingBooking] = useState(false);

  const loadCatalogs = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const result = await getFreelancerCatalogs(providerId);
      if (!mounted.current) return;
      setProvider(result.provider);
      setCatalogs(result.catalogs);
      setSelectedId(current =>
        result.catalogs.some(item => item.id === current)
          ? current
          : result.catalogs.find(item => item.id === initialCatalogId)?.id ??
            result.catalogs[0]?.id ??
            null,
      );
    } catch {
      if (mounted.current) setLoadError(true);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [providerId, initialCatalogId]);

  useEffect(() => {
    mounted.current = true;
    loadCatalogs();
    return () => {
      mounted.current = false;
    };
  }, [loadCatalogs]);

  const catalog = catalogs.find(item => item.id === selectedId) ?? catalogs[0];
  const imageUrls = catalog?.image_urls ?? [];

  useEffect(() => {
    let active = true;
    if (!catalog?.id) {
      setBooking(null);
      return () => {
        active = false;
      };
    }

    setBooking(null);
    getServiceBookings(catalog.id)
      .then(bookings => {
        if (active) setBooking(bookings[0] ?? null);
      })
      .catch(() => {
        if (active) setBooking(null);
      });

    return () => {
      active = false;
    };
  }, [catalog?.id]);

  useEffect(() => {
    if (booking?.status !== 'pending' || !catalog?.id) return;

    const timer = setInterval(() => {
      getServiceBookings(catalog.id)
        .then(bookings => setBooking(bookings[0] ?? null))
        .catch(() => undefined);
    }, 5000);

    return () => clearInterval(timer);
  }, [booking?.status, catalog?.id]);

  const chooseCatalog = (id: number) => {
    setSelectedId(id);
    setSlideIndex(0);
    galleryRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const messageProvider = async () => {
    if (openingChat) return;
    if (booking?.status !== 'accepted' || !booking.conversation_id) {
      toast.show('Chat will be available after the service request is accepted.', {
        type: 'info',
      });
      return;
    }
    setOpeningChat(true);
    navigation.navigate('ChatDetail', {
      conversationId: booking.conversation_id,
      participantName: booking.provider.name,
      participantImage: booking.provider.profile_image,
    });
    setOpeningChat(false);
  };

  const requestService = async () => {
    if (!catalog || requestingBooking) return;
    if (booking?.status === 'accepted') {
      messageProvider();
      return;
    }
    if (booking?.status === 'pending') {
      toast.show('Your service request is waiting for the freelancer.', {
        type: 'info',
      });
      return;
    }
    setRequestingBooking(true);
    try {
      const created = await createServiceBooking(catalog.id);
      setBooking(created);
      toast.show('Service request sent to the freelancer.', {type: 'success'});
    } catch {
      // The shared API client displays the server error. Leave the action available to retry.
    } finally {
      setRequestingBooking(false);
    }
  };

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.screen}
    >
      <BackButtom heading="Service Details" />
      {loading && !catalog ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : loadError && !catalog ? (
        <View style={styles.center}>
          <Text
            text="Could not load service details."
            size="xs"
            style={styles.centerText}
          />
          <TouchableOpacity
            onPress={loadCatalogs}
            style={styles.retryButton}
            accessibilityRole="button"
          >
            <Text
              text="Try Again"
              size="xs"
              weight="semiBold"
              style={styles.whiteText}
            />
          </TouchableOpacity>
        </View>
      ) : !catalog ? (
        <View style={styles.center}>
          <Text
            text="No services available for this professional yet."
            size="xs"
            style={styles.centerText}
          />
        </View>
      ) : (
        <>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.gallery}>
              {imageUrls.length > 0 ? (
                <View
                  style={[
                    styles.heroFrame,
                    { width: galleryWidth, height: galleryWidth * 0.75 },
                  ]}
                >
                  <FlatList
                    key={catalog.id}
                    ref={galleryRef}
                    data={imageUrls}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item, index) => item + index}
                    onMomentumScrollEnd={event => {
                      const index = Math.round(
                        event.nativeEvent.contentOffset.x / galleryWidth,
                      );
                      setSlideIndex(
                        Math.min(imageUrls.length - 1, Math.max(0, index)),
                      );
                    }}
                    renderItem={({ item }) => (
                      <Image
                        source={{ uri: item }}
                        resizeMode="cover"
                        style={{
                          width: galleryWidth,
                          height: galleryWidth * 0.75,
                        }}
                      />
                    )}
                  />
                  <View style={styles.counter}>
                    <Text
                      text={
                        String(slideIndex + 1) +
                        ' / ' +
                        String(imageUrls.length)
                      }
                      size="xxs"
                      weight="semiBold"
                      style={styles.whiteText}
                    />
                  </View>
                </View>
              ) : (
                <View
                  style={[
                    styles.heroFrame,
                    styles.heroPlaceholder,
                    { height: galleryWidth * 0.75 },
                  ]}
                >
                  <Image
                    source={images.service}
                    style={styles.placeholderIcon}
                  />
                  <Text
                    text="No photos available"
                    size="xs"
                    style={styles.mutedText}
                  />
                </View>
              )}
              {imageUrls.length > 1 ? (
                <View style={styles.dots}>
                  {imageUrls.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      accessibilityRole="button"
                      accessibilityLabel={'Show photo ' + String(index + 1)}
                      onPress={() => {
                        galleryRef.current?.scrollToIndex({
                          index,
                          animated: true,
                        });
                        setSlideIndex(index);
                      }}
                      style={styles.dotTouch}
                    >
                      <View
                        style={[
                          styles.dot,
                          index === slideIndex && styles.activeDot,
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>

            <View style={styles.card}>
              <View style={styles.tags}>
                <View style={styles.tag}>
                  <Text
                    text="Service Catalog"
                    size="xxs"
                    weight="semiBold"
                    style={styles.primaryText}
                  />
                </View>
                {provider?.name ? (
                  <Text
                    text={provider.name}
                    size="xxs"
                    style={styles.mutedText}
                    numberOfLines={1}
                  />
                ) : null}
              </View>
              <Text
                text={catalog.heading}
                size="xl"
                weight="bold"
                style={styles.title}
              />
              <View style={styles.pricePanel}>
                <Text
                  text={formatPrice(catalog.price)}
                  size="lg"
                  weight="bold"
                  style={styles.primaryText}
                />
                <Text
                  text="Service price"
                  size="xxs"
                  style={styles.mutedText}
                />
              </View>
            </View>

            <View style={styles.card}>
              <Text text="Service Overview" size="md" weight="semiBold" />
              <Text
                text={catalog.description}
                size="xs"
                style={styles.description}
              />
            </View>

            {provider?.name ? (
              <View style={styles.card}>
                <Text text="Your Professional" size="md" weight="semiBold" />
                <View style={styles.providerRow}>
                  <View style={styles.providerAvatar}>
                    <Text
                      text={provider.name.charAt(0).toUpperCase()}
                      size="md"
                      weight="bold"
                      style={styles.primaryText}
                    />
                  </View>
                  <View style={styles.providerInfo}>
                    <Text text={provider.name} size="xs" weight="semiBold" />
                    <Text
                      text="Service provider"
                      size="xxs"
                      style={styles.mutedText}
                    />
                  </View>
                </View>
              </View>
            ) : null}

            {catalogs.length > 1 ? (
              <View style={styles.card}>
                <Text text="More Services" size="md" weight="semiBold" />
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.serviceChoices}
                >
                  {catalogs.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      accessibilityRole="button"
                      accessibilityLabel={'View ' + item.heading}
                      onPress={() => chooseCatalog(item.id)}
                      style={[
                        styles.serviceChoice,
                        item.id === catalog.id && styles.selectedChoice,
                      ]}
                    >
                      <Text
                        text={item.heading}
                        size="xxs"
                        weight="semiBold"
                        style={
                          item.id === catalog.id
                            ? styles.whiteText
                            : styles.primaryText
                        }
                        numberOfLines={2}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </ScrollView>
          <View
            style={[
              styles.footer,
              { paddingBottom: insets.bottom + spacing.sm },
            ]}
          >
            <View style={styles.footerPrice}>
              <Text text="Service price" size="xxs" style={styles.mutedText} />
              <Text
                text={formatPrice(catalog.price)}
                size="sm"
                weight="bold"
                style={styles.primaryText}
                numberOfLines={1}
              />
            </View>
            <TouchableOpacity
              onPress={messageProvider}
              disabled={openingChat}
              style={styles.chatButton}
              accessibilityRole="button"
              accessibilityLabel="Chat with professional"
            >
              {openingChat ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Image
                  source={images.chat}
                  tintColor={colors.primary}
                  style={styles.chatIcon}
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={requestService}
              disabled={requestingBooking}
              style={styles.requestButton}
              accessibilityRole="button"
              accessibilityLabel="Post a job for this service"
            >
              <Text
                text="Post a Job"
                size="xxs"
                weight="bold"
                style={styles.whiteText}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  centerText: { textAlign: 'center', color: colors.textDim },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  whiteText: { color: colors.palette.white },
  mutedText: { color: colors.textDim },
  primaryText: { color: colors.primary },
  gallery: { alignItems: 'center' },
  heroFrame: {
    borderRadius: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.palette.offWhite2,
  },
  heroPlaceholder: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  placeholderIcon: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  counter: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    borderRadius: spacing.lg,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.palette.overlayDark60,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  dotTouch: { padding: spacing.xxs },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.palette.light,
  },
  activeDot: { width: 20, backgroundColor: colors.primary },
  card: {
    backgroundColor: colors.palette.white,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.separator,
    padding: spacing.md,
    gap: spacing.sm,
  },
  tags: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  tag: {
    borderRadius: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.primaryDimmed,
  },
  title: { color: colors.text },
  pricePanel: {
    backgroundColor: colors.primaryDimmed,
    padding: spacing.sm,
    borderRadius: spacing.sm,
    gap: spacing.xxs,
  },
  description: { color: colors.textDim, lineHeight: 22 },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  providerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryDimmed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerInfo: { flex: 1, gap: spacing.xxxs },
  serviceChoices: { gap: spacing.xs },
  serviceChoice: {
    maxWidth: 150,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectedChoice: { backgroundColor: colors.primary },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    backgroundColor: colors.palette.white,
  },
  footerPrice: { flex: 1, minWidth: 88 },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: spacing.sm,
    backgroundColor: colors.primaryDimmed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatIcon: { width: 22, height: 22, resizeMode: 'contain' },
  requestButton: {
    height: 44,
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
