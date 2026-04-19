import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { FC, useCallback, useRef } from 'react';
import { colors, images, spacing } from '../theme';
import { BookingScreenProps } from '../navigators';
import { Loader, Text } from '../components';
import { Currency } from '../config/defaults';
import { RootState } from '../store';
import { connect, ConnectedProps } from 'react-redux';
import { getActiveJob, Pagination } from '../slices/home.slice';
import { useFocusEffect } from '@react-navigation/native';
import ListEmptyComponent from '../components/ListEmptyComponent';
import { Job } from '../slices/types';

type ScreenProps = BookingScreenProps<'ActiveJob'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = ScreenProps & StoreProps;

let page = 1;
const ActiveJob: FC<Props> = props => {
  const flatlist = useRef<FlatList>(null);

  const loadMore = () => {
    if (props.totalPage > page && !loading && (props.activeJobs.length ?? 0) > 0) {
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
  useFocusEffect(useCallback(load, []));

  const getData = () => {
    props.get({
      page: page,
      limit: 10,
    });
  };

  const loading = props.fetching === 'loading';
  return (
    <FlatList
      ref={flatlist}
      data={props.activeJobs}
      contentContainerStyle={$container}
      keyExtractor={item => item._id}
      onEndReached={loadMore}
      refreshing={loading && page === 1 && props.activeJobs.length > 0}
      onRefresh={load}
      onEndReachedThreshold={0.8}
      renderItem={({ item, index }: { item: any; index: number }) => (
        <TripCell
          item={item}
          index={index}
          viewDetail={() =>
            props.navigation.navigate('JobDetail', {
              from: 'ActiveJob',
              id: item._id!,
            })
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

type TripCellProps = {
  item: Job;
  index: number;
  viewDetail?: () => void;
  cancelAction?: () => void;
};

export const TripCell: FC<TripCellProps> = ({ index, viewDetail }) => {
  return (
    <View key={index} style={$cellStyle}>
      <View style={$spaceBetween}>
        <View style={$status}>
          <Text
            size="xxs"
            weight="medium"
            style={$shrinkPrimaryText}
            text="In progress"
          />
        </View>
        <Text
          size="xxs"
          weight="medium"
          text="Started Oct 12 "
          style={$shrinkDimText}
        />
      </View>
      <Text
        size="sm"
        weight="medium"
        text="Electrician Need for House Pipe Fitting"
      />
      <View style={$rowWrapper}>
        <Image
          resizeMode="cover"
          style={$userImage}
          source={{ uri: 'https://i.pravatar.cc/300' }}
        />
        <Text
          size="xs"
          weight="medium"
          text="Robert Johnson"
          style={$shrinkText}
        />
        <View style={$smallBox}>
          <Text
            size="xxs"
            weight="medium"
            style={{ color: colors.primary }}
            text="Client"
          />
        </View>
      </View>
      <View style={$rowWrapper}>
        <View style={$smallBox}>
          <Text
            size="xxs"
            weight="medium"
            style={{ color: colors.primary }}
            text="Budget"
          />
        </View>
        <Text
          size="xs"
          weight="semiBold"
          style={$shrinkPrimaryText}
          text={Currency.code + ' ' + Currency.sign + 200}
        />

        <TouchableOpacity onPress={viewDetail} style={$button}>
          <Text
            size="xs"
            weight="semiBold"
            tx="job.viewDetails"
            style={{ color: colors.palette.white }}
          />
          <Image
            source={images.leftArrow}
            style={$arrow}
            tintColor={colors.palette.white}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const $container: ViewStyle = {
  flexGrow: 1,
  paddingBottom: spacing.xl,
};

const $extaFetch: ViewStyle = {
  height: spacing.xxl,
  justifyContent: 'center',
  alignItems: 'center',
};

const $cellStyle: ViewStyle = {
  gap: spacing.xs,
  marginTop: spacing.md,
  paddingVertical: spacing.sm,
  marginHorizontal: spacing.md,
  paddingHorizontal: spacing.md,
  backgroundColor: colors.palette.offWhite2,
  shadowColor: colors.palette.light,
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.22,
  shadowRadius: 2.22,

  elevation: 3,
  borderRadius: 6,
};

const $spaceBetween: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const $status: TextStyle = {
  flexShrink: 1,
  marginEnd: spacing.xxs,
  alignSelf: 'flex-start',
  borderRadius: spacing.sm,
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.xs,
  backgroundColor: colors.primaryDimmed,
};

const $rowWrapper: ViewStyle = {
  flex: 1,
  gap: spacing.xs,
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: spacing.xxs,
};

const $userImage: ImageStyle = {
  width: spacing.xl,
  height: spacing.xl,
  borderRadius: spacing.md,
  backgroundColor: colors.primaryDimmed,
};

const $smallBox: TextStyle = {
  flexShrink: 1,
  borderRadius: spacing.xxs,
  paddingVertical: spacing.xxxs,
  paddingHorizontal: spacing.xs,
  backgroundColor: colors.primaryDimmed,
};

const $button: ViewStyle = {
  gap: spacing.xs,
  alignItems: 'center',
  flexDirection: 'row',
  borderRadius: spacing.lg,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
  backgroundColor: colors.primary,
};

const $arrow: ImageStyle = {
  transform: [{ rotate: '180deg' }],
};

const $shrinkPrimaryText: TextStyle = {
  flexShrink: 1,
  color: colors.primary,
};

const $shrinkText: TextStyle = {
  flexShrink: 1,
};

const $shrinkDimText: TextStyle = {
  flexShrink: 1,
  color: colors.textDim,
};

const $empty: ViewStyle = {
  flex: 1,
};

const mapStateToProps = (state: RootState) => ({
  fetching: state.home.activeJobsLoading,
  activeJobs: state.home.activeJobs,
  totalPage: state.home.totalActivePage,
});

const mapDispatch = {
  get: (params: Pagination) => getActiveJob(params),
};

const connector = connect(mapStateToProps, mapDispatch);

export const ActiveJobScreen = connector(ActiveJob);
