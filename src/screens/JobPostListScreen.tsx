import { BackButtom, Loader, Screen, Text } from '../components';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import React, { FC, useEffect, useRef } from 'react';
import { spacing, colors, images } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';
import { connect, ConnectedProps } from 'react-redux';
import ListEmptyComponent from '../components/ListEmptyComponent';
import { RootState } from '../store';
import { getJobList, JobListParams } from '../slices/job.slice';
import { Job } from '../slices/types';
import moment from 'moment';

type NavigationProps = AppStackScreenProps<'JobPostList'>;
type Props = NavigationProps & ConnectedProps<typeof connector>;

let page = 1;
const JobPostList: FC<Props> = props => {
  const flatlist = useRef<FlatList>(null);
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

  const getData = () => {
    props.get({
      page: page,
      limit: 10,
    });
  };

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom headingTx={'jobPostList.heading'} />

      <FlatList
        ref={flatlist}
        data={props.data}
        keyExtractor={item => item?.id?.toString()}
        refreshing={fetching && page === 1 && props.data.length > 0}
        onEndReached={loadMore}
        onRefresh={load}
        onEndReachedThreshold={0.2}
        contentContainerStyle={styles.contentContainer}
        renderItem={({ item, index }) => (
          <SingleJob item={item} index={index} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            {fetching ? (
              <Loader loading={fetching} backgroundColor={colors.transparent} />
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
  );
};

export const SingleJob = ({ item, index }: { item: Job; index: number }) => {
  const statusStyle = getStatusStyle(item.status);
  return (
    <View key={index} style={styles.card}>
      <View style={styles.topRow}>
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
        <Text
          size="xxs"
          style={styles.grayText}
          tx="jobPostList.posted"
          txOptions={{
            value: moment(item.created_at).fromNow(),
          }}
        />
      </View>
      <Text text={item.title} weight="semiBold" size="sm" />
      <View style={styles.address}>
        <Image
          source={images.locationPin}
          style={styles.addressIcon}
          resizeMode="contain"
        />
        <Text text={item.address} size="xxs" />
      </View>

      {/* <View style={styles.bottomRow}>
        <View style={styles.avatarRow}>
          <Image source={images.profile1} style={styles.avatar} />
          <Image source={images.profile2} style={styles.avatar} />
          <View style={styles.plusAvatar}>
            <Text
              text="+12"
              size="xxs"
              style={{ color: colors.palette.white }}
            />
          </View>
        </View>
        <View style={styles.alignRight}>
          <Text
            tx="jobPostList.proposals"
            size="xxs"
            style={styles.proposalLabel}
          />
          <Text
            text={item.proposals}
            weight="semiBold"
            style={[
              styles.proposalText,
              item.type === 'draft' && styles.proposalDraftText,
            ]}
          />
        </View>
      </View> */}

      {/* <TouchableOpacity style={styles.draftBtn}>
        <Text
          tx="jobPostList.completeButton"
          style={styles.draftBtnText}
        />
      </TouchableOpacity> */}
    </View>
  );
};

const getStatusStyle = (type: string) => {
  switch (type) {
    case 'active':
      return {
        backgroundColor: colors.palette.primarylight,
        color: colors.primary,
      };
    case 'inactive':
      return {
        backgroundColor: colors.palette.centerColor,
        color: colors.error,
      };
    default:
      return {
        backgroundColor: colors.palette.lightGray,
        color: colors.palette.black,
      };
  }
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl + spacing.lg,
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
    gap: spacing.xxs,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    backgroundColor: colors.palette.offWhite2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingVertical: spacing.xxs,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  grayText: {
    flex: 1,
    textAlign: 'right',
    color: colors.palette.grayText,
  },
  address: {
    gap: spacing.xs,
    flexDirection: 'row',
    marginEnd: spacing.xl,
  },
  addressIcon: {
    width: spacing.xs,
    height: spacing.sm,
    marginTop: spacing.xxs,
  },

  // bottomRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   marginTop: spacing.md,
  // },
  // avatarRow: {
  //   flexDirection: 'row',
  // },
  // avatar: {
  //   width: 30,
  //   height: 30,
  //   borderRadius: 15,
  //   marginRight: -8,
  // },
  // plusAvatar: {
  //   width: 30,
  //   height: 30,
  //   borderRadius: 15,
  //   backgroundColor: colors.palette.primaryBlue,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   marginLeft: 4,
  // },
});

const mapState = (state: RootState) => ({
  data: state.job.jobList,
  loading: state.job.jobListLoading,
  totalcount: state.job.totalCountJobs,
});

const mapDispatch = {
  get: (params: JobListParams) => getJobList(params),
};
const connector = connect(mapState, mapDispatch);

export const jobPostListScreen = connector(JobPostList);
