import { ActivityIndicator, FlatList, View, ViewStyle } from 'react-native';
import React, { FC, useCallback, useRef } from 'react';
import { BookingScreenProps } from '../navigators';
import { TripCell } from './ActiveJobScreen';
import { colors, spacing } from '../theme';
import { RootState } from '../store';
import { getCompleteJobs, Pagination } from '../slices/home.slice';
import { connect, ConnectedProps } from 'react-redux';
import { Loader } from '../components';
import ListEmptyComponent from '../components/ListEmptyComponent';
import { useFocusEffect } from '@react-navigation/native';
import { useAppSelector } from '../store/hooks';
import { subscribeToUser } from '../utils/realtime';

type ScreenProps = BookingScreenProps<'CompleteJob'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = ScreenProps & StoreProps;

let page = 1;
const CompleteJob: FC<Props> = (props) => {
  const flatlist = useRef<FlatList>(null);
  const ownUserId = useAppSelector(state => state.auth.myProfile?.user?.id);
  const { get } = props;

  const getData = useCallback(() => {
    get({
      page: page,
      limit: 10,
    });
  }, [get]);

  const load = useCallback(() => {
    flatlist.current?.scrollToOffset({ animated: true, offset: 0 });
    page = 1;
    getData();
  }, [getData]);

  const loadMore = () => {
    if (props.totalPage > page && !loading && (props.completeJobs.length ?? 0) > 0) {
      page++;
      getData();
    }
  };

  useFocusEffect(useCallback(() => {
    load();
    return ownUserId
      ? subscribeToUser(Number(ownUserId), () => undefined, event => {
          if (event.kind === 'job_completed') load();
        })
      : undefined;
  }, [load, ownUserId]));

  const loading = props.fetching === 'loading';
  return (
    <FlatList
      ref={flatlist}
      data={props.completeJobs}
      contentContainerStyle={$container}
      keyExtractor={item => item.id.toString()}
      onEndReached={loadMore}
      refreshing={loading && page === 1 && props.completeJobs.length > 0}
      onRefresh={load}
      onEndReachedThreshold={0.8}
      renderItem={({ item, index }) => (
        <TripCell
          item={item}
          index={index}
          baseURl={props.baseURl!}
          viewDetail={() =>
            props.navigation.navigate('JobDetail', {
              from: 'CompleteJob',
              id: item.id,
            })
          }
          onReview={() =>
            props.navigation.navigate('ReviewScreen', { jobId: item.id })
          }
        />
      )}
      ListEmptyComponent={
        <View style={$empty}>
          {loading ? (
            <Loader loading={loading} backgroundColor={colors.transparent} />
          ) : (
            <ListEmptyComponent tx="common.noDataFound" />
          )}
        </View>
      }
      ListFooterComponent={
        <View style={$extaFetch}>
          {page !== 1 && loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : null}
        </View>
      }
    />
  );
};

// const TripCell = ({ onPress }: { item: any; onPress?: () => void }) => {
//   return (
//     <TouchableOpacity onPress={onPress} style={$cellStyle}></TouchableOpacity>
//   );
// };

const $container: ViewStyle = {
  flexGrow: 1,
  paddingBottom: spacing.xl,
};

// const $cellStyle: ViewStyle = {
//   marginHorizontal: spacing.md,
//   marginTop: spacing.sm,
//   backgroundColor: colors.palette.white,
//   shadowColor: colors.palette.light,
//   shadowOffset: {
//     width: 0,
//     height: 1,
//   },
//   shadowOpacity: 0.22,
//   shadowRadius: 2.22,

//   elevation: 3,
//   borderRadius: 6,
// };

const $empty: ViewStyle = {
  flex: 1,
};

const $extaFetch: ViewStyle = {
  height: spacing.xxl,
  justifyContent: 'center',
  alignItems: 'center',
};

const mapStateToProps = (state: RootState) => ({
  fetching: state.home.completeJobsLoading,
  completeJobs: state.home.completeJobs,
  totalPage: state.home.totalCompletePage,
  baseURl: state.setting.basic?.base_url
});

const mapDispatch = {
  get: (params: Pagination) => getCompleteJobs(params),
};

const connector = connect(mapStateToProps, mapDispatch);

export const CompleteJobScreen = connector(CompleteJob);
