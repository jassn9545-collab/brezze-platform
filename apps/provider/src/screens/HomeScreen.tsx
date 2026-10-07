import {
  Button,
  Loader,
  ReadMore,
  Screen,
  Text,
  TextField,
  TextFieldAccessoryProps,
} from '../components';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Image,
  ListRenderItemInfo,
  Linking,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
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
import ListEmptyComponent from '../components/ListEmptyComponent';
import moment from 'moment';
import { Job } from '../slices/types';
import { Currency } from '../config/defaults';
import { HITSLOP } from '../utils/util';
import { getCurrentLoaction, requestPermission } from '../utils/Location';
import { useFocusEffect } from '@react-navigation/native';

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
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [checkingLocation, setCheckingLocation] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const fetching = props.loading === 'loading';
  const getJobs = props.get;

  const getData = (locationParams = location, pageNumber = page) => {
    if (!locationParams) {
      return;
    }

    props.get({
      page: pageNumber,
      limit: 10,
      latitude: locationParams.latitude,
      longitude: locationParams.longitude,
    });
  };

  const fetchCurrentLocation = () => {
    setCheckingLocation(true);
    getCurrentLoaction(
      position => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        props.setCalledHome(false);
        setLocation(nextLocation);
        setLocationDenied(false);
        setCheckingLocation(false);
        getData(nextLocation, 1);
      },
      () => {
        setLocation(null);
        setLocationDenied(true);
        setCheckingLocation(false);
      },
    );
  };

  const requestLocationAndLoad = async () => {
    page = 1;
    flatlist.current?.scrollToOffset({ animated: true, offset: 0 });

    if (locationDenied) {
      Linking.openSettings();
      return;
    }

    if (Platform.OS === 'android') {
      setCheckingLocation(true);
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
        setLocation(null);
        setLocationDenied(true);
        setCheckingLocation(false);
        return;
      }

      fetchCurrentLocation();
      return;
    }

    requestPermission(fetchCurrentLocation, () => {
      setLocation(null);
      setLocationDenied(true);
      setCheckingLocation(false);
    });

    if (props.isCalled) {
      return;
    }
    setTimeout(() => {
      fetchCurrentLocation();
    }, 500);
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

  const load = () => {
    requestLocationAndLoad();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const refreshJobs = useCallback(() => {
    if (!location) {
      return;
    }

    page = 1;
    getJobs({
      page: 1,
      limit: 10,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  }, [getJobs, location]);

  useFocusEffect(
    useCallback(() => {
      refreshJobs();
    }, [refreshJobs]),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        refreshJobs();
      }
    });

    return () => subscription.remove();
  }, [refreshJobs]);

  const onPressFilter = () => {
    props.navigation.navigate('AdvanceFilter');
  };

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
          onPress={() => props.navigation.navigate('Notification')}
        >
          <Image source={images.notification} />
        </TouchableOpacity>
      </View>
      <Screen preset="fixed" contentContainerStyle={styles.container}>
        {locationDenied ? (
          <View style={styles.locationPrompt}>
            <Text
              tx="home.locationAccessTitle"
              weight="medium"
              size="md"
              style={styles.locationPromptTitle}
            />
            <Text
              tx="home.locationAccessDescription"
              size="xs"
              style={styles.locationPromptDescription}
            />
            <Button
              tx="home.locationAccessButton"
              onPress={requestLocationAndLoad}
              style={styles.locationPromptButton}
              textStyle={styles.locationPromptButtonText}
            />
          </View>
        ) : checkingLocation ? (
          <View style={styles.empty}>
            <Loader loading={true} backgroundColor={colors.transparent} />
          </View>
        ) : (
          <>
            <View style={styles.wrapHeaderSearch}>
              <TextField
                value={search}
                onChangeText={setSearch}
                LeftAccessory={searchLeftAccessory}
                placeholderTextColor={colors.palette.placeholderColor}
                inputWrapperStyle={styles.inputWrapper}
                style={{ color: colors.palette.white }}
                containerStyle={styles.flexOne}
                placeholderTx="home.searchJobs"
              />
              <TouchableOpacity
                style={styles.wrapSearchIcon}
                onPress={onPressFilter}
              >
                <Image
                  source={images.filter}
                  tintColor={colors.palette.white}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              ref={flatlist}
              data={props.data}
              refreshing={fetching && page === 1}
              onRefresh={refreshJobs}
              style={styles.flatlist}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
              keyExtractor={item => item?.id?.toString()}
              onEndReached={loadMore}
              onEndReachedThreshold={0.8}
              renderItem={info => (
                <JobCard
                  {...info}
                  onPressJob={onPressJob}
                  onPressSavedJob={onPressSavedJob}
                />
              )}
              ListEmptyComponent={
                <View style={styles.empty}>
                  {fetching ? (
                    <Loader
                      loading={fetching}
                      backgroundColor={colors.transparent}
                    />
                  ) : (
                    <ListEmptyComponent tx="common.noDataFound" />
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
      </Screen>
    </>
  );
};

type JobCardProps = ListRenderItemInfo<Job> & {
  isSavedIcon?: boolean;
  onPressJob?: (data: Job) => void;
  onPressSavedJob: (data: Job) => void;
};
export const JobCard = ({
  item,
  onPressJob,
  isSavedIcon = true,
  onPressSavedJob,
}: JobCardProps) => {
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
  wrapSearchIcon: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primary,
  },
  inputAccessoryStyle: {
    height: 24,
    marginVertical: spacing.sm + 2,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  flatlist: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  setCalledHome: homeActions.setCalledHome,
  get: (params: Pagination) => getJobList(params),
  addToSavedJob: (params: JobSavedParams) => addToSavedJob(params),
  removeFromSavedJob: (params: JobSavedParams) => removeFromSavedJob(params),
};
const connector = connect(mapState, mapDispatch);
export const HomeScreen = connector(Home);
