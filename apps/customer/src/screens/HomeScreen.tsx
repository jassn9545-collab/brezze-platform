import {
  Button,
  ProfessionalCard,
  SafeRemoteImage,
  Screen,
  Text,
} from '../components';
import {
  ActivityIndicator,
  AppState,
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { colors, images, spacing } from '../theme';
import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';
import {
  DiscoveryCategory,
  DiscoveryHero,
  DiscoveryProfessional,
  getCustomerHero,
  getDiscovery,
} from '../apis/discovery';
import { getNotificationFeed } from '../apis/account';
import { useAppSelector } from '../store/hooks';
import { subscribeToUser } from '../utils/realtime';
import { categoryImage } from '../utils/categoryImage';
import {PUSH_NOTIFICATION_EVENT} from '../utils/Firebase';

type NavigationProps = AppBottomTabScreenProps<'Home'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

const screenWidth = Dimensions.get('window').width;
const HERO_REFRESH_INTERVAL_MS = 10000;

const Home: FC<Props> = (props) => {
  const [categories, setCategories] = useState<DiscoveryCategory[]>([]);
  const [professionals, setProfessionals] = useState<DiscoveryProfessional[]>([]);
  const [hero, setHero] = useState<DiscoveryHero | null>(null);
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const ownUserId = useAppSelector(state => state.auth.myProfile?.user?.id);

  useFocusEffect(useCallback(() => {
    let active = true;

    const refreshHero = () => {
      getCustomerHero()
        .then(latestHero => {
          if (active) setHero(latestHero);
        })
        .catch(() => undefined);
    };

    const refreshDiscovery = () => {
      setLoading(true);

      getDiscovery()
        .then(data => {
          if (!active) return;
          setHero(data.hero ?? null);
          setCategories(data.categories);
          setProfessionals(data.featured_professionals.slice(0, 3));
        })
        .catch(() => {
          if (!active) return;
          setHero(null);
          setCategories([]);
          setProfessionals([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    };

    refreshDiscovery();
    const heroRefreshInterval = setInterval(
      refreshHero,
      HERO_REFRESH_INTERVAL_MS,
    );
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        refreshDiscovery();
        refreshHero();
      }
    });

    return () => {
      active = false;
      clearInterval(heroRefreshInterval);
      appStateSubscription.remove();
    };
  }, []));

  useEffect(() => {
    setHeroImageFailed(false);
  }, [hero?.image_url]);

  useFocusEffect(useCallback(() => {
    let active = true;
    const refreshUnreadCount = () => {
      getNotificationFeed()
        .then(feed => {
          if (active) setUnreadNotifications(feed.unread_count);
        })
        .catch(() => undefined);
    };

    refreshUnreadCount();
    const unsubscribe = ownUserId
      ? subscribeToUser(Number(ownUserId), () => undefined, event => {
          if (event.notification) refreshUnreadCount();
        })
      : undefined;
    const pushSubscription = DeviceEventEmitter.addListener(
      PUSH_NOTIFICATION_EVENT,
      refreshUnreadCount,
    );
    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') refreshUnreadCount();
    });

    return () => {
      active = false;
      unsubscribe?.();
      pushSubscription.remove();
      appStateSubscription.remove();
    };
  }, [ownUserId]));

  return (
    <>
      {/* <View style={[styles.wrapHeader, { marginTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => props.navigation.openDrawer()}>
          <Image source={images.menuIcon} />
        </TouchableOpacity>
        <Image source={images.appLogo} />
        <TouchableOpacity
          onPress={() => props.navigation.navigate('Notification')}
        >
          <Image source={images.notification} />
        </TouchableOpacity>
      </View> */}

      <Screen
        preset="scroll"
        contentContainerStyle={styles.container}
        safeAreaEdges={['top']}
      >

        {/* HEADER */}

        <View style={styles.mainView}>
          <TouchableOpacity onPress={() => props.navigation.openDrawer()}>
            <Image source={images.navbaricon} />
          </TouchableOpacity>
          <Text
            tx="bottomTab.Home"
            weight="medium"
            size="xl"
          />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            onPress={() => props.navigation.navigate('Notifications')}
            style={styles.notificationButton}
          >
            <Image source={images.bellIcon} />
            {unreadNotifications > 0 ? (
              <View style={styles.notificationBadge}>
                <Text
                  text={unreadNotifications > 99 ? '99+' : String(unreadNotifications)}
                  style={styles.notificationBadgeText}
                />
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {/* BANNER */}

        <View style={styles.thirdSection}>
          <ImageBackground
            source={hero?.image_url && !heroImageFailed ? { uri: hero.image_url } : images.homeImage}
            defaultSource={images.homeImage}
            onError={() => setHeroImageFailed(true)}
            style={styles.imageHome}
            imageStyle={{ borderRadius: 20 }}
          >
            <View
              style={[
                styles.overlay,
                hero !== null && !hero.title?.trim() && !hero.button_text?.trim()
                  ? styles.overlayTransparent
                  : null,
              ]}
            >
              {hero === null ? (
                <Text style={styles.bannerText} tx="home.title" />
              ) : hero.title?.trim() ? (
                <Text style={styles.bannerText} text={hero.title.trim()} />
              ) : null}
              {hero === null ? (
                <TouchableOpacity onPress={() => props.navigation.navigate('Service')}>
                  <Button tx="home.bookNow" />
                </TouchableOpacity>
              ) : hero.button_text?.trim() ? (
                <TouchableOpacity onPress={() => props.navigation.navigate('Service')}>
                  <Button text={hero.button_text.trim()} />
                </TouchableOpacity>
              ) : null}
            </View>
          </ImageBackground>
        </View>

        {/* CATEGORY HEADER */}

        <View style={styles.categoryHeader}>
          <Text tx="home.Categories" weight="semiBold" size="md" />
          <TouchableOpacity onPress={() => props.navigation.navigate('Categories')}>
            <Text tx="home.viewAll" size="xxs" weight="semiBold" style={styles.viewAllText} />
          </TouchableOpacity>
        </View>

        {/* CATEGORY GRID */}

        <FlatList
          data={categories}
          keyExtractor={item => String(item.id)}
          numColumns={4}
          contentContainerStyle={styles.categoryContainer}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.categoryItem}
              onPress={() =>
                props.navigation.navigate('CategoryServices', {
                  categoryId: item.id,
                  categoryName: item.name,
                })
              }
            >
              <SafeRemoteImage
                uri={item.image_url}
                fallback={categoryImage(item.slug, item.name)}
                style={styles.categoryImage}
              />
              <Text
                text={item.name}
                weight="regular"
                size="xxs"
                style={styles.categoryText}
                numberOfLines={2}
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={loading ? <ActivityIndicator color={colors.primary} /> : null}
        />

        {/* FEATURED HEADER */}

        <View style={styles.featureHeader}>
          <Text tx="home.featuredProfessionals" weight="semiBold" size="lg" />
          <TouchableOpacity onPress={() => props.navigation.navigate('FeaturedProfessionals')}>
            <Text tx="home.viewAll" size="xxs" weight="medium" style={styles.viewAllText} />
          </TouchableOpacity>
        </View>

        {/* FEATURED LIST */}

        <FlatList
          data={professionals.slice(0, 3)}
          keyExtractor={item => String(item.id)}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <ProfessionalCard
              professional={item}
              onPress={() => props.navigation.navigate('ProfessionalProfile', { id: item.id })}
            />
          )}
          ListEmptyComponent={loading ? <ActivityIndicator color={colors.primary} /> : null}
        />

        {/* <View>
          <Carousel
            width={screenWidth}
            height={scale(250)}
            data={props.data?.banner ?? []}
            loop={true}
            autoPlay={true}
            autoPlayInterval={2000}
            style={styles.carouselStyle}
            onSnapToItem={index => setActiveIndex(index)}
            renderItem={({ item, index }) => {
              return (
                <FastImage
                  key={index}
                  source={{
                    uri: `${props.data?.image_base_url}/${item.photo}`,
                  }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              );
            }}
          />
          <View style={styles.wrapCarouselDots}>
            {(props.data?.banner ?? []).map((_, index) => (
              <View
                key={index}
                style={
                  activeIndex === index ? styles.activeDot : styles.inactiveDot
                }
              />
            ))}
          </View>
        </View> */}

      </Screen>
    </>
  );
};


const styles = StyleSheet.create({

  container: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  mainView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  notificationButton: {
    position: 'relative',
    padding: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -7,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    borderWidth: 1,
    borderColor: colors.palette.white,
  },
  notificationBadgeText: {
    color: colors.palette.white,
    fontSize: 10,
    lineHeight: 12,
  },
  thirdSection: {
    paddingHorizontal: 15,
    marginTop: 15,
  },

  imageHome: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
  },

  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 20,
    alignItems: 'center',
  },
  overlayTransparent: {
    backgroundColor: colors.transparent,
  },

  bannerText: {
    color: colors.palette.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    width: '80%',
  },



  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
  },

  categoryContainer: {
    paddingHorizontal: 20,
  },

  categoryItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 22,
  },

  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 7,
  },
  categoryText: {
    textAlign: 'center',
    lineHeight: 16,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginTop: 10,
  },

  viewAllText: {
    color: colors.primary,
  },

  wrapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
  },

  carouselStyle: {
    paddingStart: spacing.md,
    marginVertical: spacing.md,
  },

  carouselImage: {
    height: '100%',
    overflow: 'hidden',
    alignSelf: 'center',
    borderRadius: spacing.md,
    width: screenWidth - spacing.md * 2,
    backgroundColor: colors.primaryDimmed,
  },

  wrapCarouselDots: {
    bottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
  },

  inactiveDot: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: spacing.xxs,
    marginHorizontal: spacing.xxs,
    backgroundColor: colors.palette.white,
  },

  activeDot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.xs,
    marginHorizontal: spacing.xxs,
    backgroundColor: colors.primary,
  },

});

// const mapStateToProps = (state: RootState) => ({
//   data: state.home.homeData,
// });

// const mapDispatch = {
//   getProfile,
//   getHomeData,
//   getCategories,
//   addToCart: (params: AddCartParams) => addToCart(params),
//   addToWishlist: (params: WishlistParams) => addToWishlist(params),
//   removeToWishlist: (params: WishlistParams) => removeToWishlist(params),
// };

// const connector = connect(mapStateToProps, mapDispatch);

export const HomeScreen = Home;
