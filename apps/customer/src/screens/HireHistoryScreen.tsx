import { BackButtom, Loader, Screen, Text } from '../components';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useCallback, useRef } from 'react';
import { colors, images, spacing } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getJobList } from '../slices/job.slice';
import { Bid, Job } from '../slices/types';
import ListEmptyComponent from '../components/ListEmptyComponent';

type Props = AppStackScreenProps<'HireHistory'>;

let page = 1;

const HireHistory: FC<Props> = props => {
  const dispatch = useAppDispatch();
  const flatList = useRef<FlatList<Job>>(null);
  const jobs = useAppSelector(state => state.job.jobList);
  const total = useAppSelector(state => state.job.totalCountJobs);
  const loading = useAppSelector(state => state.job.jobListLoading === 'loading');
  const baseUrl = useAppSelector(state => state.setting.basic?.base_url ?? '');

  const loadHistory = useCallback(
    (nextPage: number) => {
      dispatch(getJobList({page: nextPage, limit: 10, history: true}));
    },
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      page = 1;
      loadHistory(1);
    }, [loadHistory]),
  );

  const refresh = () => {
    page = 1;
    flatList.current?.scrollToOffset({animated: true, offset: 0});
    loadHistory(1);
  };

  const loadMore = () => {
    if (!loading && total > jobs.length) {
      page += 1;
      loadHistory(page);
    }
  };

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom headingTx="hireHistory.heading" />
      <FlatList
        ref={flatList}
        data={jobs}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.content}
        refreshing={loading && page === 1 && jobs.length > 0}
        onRefresh={refresh}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        renderItem={({item}) => (
          <HireHistoryCard
            job={item}
            baseUrl={baseUrl}
            onPress={() =>
              props.navigation.navigate('jobPostDetails', {id: item.id})
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <Loader loading backgroundColor={colors.transparent} />
            ) : (
              <ListEmptyComponent tx="common.noDataFound" />
            )}
          </View>
        }
        ListFooterComponent={
          page > 1 && loading ? (
            <ActivityIndicator color={colors.primary} style={styles.footerLoader} />
          ) : null
        }
      />
    </Screen>
  );
};

const HireHistoryCard = ({
  job,
  baseUrl,
  onPress,
}: {
  job: Job;
  baseUrl: string;
  onPress: () => void;
}) => {
  const hiredBid: Bid | undefined = job.bids?.find(bid => Boolean(bid.is_hired));
  const completed = job.status === 'completed';
  const statusColor = completed ? colors.palette.green : colors.primary;
  const imagePath = hiredBid?.freelancer_image;
  const avatar = imagePath
    ? {uri: `${baseUrl.replace(/\/$/, '')}/${imagePath.replace(/^\//, '')}`}
    : images.user;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.rowBetween}>
        <View style={styles.providerRow}>
          <Image source={avatar} style={styles.avatar} />
          <View style={styles.providerText}>
            <Text
              text={hiredBid?.freelancer_name ?? 'Hired professional'}
              weight="semiBold"
              numberOfLines={1}
            />
            <Text text={job.title} size="xs" style={styles.gray} numberOfLines={1} />
          </View>
        </View>
        <View style={[styles.badge, {backgroundColor: `${statusColor}20`}]}>
          <Text
            text={job.status.toUpperCase()}
            size="xxs"
            style={[styles.badgeText, {color: statusColor}]}
          />
        </View>
      </View>

      <View style={styles.jobMeta}>
        <View>
          <Text text="Agreed amount" size="xs" style={styles.gray} />
          <Text
            text={`AUD ${hiredBid?.bid_amount ?? job.budget}`}
            weight="semiBold"
          />
        </View>
        <Text text={job.address} size="xs" style={styles.address} numberOfLines={2} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.palette.jobPostBackground,
  },
  content: {
    flexGrow: 1,
    padding: spacing.md,
  },
  empty: {
    flex: 1,
  },
  footerLoader: {
    marginVertical: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.palette.white,
  },
  providerRow: {
    flex: 1,
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerText: {
    flex: 1,
  },
  rowBetween: {
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.palette.lightGray,
  },
  gray: {
    color: colors.palette.grayText,
  },
  badge: {
    paddingVertical: spacing.xxs,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    fontWeight: 'bold',
  },
  jobMeta: {
    gap: spacing.md,
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  address: {
    flex: 1,
    maxWidth: '58%',
    textAlign: 'right',
    color: colors.palette.grayText,
  },
});

export const HireHistoryScreen = HireHistory;
