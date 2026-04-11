import {
  Loader,
  Screen,
  Text,
  TextField,
  TextFieldAccessoryProps,
} from '../components';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useEffect, useRef, useState } from 'react';
import { colors, images, spacing } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppBottomTabScreenProps } from '../navigators';
import { getJobList, JobListParams } from '../slices/home.slice';
import { RootState } from '../store';
import { connect, ConnectedProps } from 'react-redux';
import ListEmptyComponent from '../components/ListEmptyComponent';

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

const jobQuickPoints = ['Contract Job', 'Experience', 'Payment Verified'];

let page = 1;
const Home: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  const flatlist = useRef<FlatList>(null);
  const [search, setSearch] = useState('');
  const fetching = props.loading === 'loading';

  const loadMore = () => {
    if (!fetching && props.totalcount > props.data.length) {
      page++;
      getData();
    }
  };

  const load = () => {
    flatlist.current?.scrollToOffset({ animated: true, offset: 0 });
    page = 1;
    getData();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, []);

  const onPressFilter = () => {
    props.navigation.navigate('AdvanceFilter');
  };

  const onPressJob = () => {
    props.navigation.navigate('JobDetail', {
      from: 'Home',
    });
  };
  const getData = () => {
    props.get({
      page: page,
      limit: 10,
    });
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
            <Image source={images.filter} tintColor={colors.palette.white} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={flatlist}
          data={props.data}
          style={styles.flatlist}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item?.id?.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.8}
          renderItem={info => <JobCard {...info} onPressJob={onPressJob} />}
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
      </Screen>
    </>
  );
};

type JobCardProps = ListRenderItemInfo<any> & {
  onPressJob?: () => void;
};
export const JobCard = ({ item, onPressJob }: JobCardProps) => {
  return (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.9}
      style={styles.card}
      onPress={onPressJob}
    >
      <View style={styles.spaceBetween}>
        <Text
          size="xxs"
          weight="medium"
          style={styles.flexOne}
          text="Posted 10 minutes ago"
        />
        <Image source={images.unsavedIcon} />
      </View>

      <Text
        size="sm"
        weight="medium"
        text="Electrician Need for House Pipe Fitting"
      />
      <Text>
        <Text
          style={[styles.extraSmallText, { color: colors.textDim }]}
          text="By clicking on Accept and Proceed, you consent to provide us with the requested data. By clicking on Accept and Proceed, you consent to provide us with the Accept and Proceed, requested data"
        />
        <Text style={styles.extraSmallText} weight="medium" tx="home.more" />
      </Text>

      <Text
        size="xxs"
        weight="medium"
        text="Fixed Price - Est Budget AUD 500"
      />

      <View style={styles.jobPoints}>
        {jobQuickPoints?.map((data, index) => (
          <View key={index} style={styles.jobQuickPoint}>
            <Text size="xxs" weight="medium" text={data} />
          </View>
        ))}
      </View>

      <View style={styles.spaceBetween}>
        <Text
          size="xxs"
          weight="medium"
          style={styles.flexOne}
          text="42 Hebbard Street, Victoria"
        />
        <Text size="xxs" weight="medium" text="30+ Job Apply" />
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
});

const mapDispatch = {
  get: (params: JobListParams) => getJobList(params),
};
const connector = connect(mapState, mapDispatch);
export const HomeScreen = connector(Home);
