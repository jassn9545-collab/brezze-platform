import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BackButtom,
  ContextMenu,
  Screen,
  TapRating,
  Text,
} from '../components';
import React, { FC, useCallback, useState } from 'react';
import moment from 'moment';

import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';
import { colors, images, spacing } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Currency } from '../config/defaults';
import { HITSLOP, parseSource } from '../utils/util';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import FastImage from '@d11/react-native-fast-image';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigators/AppStack';
import { ProviderCatalog } from '../apis/catalogs';
import {
  createStripeOnboardingLink,
  getStripeAccountStatus,
  StripeAccountStatus,
} from '../apis/stripe';
import { getProfile } from '../slices/auth.slice';
import { ProfileReview } from '../slices/types';

type NavigationProps = AppBottomTabScreenProps<'Profile'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;
type VisibleMenuType = { visible: false } | { visible: true; anchor: number };

const Profile: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  const { getProfile: refreshProfile } = props;
  const [visibleMenu, setVisibleMenu] = useState<VisibleMenuType>({
    visible: false,
  });
  const [stripeStatus, setStripeStatus] = useState<StripeAccountStatus | null>(null);
  const [stripeLoading, setStripeLoading] = useState(true);
  const [openingStripe, setOpeningStripe] = useState(false);

  const refreshStripeStatus = useCallback(async () => {
    setStripeLoading(true);
    try {
      setStripeStatus(await getStripeAccountStatus());
    } catch {
      // The shared API client displays the request error.
    } finally {
      setStripeLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshProfile();
      refreshStripeStatus();
    }, [refreshProfile, refreshStripeStatus]),
  );

  const openStripeSetup = async () => {
    if (openingStripe) return;
    setOpeningStripe(true);
    try {
      const url = await createStripeOnboardingLink();
      await Linking.openURL(url);
    } catch (error: any) {
      toast.show(error?.message ?? 'Unable to open Stripe setup.', {
        type: 'danger',
      });
    } finally {
      setOpeningStripe(false);
    }
  };
  const rightHeaderComponent = React.useMemo(
    () => (
      <TouchableOpacity
        hitSlop={HITSLOP.MEDIUM}
        onPress={event =>
          onPressMenu(event.nativeEvent.pageY - event.nativeEvent.locationY)
        }
      >
        <Image resizeMode="contain" source={images.threeDotIcon} />
      </TouchableOpacity>
    ),
    [],
  );

  const onPressMenu = (anchor: number) => {
    setVisibleMenu(prev => {
      return prev.visible ? { visible: false } : { visible: true, anchor };
    });
  };

  return (
    <>
      <BackButtom
        heading={props.profileData?.name}
        style={{
          paddingHorizontal: spacing.md,
          paddingTop: insets.top + spacing.sm,
        }}
        rightComponent={rightHeaderComponent}
      />
      <Screen preset="auto" contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <FastImage
            resizeMode="cover"
            style={styles.userImage}
            source={{ uri: props.baseURl + '/' + props.profileData?.profile_image }}
          />
          <View style={styles.userDetail}>
            <Text size="md" weight="semiBold" text={props.profileData?.name} />
            <Text
              size="sm"
              style={styles.textDim}
              text={props.profileData?.street_address}
            />
            {props.profileData?.is_top_rated && (
              <View style={styles.userBadge}>
                <Text
                  size="xxs"
                  weight="semiBold"
                  tx='profile.topRated'
                  style={styles.greenText}
                />
              </View>
            )}
          </View>
        </View>
        <View style={styles.userProfile}>
          <View style={styles.singleProfileContent}>
            <Text
              size="sm"
              weight="semiBold"
              text={Currency.sign + (props.profileData?.total_earnings ?? 0)}
            />
            <Text size="xxs" weight="medium" tx="profile.totalEarnings" />
          </View>
          <View style={styles.singleProfileContent}>
            <Text
              size="sm"
              weight="semiBold"
              text={(props.profileData?.total_jobs ?? 0)?.toString()}
            />
            <Text size="xxs" weight="medium" tx="profile.totalJobs" />
          </View>
          <View style={styles.singleProfileContent}>
            <Text
              size="sm"
              weight="semiBold"
              style={{ color: colors.primary }}
              text={(props.profileData?.job_success_score ?? 0)?.toString() + '%'}
            />
            <Text size="xxs" weight="medium" tx="profile.jobSuccess" />
          </View>
        </View>
        <View
          style={[
            styles.stripeCard,
            stripeStatus?.ready_for_payments && styles.stripeCardReady,
          ]}
        >
          <View style={styles.stripeCopy}>
            <Text
              size="sm"
              weight="semiBold"
              text={
                stripeStatus?.ready_for_payments
                  ? 'Stripe payments ready'
                  : 'Stripe setup required'
              }
            />
            <Text
              size="xxs"
              style={styles.textDim}
              text={
                stripeStatus?.ready_for_payments
                  ? 'Customers can pay you after a job is completed.'
                  : 'Finish Stripe onboarding before customers can complete payment.'
              }
            />
          </View>
          {stripeLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : stripeStatus?.ready_for_payments ? (
            <Text size="xs" weight="semiBold" text="Ready" style={styles.greenText} />
          ) : (
            <TouchableOpacity
              style={styles.stripeButton}
              onPress={openStripeSetup}
              disabled={openingStripe}
              accessibilityRole="button"
              accessibilityLabel="Complete Stripe Setup"
            >
              {openingStripe ? (
                <ActivityIndicator color={colors.palette.white} />
              ) : (
                <Text
                  size="xxs"
                  weight="semiBold"
                  text="Complete Setup"
                  style={styles.stripeButtonText}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.servicesContainer}>
          <Text size="md" weight="semiBold" tx="profile.services" />
          <View style={styles.servicesWrapper}>
            {props.profileData?.categories?.map((data, index) => (
              <View key={index} style={styles.service}>
                <Text size="xs" text={data} />
                <Image source={images.verified} />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.reviewContainer}>
          <View style={styles.reviewHeading}>
            <Text size="md" weight="semiBold" tx="profile.reviews" />
            <Text
              size="xxs"
              weight="semiBold"
              text={
                (props.profileData?.review_count ?? 0) > 0
                  ? `${Number(props.profileData?.avg_rating ?? 0).toFixed(1)} (${props.profileData?.review_count})`
                  : 'No reviews yet'
              }
              style={styles.primaryText}
            />
          </View>
          <FlatList
            data={props.profileData?.reviews ?? []}
            keyExtractor={item => String(item.id)}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Review item={item} baseUrl={props.baseURl} />
            )}
          />
        </View>
      </Screen>
      {visibleMenu.visible && (
        <ContextMenu
          type={'file'}
          onPress={(item: string) => {
            if (item === 'edit') {
              props.navigation.navigate('EditProfile');
            }
          }}
          topAnchor={visibleMenu.anchor}
          onHide={() => {
            setVisibleMenu({ visible: false });
          }}
        />
      )}
    </>
  );
};

type ServiceCardProps = ListRenderItemInfo<ProviderCatalog>;
export const Service = ({ item }: ServiceCardProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const numericPrice = Number(item.price);
  const price = Number.isFinite(numericPrice)
    ? numericPrice.toFixed(2)
    : item.price;
  const imageSource = item.image_urls?.[0]
    ? { uri: item.image_urls[0] }
    : require('../assets/images/dummy/plug.png');

  return (
    <View style={styles.card}>
      <View style={styles.serviceDetail}>
        <Text size="sm" weight="medium" text={item.heading} />
        <Text
          style={styles.extraSmallText}
          text={item.description}
          numberOfLines={2}
        />
        <View style={styles.priceWrapper}>
          <Text
            size="xs"
            weight="semiBold"
            style={styles.priceText}
            text={Currency.code + ' ' + Currency.sign + price}
          />
        </View>

        <TouchableOpacity
          style={styles.viewServiceDetail}
          accessibilityRole="button"
          accessibilityLabel={`View all details for ${item.heading}`}
          onPress={() => navigation.navigate('CatalogDetail', { catalog: item })}
        >
          <Text
            size="xxs"
            weight="medium"
            tx="profile.viewAll"
            style={styles.primaryText}
          />
        </TouchableOpacity>
      </View>

      <Image
        source={imageSource}
        resizeMode="cover"
        style={styles.catalogImage}
      />
    </View>
  );
};

const Review = ({
  item,
  baseUrl,
}: {
  item: ProfileReview;
  baseUrl?: string;
}) => {
  const profileImage = item.reviewer?.profile_image;
  const imageUrl = profileImage
    ? /^https?:\/\//i.test(profileImage)
      ? profileImage
      : `${(baseUrl ?? '').replace(/\/$/, '')}/${profileImage.replace(/^\//, '')}`
    : undefined;

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          resizeMode="cover"
          style={styles.reviewedImage}
          {...parseSource(imageUrl, images.user)}
        />
        <View style={styles.flexOne}>
          <Text
            size="xs"
            weight="medium"
            text={item.reviewer?.name ?? 'Customer'}
          />
          <Text
            text={item.created_at ? moment(item.created_at).fromNow() : ''}
            style={styles.extraSmallText}
          />
        </View>
        <TapRating
          count={5}
          isDisabled
          size={spacing.sm}
          defaultRating={Number(item.star)}
          selectedColor="orange"
        />
      </View>
      {item.review ? (
        <Text size="xxs" weight="light" text={item.review} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.sm,
    alignItems: 'center',
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
  },
  userImage: {
    width: 110,
    height: 110,
    borderWidth: 5,
    borderRadius: 55,
    borderColor: colors.palette.offWhite2,
  },
  userDetail: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xxs + 1,
  },
  textDim: {
    textAlign: 'center',
    color: colors.textDim,
  },
  userBadge: {
    marginTop: spacing.xxs,
    borderRadius: spacing.sm,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.palette.dimGreen,
  },
  greenText: {
    color: colors.palette.green,
  },
  servicesContainer: {
    borderBottomWidth: 1,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderColor: colors.palette.borderColor,
  },
  userProfile: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  stripeCard: {
    gap: spacing.sm,
    margin: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: spacing.sm,
    borderColor: colors.palette.yellow,
    backgroundColor: colors.palette.yellowLight,
  },
  stripeCardReady: {
    borderColor: colors.palette.green,
    backgroundColor: colors.palette.dimGreen,
  },
  stripeCopy: {
    gap: spacing.xxs,
  },
  stripeButton: {
    minHeight: 44,
    borderRadius: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  stripeButtonText: {
    color: colors.palette.white,
  },
  singleProfileContent: {
    flex: 1,
    borderWidth: 1,
    padding: spacing.sm,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    borderColor: colors.palette.borderColor,
  },
  servicesWrapper: {
    flex: 1,
    gap: spacing.xs,
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  service: {
    borderWidth: 1,
    gap: spacing.xxs,
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: spacing.md,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.md,
    borderColor: colors.palette.borderColor,
    backgroundColor: colors.palette.offWhite2,
  },
  primaryText: {
    color: colors.primary,
  },
  card: {
    gap: spacing.md,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderRadius: spacing.sm,
    justifyContent: 'space-between',
    backgroundColor: colors.palette.offWhite,
  },
  serviceDetail: {
    flex: 1,
    gap: spacing.xxs,
  },
  catalogImage: {
    width: 96,
    height: 96,
    borderRadius: spacing.xs,
    backgroundColor: colors.palette.white,
  },
  rating: {
    gap: spacing.xxs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    width: spacing.sm,
    height: spacing.sm,
  },
  extraSmallText: {
    fontSize: spacing.xs + 2,
    lineHeight: spacing.sm + 2,
  },
  verticalLine: {
    width: 2,
    height: spacing.lg,
    backgroundColor: colors.palette.borderColor,
  },
  priceWrapper: {
    gap: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    flexShrink: 1,
    color: colors.primary,
  },
  timeText: {
    flexShrink: 1,
    color: colors.textDim,
  },
  viewServiceDetail: {
    marginTop: spacing.xxs,
    alignSelf: 'flex-start',
    borderRadius: spacing.xxs,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.primaryDimmed + '40',
  },
  reviewContainer: {
    borderBottomWidth: 1,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderColor: colors.palette.borderColor,
  },
  reviewHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
    justifyContent: 'space-between',
  },
  reviewCard: {
    gap: spacing.md,
    padding: spacing.sm,
    borderBottomWidth: 1,
    backgroundColor: colors.palette.offWhite2,
  },
  reviewHeader: {
    gap: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewedImage: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: spacing.xl / 2,
  },
  flexOne: { flex: 1 },
});

const mapStateToProps = (state: RootState) => ({
  profileData: state.auth.myProfile?.user,
  baseURl: state.setting.basic?.base_url
});

const mapDispatch = { getProfile };

const connector = connect(mapStateToProps, mapDispatch);

export const ProfileScreen = connector(Profile);
