import { BackButtom, ReadMore, Screen, TapRating, Text } from '../components';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import React, { FC } from 'react';
import moment from 'moment';
import { spacing, images, colors } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { getFreelancerProfile } from '../slices/job.slice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FastImage from '@d11/react-native-fast-image';
import { Currency } from '../config/defaults';
import { parseSource } from '../utils/util';
import { openChatConversation } from '../apis/chat';
import { getFreelancerCatalogs, ServiceCatalog } from '../apis/catalogs';
import { ProfileReview } from '../slices/types';

type NavigationProps = AppStackScreenProps<'ProfessionalProfile'>;
type Props = NavigationProps & ConnectedProps<typeof connector>;

const ProfessionalProfile: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  const [openingChat, setOpeningChat] = React.useState(false);
  const [catalogs, setCatalogs] = React.useState<ServiceCatalog[]>([]);
  const [catalogsLoading, setCatalogsLoading] = React.useState(true);
  const [catalogsError, setCatalogsError] = React.useState(false);
  React.useEffect(() => {
    if (props.route.params?.id) {
      props.getFreelancerProfile({ id: props.route.params.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.route.params?.id]);

  React.useEffect(() => {
    const providerId = props.route.params?.id;
    if (!providerId) {
      setCatalogs([]);
      setCatalogsError(true);
      setCatalogsLoading(false);
      return;
    }
    let active = true;
    setCatalogs([]);
    setCatalogsLoading(true);
    setCatalogsError(false);
    getFreelancerCatalogs(providerId)
      .then(result => {
        if (active) setCatalogs(result.catalogs);
      })
      .catch(() => {
        if (active) setCatalogsError(true);
      })
      .finally(() => {
        if (active) setCatalogsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [props.route.params?.id]);

  const openServiceDetails = (catalogId?: number) => {
    props.navigation.navigate('ServiceDetails', {
      providerId: props.route.params.id,
      initialCatalogId: catalogId,
      projectId: props.route.params.projectId,
    });
  };

  const onPressMessage = async () => {
    if (openingChat) return;
    setOpeningChat(true);
    try {
      const conversation = await openChatConversation(
        props.route.params.id,
        props.route.params.projectId,
      );
      props.navigation.navigate('ChatDetail', {
        conversationId: conversation.id,
        participantName: conversation.other_user.name,
        participantImage: conversation.other_user.profile_image,
      });
    } catch {
      // The API client shows the request error; keep this screen available for retry.
    } finally {
      setOpeningChat(false);
    }
  };

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
        {props.profileData?.id === props.route.params.id ? (
          <TouchableOpacity
            style={styles.messageButton}
            onPress={onPressMessage}
            disabled={openingChat}
          >
            <Text
              size="sm"
              weight="semiBold"
              tx={openingChat ? 'chat.opening' : 'chat.message'}
              style={styles.messageButtonText}
            />
          </TouchableOpacity>
        ) : null}
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
            <TouchableOpacity
              onPress={() => openServiceDetails()}
              accessibilityRole="button"
              accessibilityLabel="View all services"
            >
              <Text
                size="xxs"
                weight="semiBold"
                tx="profile.viewAll"
                style={styles.primaryText}
              />
            </TouchableOpacity>
          </View>
          {catalogsLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.catalogLoading} />
          ) : catalogsError ? (
            <Text text="Could not load services. Tap View All to retry." size="xs" style={styles.catalogMessage} />
          ) : catalogs.length === 0 ? (
            <Text text="No services added yet." size="xs" style={styles.catalogMessage} />
          ) : (
            <FlatList
              data={catalogs.slice(0, 3)}
              keyExtractor={item => String(item.id)}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <Service catalog={item} onPress={() => openServiceDetails(item.id)} />
              )}
            />
          )}
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
    </>
  );
};

type ServiceCardProps = {
  catalog: ServiceCatalog;
  onPress: () => void;
};

export const Service = ({ catalog, onPress }: ServiceCardProps) => {
  const amount = Number(catalog.price);
  const price = Number.isFinite(amount) ? amount.toFixed(2) : catalog.price;
  const imageUrl = catalog.image_urls?.[0];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={'View details for ' + catalog.heading}
    >
      <View style={styles.serviceDetail}>
        <Text size="sm" weight="semiBold" text={catalog.heading} numberOfLines={2} />
        <Text style={styles.extraSmallText} text={catalog.description} numberOfLines={2} />
        <Text
          size="xs"
          weight="semiBold"
          style={styles.priceText}
          text={Currency.code + ' ' + Currency.sign + price}
        />
        <View style={styles.viewServiceDetail}>
          <Text
            size="xxs"
            weight="medium"
            style={styles.primaryText}
            tx="professionalProfile.viewDetails"
          />
        </View>
      </View>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} resizeMode="cover" style={styles.catalogImage} />
      ) : (
        <View style={[styles.catalogImage, styles.catalogPlaceholder]}>
          <Image source={images.service} style={styles.catalogPlaceholderIcon} />
        </View>
      )}
    </TouchableOpacity>
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
  messageButton: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  messageButtonText: { color: colors.palette.white },
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
  catalogLoading: { marginVertical: spacing.md },
  catalogMessage: { color: colors.textDim, marginBottom: spacing.md },
  catalogImage: { width: 80, height: 80, borderRadius: spacing.xs },
  catalogPlaceholder: { backgroundColor: colors.primaryDimmed, alignItems: 'center', justifyContent: 'center' },
  catalogPlaceholderIcon: { width: 32, height: 32, resizeMode: 'contain', tintColor: colors.primary },
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
