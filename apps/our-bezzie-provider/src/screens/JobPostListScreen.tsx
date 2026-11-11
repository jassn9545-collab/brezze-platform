import { BackButtom, Loader, Screen, Text } from '../components';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
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
import FastImage from '@d11/react-native-fast-image';

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

  const onPressJob = (data: Job) => {
    props.navigation.navigate('jobPostDetails', {
      id: data.id,
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
          <SingleJob
            item={item}
            baseURl={props.baseURl}
            index={index}
            onPress={onPressJob}
          />
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

export const SingleJob = ({
  item,
  index,
  baseURl,
  onPress,
}: {
  item: Job;
  index: number;
  baseURl: string;
  onPress: (data: Job) => void;
}) => {
  const statusStyle = getStatusStyle(item.status);
  return (
    <TouchableOpacity
      key={index}
      style={styles.card}
      onPress={() => onPress(item)}
    >
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

      {(item?.bids?.length ?? 0) > 0 && (
        <View style={styles.bottomRow}>
          <View style={styles.imageWrapper}>
            {item.bids.slice(0, 3).map((data, indx) => (
              <View
                key={data.id}
                style={[
                  styles.avatarWrapper,
                  indx !== 0 && styles.avatarOverlap,
                ]}
              >
                <FastImage
                  source={{ uri: baseURl + '/' + data.freelancer_image }}
                  style={styles.avatar}
                />
              </View>
            ))}

            {(item?.bids?.length ?? 0) > 3 && (
              <View
                style={[
                  styles.avatarWrapper,
                  styles.avatarOverlap,
                  styles.moreCircle,
                ]}
              >
                <Text
                  size="xxs"
                  weight="semiBold"
                  text={'+' + ((item?.bids?.length ?? 0) - 3)}
                  style={{ color: colors.palette.white }}
                />
              </View>
            )}
          </View>

          {item.status === 'active' && (
            <View>
              <Text tx="jobPostList.proposals" style={styles.extraSmallText} />
              <Text
                size="xxs"
                weight="bold"
                tx="jobPostList.recevied"
                style={{ color: colors.primary }}
                txOptions={{
                  value: item?.bids?.length ?? 0,
                }}
              />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export const getStatusStyle = (type: string) => {
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
    case 'completed':
      return {
        backgroundColor: colors.palette.offGreen,
        color: colors.palette.green,
      };
      case 'in progress':
        return {
          backgroundColor: colors.palette.yellowLight,
          color: colors.palette.yellow,
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    justifyContent: 'space-between',
  },
  extraSmallText: {
    fontSize: spacing.xs + 2,
    lineHeight: spacing.sm + 2,
    color: colors.palette.grayLight,
  },
  imageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    zIndex: 1,
  },
  avatarOverlap: {
    marginLeft: -10,
  },
  avatar: {
    width: spacing.lg,
    height: spacing.lg,
    borderRadius: spacing.sm,
  },
  moreCircle: {
    width: spacing.lg,
    height: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
  },
  moreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

const mapState = (state: RootState) => ({
  data: state.job.jobList,
  loading: state.job.jobListLoading,
  totalcount: state.job.totalCountJobs,
  baseURl: state.setting.basic?.base_url ?? '',
});

const mapDispatch = {
  get: (params: JobListParams) => getJobList(params),
};
const connector = connect(mapState, mapDispatch);

export const jobPostListScreen = connector(JobPostList);
