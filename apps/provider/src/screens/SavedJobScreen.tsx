import { BackButtom, Loader, Screen } from '../components';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import React, { FC, useEffect, useRef } from 'react';
import { AppStackScreenProps } from '../navigators';
import { colors, spacing } from '../theme';
import { JobCard } from './HomeScreen';
import { RootState } from '../store';
import {
  JobSavedParams,
  mySavedJobs,
  Pagination,
  removeFromSavedJob,
} from '../slices/home.slice';
import { connect, ConnectedProps } from 'react-redux';
import { Job } from '../slices/types';
import ListEmptyComponent from '../components/ListEmptyComponent';

type NavigationProps = AppStackScreenProps<'SavedJob'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

let page = 1;
const SavedJob: FC<Props> = props => {
  const flatlist = useRef<FlatList>(null);
  const fetching = props.loading === 'loading'

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
    props.navigation.navigate('JobDetail', {
      from: 'SavedJob',
      id: data.id,
    });
  };

  const onPressSavedJob = (data: Job) => {
    props.removeFromSavedJob({
      project_id: data.id,
    });
  };

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom
        headingTx="drawer.savedJobs"
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

const mapState = (state: RootState) => ({
  data: state.home.savedJobs,
  loading: state.home.savedJobsLoading,
  totalcount: state.home.savedJobTotalCount,
});

const mapDispatch = {
  get: (params: Pagination) => mySavedJobs(params),
  removeFromSavedJob: (params: JobSavedParams) => removeFromSavedJob(params),
};

const connector = connect(mapState, mapDispatch);

export const SavedJobScreen = connector(SavedJob);
