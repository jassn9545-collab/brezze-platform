import {
  Button,
  ReadMore,
  Screen,
  Text,
  TextField,
  TextFieldAccessoryProps,
} from '../components';
import {
  ActivityIndicator,
  AppState,
  DeviceEventEmitter,
  FlatList,
  Image,
  InteractionManager,
  Keyboard,
  ListRenderItemInfo,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { colors, images, spacing } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBottomTabScreenProps } from '../navigators';
import {
  addToSavedJob,
  getJobList,
  Pagination,
  JobSavedParams,
  removeFromSavedJob,
  homeActions,
} from '../slices/home.slice';
import { RootState } from '../store';
import { connect, ConnectedProps } from 'react-redux';
import moment from 'moment';
import { Job } from '../slices/types';
import { Currency } from '../config/defaults';
import { getStatusStyle, HITSLOP } from '../utils/util';
import {getFreshJobLocation, isFreshJobLocation, JobLocation} from '../utils/jobLocation';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { getNotificationFeed } from '../apis/account';
import { subscribeToUser } from '../utils/realtime';
import { useAppSelector } from '../store/hooks';
import {PUSH_NOTIFICATION_EVENT} from '../utils/Firebase';
import {markFilterOpen} from '../utils/jobSearchTiming';

type NavigationProps = AppBottomTabScreenProps<'Home'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

export const searchLeftAccessory = (props: TextFieldAccessoryProps) => {
  return (
    <View style={[props.style, styles.inputAccessoryStyle]}>
      <Image source={images.search} />
    </View>
  );
};

let page = 1;
const Home: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  const flatlist = useRef<FlatList>(null);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const searchRef = useRef(submittedSearch);
  searchRef.current = submittedSearch;
  const [location, setLocation] = useState<JobLocation | null>(null);
  const [checkingLocation, setCheckingLocation] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const locationRequestInFlight = useRef(false);
  const isFocused = useIsFocused();
  const navigation = props.navigation;
  useEffect(() => {
    if (!isFocused) return;
    // Mount the filter controls offscreen while Home is idle. This performs no
    // API/GPS work because the preloaded screen is not focused.
    const task = InteractionManager.runAfterInteractions(() => navigation.preload('AdvanceFilter'));
    return () => task.cancel();
  }, [isFocused, navigation]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const ownUserId = useAppSelector(state => state.auth.myProfile?.user?.id);
  const jobFilters = useAppSelector(state => state.home.jobFilters);
  const fetching = props.loading === 'loading';
  const getJobs = props.get;
  const clearJobSearchLocation = props.clearJobSearchLocation;
  const filtersRef = useRef(jobFilters);
  filtersRef.current = jobFilters;

  const refreshJobs = useCallback(async (force = false) => {
    if (locationRequestInFlight.current) return;
    locationRequestInFlight.current = true;
    page = 1;
    setCheckingLocation(true);
    setLocation(null);
    setLocationError(null);
    setLocationDenied(false);
    clearJobSearchLocation();
    try {
      if (Platform.OS === 'android') {
        const permission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
          setLocationDenied(true);
          return;
        }
      }
      const locationStartedAt = Date.now();
      const nextLocation = await getFreshJobLocation(force);
      console.info(`[job-search] location_ms=${Date.now() - locationStartedAt}`);
      setLocation(nextLocation);
      getJobs({page: 1, limit: 10, latitude: nextLocation.latitude,
        longitude: nextLocation.longitude, search: searchRef.current.trim() || undefined,
        filters: filtersRef.current, forceRefresh: force});
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Could not refresh your current location. Please try again.');
    } finally {
      locationRequestInFlight.current = false;
      setCheckingLocation(false);
    }
  }, [getJobs, clearJobSearchLocation]);

  const getData = (
    locationParams = location,
    pageNumber = page,
    searchTerm = submittedSearch,
  ) => {
    if (!locationParams || (pageNumber === 1 && !isFreshJobLocation(locationParams))) {
      refreshJobs();
      return;
    }
    getJobs({page: pageNumber, limit: 10, latitude: locationParams.latitude,
      longitude: locationParams.longitude, search: searchTerm.trim() || undefined, filters: jobFilters});
  };

  const loadMore = () => {
    if (!location || checkingLocation) {
      return;
    }

    if (!fetching && props.totalcount > props.data.length) {
      page++;
      getData();
    }
  };

  useFocusEffect(
    useCallback(() => {
      refreshJobs();
    }, [refreshJobs]),
  );

  useFocusEffect(
    useCallback(() => {
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
    }, [ownUserId]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && isFocused) {
        refreshJobs();
      }
    });

    return () => subscription.remove();
  }, [refreshJobs, isFocused]);

  const onPressSearch = () => {
    setSubmittedSearch(search.trim());
    searchRef.current = search.trim();
    Keyboard.dismiss();
    page = 1;
    flatlist.current?.scrollToOffset({ animated: false, offset: 0 });
    getData(location, 1, search);
  };

  const filteredJobs = useMemo(() => {
    const terms = submittedSearch
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    if (terms.length === 0) {
      return props.data;
    }

    return props.data.filter(job => {
      const searchableText = [
        job.title,
        job.category,
        job.description,
        job.address,
        job.city,
        job.country,
      ]
        .filter(value => typeof value === 'string')
        .join(' ')
        .toLocaleLowerCase();
      const searchableWords = searchableText.split(/[^\p{L}\p{N}]+/u);

      return terms.every(term =>
        searchableWords.some(word => word.startsWith(term)),
      );
    });
  }, [props.data, submittedSearch]);

  const onPressJob = (data: Job) => {
    props.navigation.navigate('JobDetail', {
      from: 'Home',
      id: data.id,
    });
  };

  const onPressSavedJob = (data: Job) => {
    if (data.saved) {
      props.removeFromSavedJob({
        project_id: data.id,
      });
    } else {
      props.addToSavedJob({
        project_id: data.id,
      });
    }
  };

  return (
    <>
      <View style={[styles.wrapHeader, { marginTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => props.navigation.openDrawer()}>
          <Image source={images.menuIcon} />
        </TouchableOpacity>
        <Text weight="medium" size="lg" tx="home.jobs" />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
          onPress={() => props.navigation.navigate('Notification')}
          style={styles.notificationButton}
        >
          <Image source={images.notification} />
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
      <Screen preset="fixed" contentContainerStyle={styles.container}>
            <View style={styles.wrapHeaderSearch}>
              <TextField
                value={search}
                onChangeText={setSearch}
                LeftAccessory={searchLeftAccessory}
                placeholderTextColor={colors.palette.placeholderColor}
                inputWrapperStyle={styles.inputWrapper}
                style={styles.searchInput}
                containerStyle={styles.flexOne}
                placeholderTx="home.searchJobs"
                returnKeyType="search"
                onSubmitEditing={Keyboard.dismiss}
              />
              <TouchableOpacity
                style={styles.wrapSearchIcon}
                accessibilityRole="button"
                accessibilityLabel="Search jobs"
                onPress={onPressSearch}
              >
                <View style={styles.searchButtonIcon} pointerEvents="none" accessible={false}>
                  <View style={styles.searchIconCircle} />
                  <View style={styles.searchIconHandle} />
                </View>
              </TouchableOpacity>
            </View>

        {locationDenied || locationError ? (
          <View style={styles.locationPrompt}>
            <Text
              tx={locationDenied ? 'home.locationAccessTitle' : undefined}
              text={locationDenied ? undefined : 'Current location unavailable'}
              weight="medium"
              size="md"
              style={styles.locationPromptTitle}
            />
            <Text
              tx={locationDenied ? 'home.locationAccessDescription' : undefined}
              text={locationError || undefined}
              size="xs"
              style={styles.locationPromptDescription}
            />
            <Button
              tx={locationDenied ? 'home.locationAccessButton' : undefined}
              text={locationDenied ? undefined : 'Try again'}
              onPress={() => locationDenied ? Linking.openSettings() : refreshJobs(true)}
              style={styles.locationPromptButton}
              textStyle={styles.locationPromptButtonText}
            />
          </View>
        ) : (
          <>
            <FlatList
              ref={flatlist}
              data={filteredJobs}
              refreshing={fetching && page === 1}
              onRefresh={() => refreshJobs(true)}
              style={styles.flatlist}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              keyExtractor={item => item?.id?.toString()}
              onEndReached={loadMore}
              onEndReachedThreshold={0.8}
              renderItem={info => (
                <JobCard
                  {...info}
                  hideActiveStatus
                  onPressJob={onPressJob}
                  onPressSavedJob={onPressSavedJob}
                />
              )}
              ListEmptyComponent={
                <View style={styles.empty}>
                  {checkingLocation ? (
                    <View accessibilityRole="progressbar" accessibilityLabel="Finding nearby jobs"
                      style={styles.jobsLoading}>
                      <ActivityIndicator size="small" color={colors.primary} />
                      <Text text="Finding nearby jobs…" size="xs" style={styles.locationPromptDescription} />
                      <Text text="You can browse while your location updates." size="xs"
                        style={styles.locationPromptDescription} />
                    </View>
                  ) : fetching ? (
                    <View accessibilityRole="progressbar" accessibilityLabel="Loading jobs"
                      style={styles.jobsLoading}>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <Text text="Loading jobs…" size="xs" style={styles.locationPromptDescription} />
                    </View>
                  ) : (
                    <View style={styles.locationPrompt}>
                      <Text
                        text={props.loading === 'failed'
                          ? 'Jobs could not be loaded. Please try again.'
                          : `No jobs found within ${jobFilters.radiusKm} km. Try a larger radius or reset your filters.`}
                        size="xs"
                        style={styles.locationPromptDescription}
                      />
                      {props.loading === 'failed' ? (
                        <Button text="Try again" onPress={() => refreshJobs(true)} />
                      ) : null}
                    </View>
                  )}
                </View>
              }
              ListFooterComponent={
                <View style={styles.extaFetch}>
                  {page !== 1 && fetching ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : null}
                </View>
              }
            />

          </>
        )}
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open job filters"
              activeOpacity={0.85}
              onPress={() => {markFilterOpen(); props.navigation.navigate('AdvanceFilter');}}
              style={styles.filterButton}
            >
              <View style={styles.filterButtonInner} pointerEvents="none">
                <View style={styles.filterButtonIcon} accessible={false}>
                  {[12, 3, 9].map(top => (
                    <View key={top} style={styles.filterSliderTrack}>
                      <View style={[styles.filterSliderThumb, {top}]} />
                    </View>
                  ))}
                </View>
              </View>
            </TouchableOpacity>
      </Screen>
    </>
  );
};

type JobCardProps = ListRenderItemInfo<Job> & {
  isSavedIcon?: boolean;
  isApplied?: boolean;
  hideActiveStatus?: boolean;
  onPressJob?: (data: Job) => void;
  onPressSavedJob: (data: Job) => void;
};
export const JobCard = ({
  item,
  onPressJob,
  isSavedIcon = true,
  isApplied = item.job_applied,
  hideActiveStatus = false,
  onPressSavedJob,
}: JobCardProps) => {
  const jobStatus = item.status?.trim() || 'active';
  const statusText = isApplied && jobStatus === 'active' ? 'applied' : jobStatus;
  const statusStyle = getStatusStyle(statusText);

  return (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.9}
      style={styles.card}
      onPress={() => onPressJob?.(item)}
    >
      <View style={styles.spaceBetween}>
        <Text
          size="xxs"
          weight="medium"
          style={styles.flexOne}
          tx="home.posted"
          txOptions={{
            value: moment(item.created_at).fromNow(),
          }}
        />
        {!(hideActiveStatus && statusText.toLowerCase() === 'active') && (
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: statusStyle.backgroundColor},
            ]}>
            <Text
              text={statusText.toUpperCase()}
              size="xxs"
              weight="semiBold"
              style={{color: statusStyle.color}}
            />
          </View>
        )}
        {isSavedIcon && (
          <TouchableOpacity
            hitSlop={HITSLOP.MEDIUM}
            onPress={() => onPressSavedJob(item)}
          >
            <Image
              source={
                item.saved ?? true ? images.savedIcon : images.unsavedIcon
              }
            />
          </TouchableOpacity>
        )}
      </View>

      <Text size="sm" weight="medium" text={item.title} />
      <ReadMore text={item.description} style={styles.extraSmallText} />

      <Text
        size="xxs"
        weight="medium"
        tx="home.fixedPrice"
        txOptions={{
          value: Currency.code + ' ' + item.budget,
        }}
      />

      {/* <View style={styles.jobPoints}>
        {jobQuickPoints?.map((data, index) => (
          <View key={index} style={styles.jobQuickPoint}>
            <Text size="xxs" weight="medium" text={data} />
          </View>
        ))}
      </View> */}

      <View style={styles.spaceBetween}>
        <Text
          size="xxs"
          weight="medium"
          style={styles.flexOne}
          text={item.address}
        />
        {/* <Text size="xxs" weight="medium" text="30+ Job Apply" /> */}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  wrapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
    marginHorizontal: spacing.md,
    justifyContent: 'space-between',
  },
  notificationButton: {
    position: 'relative',
    padding: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -8,
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
  wrapHeaderSearch: {
    gap: spacing.xs,
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
  },
  flexOne: { flex: 1 },
  inputWrapper: {
    borderWidth: 0,
    borderRadius: spacing.xs,
    backgroundColor: colors.palette.offWhite2,
  },
  searchInput: {
    color: colors.palette.black,
  },
  wrapSearchIcon: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary,
  },
  searchButtonIcon: {
    width: 22,
    height: 22,
  },
  searchIconCircle: {
    position: 'absolute',
    left: 1,
    top: 1,
    width: 15,
    height: 15,
    borderWidth: 2,
    borderRadius: 8,
    borderColor: colors.palette.white,
  },
  searchIconHandle: {
    position: 'absolute',
    left: 13,
    top: 16,
    width: 9,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.palette.white,
    transform: [{rotate: '45deg'}],
  },
  inputAccessoryStyle: {
    height: 24,
    marginVertical: spacing.sm + 2,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: spacing.md,
    paddingBottom: 96,
  },
  filterButton: {
    position: 'absolute',
    right: spacing.lg - spacing.xxs,
    bottom: spacing.md,
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2,
    borderWidth: 2,
    borderColor: colors.primaryDimmed,
    backgroundColor: colors.palette.white,
    shadowColor: colors.palette.black,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 6,
  },
  filterButtonInner: {
    flex: 1,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  filterButtonIcon: {
    width: 24,
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 3,
  },
  filterSliderTrack: {
    width: 2,
    height: 20,
    borderRadius: 1,
    backgroundColor: colors.palette.white,
  },
  filterSliderThumb: {
    position: 'absolute',
    left: -2.5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 2,
    borderColor: colors.palette.white,
    backgroundColor: colors.primary,
  },
  flatlist: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
  },
  jobsLoading: {alignItems: 'center', paddingHorizontal: spacing.lg, gap: spacing.sm},
  locationPrompt: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.palette.offWhite2,
  },
  locationPromptTitle: {
    color: colors.palette.black,
  },
  locationPromptDescription: {
    marginTop: spacing.xxs,
    color: colors.textDim,
  },
  locationPromptButton: {
    minHeight: 48,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
  },
  locationPromptButtonText: {
    fontSize: 16,
    lineHeight: 22,
  },
  extaFetch: {
    height: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    gap: spacing.xs,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: spacing.sm,
    marginHorizontal: spacing.md,
    backgroundColor: colors.palette.offWhite2,
  },
  spaceBetween: {
    gap: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxxs,
  },
  extraSmallText: {
    fontSize: spacing.xs + 2,
    lineHeight: spacing.sm + 2,
  },
  jobPoints: {
    flex: 1,
    gap: spacing.xs,
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: spacing.xxs,
    marginBottom: spacing.xxxs,
  },
  jobQuickPoint: {
    alignSelf: 'flex-start',
    borderRadius: spacing.xs,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.palette.white,
  },
});

const mapState = (state: RootState) => ({
  data: state.home.jobList,
  loading: state.home.jobListLoading,
  totalcount: state.home.totalCountJobs,
  isCalled: state.home.isCalled,
});

const mapDispatch = {
  clearJobSearchLocation: homeActions.clearJobSearchLocation,
  setCalledHome: homeActions.setCalledHome,
  get: (params: Pagination) => getJobList(params),
  addToSavedJob: (params: JobSavedParams) => addToSavedJob(params),
  removeFromSavedJob: (params: JobSavedParams) => removeFromSavedJob(params),
};
const connector = connect(mapState, mapDispatch);
export const HomeScreen = connector(Home);
