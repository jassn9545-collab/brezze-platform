import { BackButtom, Screen } from '../components';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import React, { FC, useCallback, useRef } from 'react';
import { AppStackParamList } from '../navigators';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import { colors, spacing } from '../theme';
import { JobCard } from './HomeScreen';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { addToSavedJob, getApplyJobs, JobSavedParams, removeFromSavedJob } from '../slices/home.slice';
import ListEmptyComponent from '../components/ListEmptyComponent';
import { Job } from '../slices/types';

type StoreProps = ConnectedProps<typeof connector>;
type Props = StoreProps;

const ApplyJob: FC<Props> = props => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const page = useRef(1);
  const flatlist = useRef<FlatList>(null);
  const fetching = props.loading === 'loading';
  const {get} = props;

  const getData = useCallback((pageNumber: number) => {
    get({page: pageNumber, limit: 10});
  }, [get]);

  const load = useCallback(() => {
    flatlist.current?.scrollToOffset({animated: true, offset: 0});
    page.current = 1;
    getData(1);
  }, [getData]);

  useFocusEffect(load);

  const loadMore = () => {
    if (!fetching && props.totalcount > props.data.length && (props.data.length ?? 0) > 0) {
      page.current++;
      getData(page.current);
    }
  };

  const onPressJob = (job: Job) => {
    navigation.navigate('JobDetail', {
      from: 'ApplyJob',
      id: job.id,
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
      <FlatList
        ref={flatlist}
        data={props.data}
        style={styles.flatlist}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item?.id?.toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.8}
        refreshing={fetching && page.current === 1}
        onRefresh={load}
        renderItem={info => (
          <JobCard
            {...info}
            isSavedIcon={false}
            isApplied
            onPressJob={onPressJob}
            onPressSavedJob={onPressSavedJob}
          />
        )} ListEmptyComponent={
          <View style={styles.empty}>
            <ListEmptyComponent tx="common.noDataFound" />
          </View>
        }
        ListFooterComponent={
          <View style={styles.extaFetch}>
            {page.current !== 1 && fetching ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : null}
          </View>
        }
      />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
});

const mapStateToProps = (state: RootState) => ({
  data: state.home.applyJobs,
  totalcount: state.home.applyJobTotalCount,
  loading: state.home.applyJobsLoading,
});

const mapDispatch = {
  get: getApplyJobs,
  addToSavedJob: (params: JobSavedParams) => addToSavedJob(params),
  removeFromSavedJob: (params: JobSavedParams) => removeFromSavedJob(params),
};

const connector = connect(mapStateToProps, mapDispatch);

export const AppliedJobsList = connector(ApplyJob);

export const ApplyJobScreen = () => (
  <Screen
    preset="fixed"
    safeAreaEdges={['top']}
    contentContainerStyle={styles.container}
  >
    <BackButtom headingTx="drawer.applyJobs" style={{marginHorizontal: spacing.md}} />
    <AppliedJobsList />
  </Screen>
);
