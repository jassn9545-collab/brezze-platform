import {
  ActivityIndicator,
  FlatList,
  Image,
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

import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';
import { colors, images, spacing } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Currency } from '../config/defaults';
import { HITSLOP, parseSource } from '../utils/util';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import FastImage from '@d11/react-native-fast-image';
import { useFocusEffect } from '@react-navigation/native';
import { getServiceCatalogs, ProviderCatalog } from '../apis/catalogs';

type NavigationProps = AppBottomTabScreenProps<'Profile'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;
type VisibleMenuType = { visible: false } | { visible: true; anchor: number };

const Profile: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  const [visibleMenu, setVisibleMenu] = useState<VisibleMenuType>({
    visible: false,
  });
  const [catalogs, setCatalogs] = useState<ProviderCatalog[]>([]);
  const [catalogsLoading, setCatalogsLoading] = useState(true);

  const loadCatalogs = useCallback(async () => {
    setCatalogsLoading(true);
    try {
      setCatalogs(await getServiceCatalogs());
    } catch {
      // The API interceptor displays the server error.
    } finally {
      setCatalogsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCatalogs();
    }, [loadCatalogs]),
  );

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
        <View style={styles.servicesCatalogContainer}>
          <View style={styles.catalogHeading}>
            <Text size="md" weight="semiBold" tx="profile.serviceCatalog" />
            <TouchableOpacity
              hitSlop={HITSLOP.MEDIUM}
              onPress={() => props.navigation.navigate('AddCatalogModal')}
            >
              <Text
                size="xxs"
                weight="semiBold"
                tx="profile.addCatalog"
                style={styles.primaryText}
              />
            </TouchableOpacity>
          </View>
          {catalogsLoading ? (
            <ActivityIndicator
              color={colors.primary}
              style={styles.catalogLoader}
            />
          ) : (
            <FlatList
              data={catalogs.slice(0, 3)}
              keyExtractor={item => item.id.toString()}
              scrollEnabled={false}
              ListEmptyComponent={
                <Text
                  size="xs"
                  tx="profile.noCatalogs"
                  style={styles.emptyCatalogText}
                />
              }
              renderItem={info => <Service {...info} />}
            />
          )}
          <TouchableOpacity
            style={styles.viewAllCatalogs}
            onPress={() => props.navigation.navigate('ServiceCatalog')}
          >
            <Text
              size="xxs"
              weight="semiBold"
              tx="profile.viewAll"
              style={styles.primaryText}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.reviewContainer}>
          <View style={styles.reviewHeading}>
            <Text size="md" weight="semiBold" tx="profile.reviews" />
            <Text
              size="xxs"
              weight="semiBold"
              tx="profile.seeAll"
              txOptions={{
                value: '4.9',
              }}
              style={styles.primaryText}
            />
          </View>
          <FlatList
            data={[1, 1, 1]}
            scrollEnabled={false}
            renderItem={info => <Review {...info} />}
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
        <View style={styles.rating}>
          <Image
            source={images.star}
            tintColor={colors.palette.black}
            resizeMode="contain"
            style={styles.star}
          />
          <Text style={styles.extraSmallText} text="0.00 ( 0 Reviews )" />
        </View>
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
            text={Currency.code + Currency.sign + price}
          />
        </View>

        <TouchableOpacity style={styles.viewServiceDetail}>
          <Text
            size="xxs"
            weight="medium"
            tx="job.viewDetails"
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

type ReviewCardProps = ListRenderItemInfo<any>;
const Review = ({ item }: ReviewCardProps) => {
  return (
    <View key={item.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image
          resizeMode="cover"
          style={styles.reviewedImage}
          {...parseSource('https://i.pravatar.cc/300', images.user)}
        />
        <View style={styles.flexOne}>
          <Text size="xs" weight="medium" text="Sarah Miller" />
          <Text text="2 DAYS AGO" style={styles.extraSmallText} />
        </View>
        <TapRating
          count={5}
          isDisabled
          size={spacing.sm}
          defaultRating={5}
          selectedColor="orange"
        />
      </View>
      <Text
        size="xxs"
        weight="light"
        text="“Passionate about Home Appliances and house fitting issues with 10+ year Experince in residential repairs. I Specialize  installations. “"
      />
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
  servicesCatalogContainer: {
    borderBottomWidth: 1,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderColor: colors.palette.borderColor,
  },
  catalogHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
    justifyContent: 'space-between',
  },
  primaryText: {
    color: colors.primary,
  },
  catalogLoader: {
    marginVertical: spacing.md,
  },
  emptyCatalogText: {
    color: colors.textDim,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  viewAllCatalogs: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
  },
  card: {
    gap: spacing.md,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderRadius: spacing.sm,
    justifyContent: 'space-between',
    backgroundColor: colors.palette.offWhite2,
  },
  serviceDetail: {
    flex: 1,
    gap: spacing.xxs,
  },
  catalogImage: {
    width: 88,
    height: 88,
    borderRadius: spacing.xs,
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
    backgroundColor: colors.primaryDimmed,
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

const connector = connect(mapStateToProps);

export const ProfileScreen = connector(Profile);
