import { BackButtom, ReadMore, Screen, TapRating, Text } from '../components';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import React, { FC } from 'react';
import { spacing, images, colors } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { getFreelancerProfile } from '../slices/job.slice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from '@d11/react-native-fast-image';
import { Currency } from '../config/defaults';
import { parseSource } from '../utils/util';

type NavigationProps = AppStackScreenProps<'ProfessionalProfile'>;
type Props = NavigationProps & ConnectedProps<typeof connector>;

const ProfessionalProfile: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  React.useEffect(() => {
    if (props.route.params?.id) {
      props.getFreelancerProfile({ id: props.route.params.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.route.params?.id]);

  return (
    <>
      <BackButtom
        heading={props.profileData?.name}
        style={{
          paddingHorizontal: spacing.md,
          paddingTop: insets.top + spacing.sm,
        }}
      />
      <Screen preset="auto" contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <FastImage
              resizeMode="cover"
              style={styles.userImage}
              source={{
                uri: props.baseURl + '/' + props.profileData?.profile_image,
              }}
            />
            <View style={styles.verifiedBadge}>
              <Text
                text="✓"
                size="xxs"
                weight="semiBold"
                style={styles.verifiedIcon}
              />
            </View>
          </View>
          <View style={styles.userDetail}>
            <Text size="md" weight="semiBold" text={props.profileData?.name} />
            <Text
              size="sm"
              style={styles.textDim}
              text={props.profileData?.street_address!}
            />
            {props.profileData?.is_top_rated && (
              <View style={styles.userBadge}>
                <Text
                  size="xxs"
                  weight="semiBold"
                  style={styles.greenText}
                  tx="professionalProfile.topRated"
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
            <Text
              size="xxs"
              weight="medium"
              tx="professionalProfile.totalEarnings"
            />
          </View>
          <View style={styles.singleProfileContent}>
            <Text
              size="sm"
              weight="semiBold"
              text={(props.profileData?.total_jobs ?? 0)?.toString()}
            />
            <Text
              size="xxs"
              weight="medium"
              tx="professionalProfile.totalJobs"
            />
          </View>
          <View style={styles.singleProfileContent}>
            <Text
              size="sm"
              weight="semiBold"
              style={{ color: colors.primary }}
              text={
                (props.profileData?.job_success_score ?? 0)?.toString() + '%'
              }
            />
            <Text
              size="xxs"
              weight="medium"
              tx="professionalProfile.jobSuccess"
            />
          </View>
        </View>
        <View style={styles.professionalBrief}>
          <View style={styles.rowBetween}>
            <Text
              size="md"
              weight="semiBold"
              style={styles.specialistText}
              text={props.profileData?.profile_title!}
            />
          </View>
          <ReadMore
            text={props.profileData?.profile_description ?? ''}
            style={{ color: colors.palette.grayLight2 }}
          />
        </View> 
        <View style={styles.servicesContainer}>
          <Text size="md" weight="semiBold" tx="professionalProfile.services" />
          <View style={styles.servicesWrapper}>
            {props.profileData?.categories?.map((data, index) => (
              <View key={index} style={styles.service}>
                <Text size="xs" text={data} />
                <Image source={images.greenCheckIcon} />
              </View>
            ))}
          </View>
        </View>
        <View style={styles.servicesCatalogContainer}>
          <View style={styles.catalogHeading}>
            <Text
              size="md"
              weight="semiBold"
              tx="professionalProfile.serviceCatalog"
            />
            <Text
              size="xxs"
              weight="semiBold"
              tx="profile.viewAll"
              style={styles.primaryText}
            />
          </View>
          <FlatList
            data={[1, 1, 1]}
            scrollEnabled={false}
            renderItem={info => <Service {...info} />}
          />
        </View>
        <View style={styles.reviewContainer}>
          <View style={styles.reviewHeading}>
            <Text
              size="md"
              weight="semiBold"
              tx="professionalProfile.reviews"
            />
            <Text
              size="xxs"
              weight="semiBold"
              tx="professionalProfile.seeAll"
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
    </>
  );
};

type ServiceCardProps = ListRenderItemInfo<any>;
export const Service = ({ item }: ServiceCardProps) => {
  return (
    <View key={item.id} style={styles.card}>
      <View style={styles.serviceDetail}>
        <View style={styles.rating}>
          <Image
            source={images.star}
            tintColor={colors.palette.black}
            resizeMode="contain"
            style={styles.star}
          />
          <Text style={styles.extraSmallText} text="4.84 ( 20K Reviews )" />
        </View>
        <Text size="sm" weight="medium" text="Switchbox Installation" />
        <Text
          style={styles.extraSmallText}
          text="Installed in specified area for new power outlet"
        />
        <View style={styles.priceWrapper}>
          <Text
            size="xs"
            weight="semiBold"
            style={styles.priceText}
            text={Currency.code + Currency.sign + '49.00'}
          />
          <View style={styles.verticalLine} />
          <Text
            size="xs"
            weight="semiBold"
            style={styles.timeText}
            text="30 mins"
          />
        </View>

        <TouchableOpacity style={styles.viewServiceDetail}>
          <Text
            size="xxs"
            weight="medium"
            style={styles.primaryText}
            tx="professionalProfile.viewDetails"
          />
        </TouchableOpacity>
      </View>

      <Image source={require('../assets/images/switchbox.png')} />
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
  verifiedBadge: {
    borderWidth: 2,
    width: spacing.lg,
    right: spacing.xs,
    bottom: spacing.xs,
    height: spacing.lg,
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    borderRadius: spacing.sm,
    borderColor: colors.palette.white,
    backgroundColor: colors.palette.green,
  },
  verifiedIcon: {
    color: colors.palette.white,
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
  professionalBrief: {
    borderBottomWidth: 1,
    borderRadius: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderColor: colors.palette.borderColor,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specialistText: {
    flex: 1,
    marginRight: spacing.sm,
  },
  servicesContainer: {
    borderBottomWidth: 1,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
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
  profileData: state.job.clientProfile,
  baseURl: state.setting.basic?.base_url,
  loading: state.job.clientProfileLoading,
});

const mapDispatch = {
  getFreelancerProfile,
};

const connector = connect(mapStateToProps, mapDispatch);
export const ProfessionalProfileScreen = connector(ProfessionalProfile);
