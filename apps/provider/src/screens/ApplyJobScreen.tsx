import { BackButtom, Screen } from '../components';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import React, { FC, useEffect, useRef } from 'react';
import { AppStackScreenProps } from '../navigators';
import { colors, spacing } from '../theme';
import { JobCard } from './HomeScreen';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { addToSavedJob, getApplyJobs, JobSavedParams, removeFromSavedJob } from '../slices/home.slice';
import ListEmptyComponent from '../components/ListEmptyComponent';
import { Job } from '../slices/types';

type NavigationProps = AppStackScreenProps<'ApplyJob'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

let page = 1
const ApplyJob: FC<Props> = props => {
  const flatlist = useRef<FlatList>(null);
  const fetching = props.loading === 'loading'

  const loadMore = () => {
    if (!fetching && props.totalcount > props.data.length && (props.data.length ?? 0) > 0) {
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


  const onPressJob = (job: Job) => {
    props.navigation.navigate('JobDetail', {
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
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom
        headingTx="drawer.applyJobs"
        style={{
          marginHorizontal: spacing.md,
        }}
      />
      <FlatList
        ref={flatlist}
        data={props.data}
        style={styles.flatlist}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item?.id?.toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.8}
        renderItem={info => (
          <JobCard
            {...info}
            isSavedIcon={false}
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
            {page !== 1 && fetching ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : null}
          </View>
        }
      />
    </Screen>
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

export const ApplyJobScreen = connector(ApplyJob);
