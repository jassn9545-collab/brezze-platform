import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  ViewToken,
  Dimensions,
  Image,
} from 'react-native';
import React, { FC, useRef, useState } from 'react';
import { Screen, Text, BackButtom, Button } from '../components';
import { colors, spacing, images, typography } from '../theme';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';
import FastImage from '@d11/react-native-fast-image';
import { getStatusStyle } from './JobPostListScreen';
import { Job } from '../slices/types';
import moment from 'moment';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type NavigationProps = AppBottomTabScreenProps<'Profile'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

const ClientProfileScreen: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const onViewableItemsChanged = React.useMemo(
    () =>
      ({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0) {
          let item = viewableItems[0].index;
          setSelectedIndex(item ?? 0);
        }
      },
    [],
  );

  const onPressJob = (data: Job) => {
    props.navigation.navigate('jobPostDetails', {
      id: data.id,
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
      />

      <Screen preset="auto" contentContainerStyle={styles.container}>
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <FastImage
              source={{
                uri: props.baseURl + '/' + props.profileData?.profile_image,
              }}
              style={styles.avatar}
            />
            <View style={styles.tick}>
              <Text text="✓" style={{ color: colors.palette.white,}} />
            </View>
          </View>

          <Text
            size="md"
            weight="semiBold"
            text={props.profileData?.name}
            style={styles.nameText}
          />

          <Text
            size="sm"
            style={styles.addressText}
            numberOfLines={2}
            ellipsizeMode="tail"
            text={props.profileData?.street_address}
          />

          <View style={styles.verifiedBadge}>
            <Text
              size="xxs"
              weight="semiBold"
              tx="profile.verifiedClient"
              style={styles.verifiedText}
            />
          </View>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text
              size="sm"
              weight="semiBold"
              numberOfLines={1}
              text={(props.profileData?.total_jobs ?? 0).toString()}
            />
            <Text tx="profile.jobPosted" size="xxs" weight="medium" />
          </View>
          <View style={styles.statItem}>
            <Text
              text={`${props.profileData?.avg_rating ?? 0} ⭐`}
              size="sm"
              weight="semiBold"
              style={styles.primaryText}
              numberOfLines={1}
            />
            <Text tx="profile.avgRating" size="xxs" weight="medium" />
          </View>
          <View style={styles.statItem}>
            <Text
              text={props.profileData?.refral_code ?? 'N/A'}
              size="sm"
              weight="semiBold"
              numberOfLines={1}
            />
            <Text tx="profile.referralCode" size="xxs" weight="medium" />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Button
            textStyle={styles.textStyleBtn}
            style={styles.editProfileBtn}
            preset="plus"
            tx="profile.editProfile"
            onPress={() => props.navigation.navigate('EditProfile')}
          />
          <Button
            textStyle={styles.textStyleBtn}
            style={styles.postJobBtn}
            tx="profile.postAJob"
          />
        </View>
        {(props.profileData?.last3_jobs?.length ?? 0) > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text size="md" weight="semiBold" tx="profile.jobPostSummary" />
              <TouchableOpacity
                onPress={() => props.navigation.navigate('JobPostList')}
              >
                <Text
                  size="xxs"
                  weight="semiBold"
                  tx="profile.viewAll"
                  style={{ color: colors.primary }}
                />
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              pagingEnabled
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewConfigRef.current}
              showsHorizontalScrollIndicator={false}
              data={props.profileData?.last3_jobs}
              keyExtractor={item => item?.id?.toString()}
              renderItem={({ item, index }) => (
                <SingleJob
                  item={item}
                  baseURl={props.baseURl!}
                  index={index}
                  onPress={onPressJob}
                />
              )}
            />
            <View style={styles.dotContainer}>
              {props.profileData?.last3_jobs.map((data, index) => (
                <View
                  key={data.id}
                  style={[
                    styles.dotStyle,
                    index === selectedIndex && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}

        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text tx="profile.currentHiring" size="md" weight="semiBold" />
            <TouchableOpacity
              onPress={() => props.navigation.navigate('HireHistory')}
            >
              <Text
                size="xxs"
                weight="semiBold"
                tx="profile.viewAll"
                style={{ color: colors.primary }}
              />
            </TouchableOpacity>
          </View>
        </View> */}

        {/* <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text text="Reviews" size="md" weight="semiBold" />
            <TouchableOpacity>
              <Text
                text={`See All (${props.profileData?.avg_rating ?? 0})`}
                size="xxs"
                weight="semiBold"
                style={{ color: colors.primary }}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <FastImage source={images.profile1} style={styles.reviewImage} />
              <View style={styles.flexOne}>
                <Text text="Sarah Miller" size="xs" weight="medium" />
                <Text
                  text="2 DAYS AGO"
                  size="xxs"
                  style={{
                    color: colors.textDim,
                  }}
                />
              </View>
              <Text text="⭐⭐⭐⭐⭐" size="xs" />
            </View>
            <Text
              text="Passionate about home appliances and repair work"
              size="xxs"
              style={{
                color: colors.textDim,
              }}
            />
          </View>
        </View> */}
      </Screen>
    </>
  );
};

const SingleJob = ({
  item,
  index,
  onPress,
}: {
  item: Job;
  index: number;
  baseURl: string;
  onPress: (data: Job) => void;
}) => {
  const statusStyle = getStatusStyle(item.status);

  return (
    <View key={index} style={styles.jobCard}>
      <View style={styles.jobCardInner}>
        {/* <FastImage source={{}} style={styles.jobImage} /> */}
        <View style={styles.jobContent}>
          <View style={styles.jobRow}>
            <Text
              size="sm"
              weight="medium"
              text={item?.title}
              style={styles.flexOne}
            />
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusStyle.backgroundColor },
              ]}
            >
              <Text
                size="xxs"
                weight="bold"
                text={item.status.toUpperCase()}
                style={{ color: statusStyle.color }}
              />
            </View>
          </View>
          <View style={styles.jobRow}>
            <View>
              <View style={styles.row}>
                <Image source={images.timeIcon} />
                <Text
                  size="xxs"
                  style={{
                    color: colors.textDim,
                  }}
                  tx="profile.posted"
                  txOptions={{
                    value: moment(item.created_at).fromNow(),
                  }}
                />
              </View>

              {(item?.bids_count ?? 0) > 0 && (
                <View style={styles.row}>
                  <Image source={images.smallVector} />
                  <Text
                    size="xxs"
                    style={{
                      color: colors.textDim,
                    }}
                    tx="profile.applicantsApplied"
                    txOptions={{
                      value: (item?.bids_count ?? 0)?.toString(),
                    }}
                  />
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() => onPress(item)}
            >
              <Text
                size="xxs"
                weight="medium"
                tx="profile.viewDetails"
                style={styles.whiteText}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  profileSection: {
    alignItems: 'center',
    gap: spacing.xxs + 1,
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: spacing.xxs,
    borderColor: colors.palette.offWhite2,
  },
  tick: {
    width: spacing.lg,
    right: spacing.xs,
    height: spacing.lg,
    bottom: spacing.xs,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
  },
  nameText: {
    marginTop: spacing.xs,
  },
  addressText: {
    textAlign: 'center',
    color: colors.textDim,
  },
  primaryText: {
    color: colors.primary,
  },
  whiteText: {
    color: colors.palette.white,
  },
  verifiedBadge: {
    alignSelf: 'center',
    marginTop: spacing.xxs,
    borderRadius: spacing.sm,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.palette.dimGreen,
  },
  verifiedText: {
      textAlign: 'center',
      color: colors.palette.green,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    borderWidth: 1,
    padding: spacing.sm,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    borderColor: colors.palette.borderColor,
  },
  buttonRow: {
    gap: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  editProfileBtn: {
    flex: 1,
    borderRadius: spacing.sm,
    backgroundColor: colors.palette.offWhite2,
  },
  postJobBtn: { flex: 1, borderRadius: spacing.sm },
  textStyleBtn: {
    fontSize: spacing.md - spacing.xxxs,
    fontFamily: typography.primary.semiBold,
  },
  section: {
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-between',
  },
  dotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotStyle: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: spacing.xs / 2,
    marginHorizontal: spacing.xxxs,
    backgroundColor: colors.palette.darkGray1,
  },
  jobCard: {
    flex: 1,
    marginBottom: spacing.sm,
    width: Dimensions.get('window').width,
  },
  jobCardInner: {
    width: '95%',
    overflow: 'hidden',
    alignSelf: 'center',
    borderRadius: spacing.sm,
    backgroundColor: colors.palette.offWhite2,
  },
  jobImage: {
    width: '100%',
    height: 150,
  },
  jobContent: {
    gap: spacing.xxs,
    padding: spacing.sm,
  },
  jobRow: {
    gap: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: spacing.xs,
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingVertical: spacing.xxs,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xxs + 1,
    marginTop: spacing.xxs,
  },
  viewBtn: {
    borderRadius: spacing.xxs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary,
  },
  reviewCard: {
    gap: spacing.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.palette.offWhite2,
  },
  reviewHeader: {
    gap: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
  },
  reviewImage: {
    width: spacing.xl,
    height: spacing.xl,
    borderRadius: spacing.xl / 2,
  },
  flexOne: {
    flex: 1,
  },
});

const mapStateToProps = (state: RootState) => ({
  profileData: state.auth.myProfile?.user,
  baseURl: state.setting.basic?.base_url,
});

const connector = connect(mapStateToProps);

export const ProfileScreen = connector(ClientProfileScreen);
