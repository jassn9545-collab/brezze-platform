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
import { getStatusStyle } from '../utils/util';
import moment from 'moment';
import FastImage from '@d11/react-native-fast-image';

type ScreenProps = BookingScreenProps<'ActiveJob'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = ScreenProps & StoreProps;

let page = 1;
const ActiveJob: FC<Props> = props => {
  const flatlist = useRef<FlatList>(null);

  const loadMore = () => {
    if (
      props.totalPage > page &&
      !loading &&
      (props.activeJobs.length ?? 0) > 0
    ) {
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
      keyExtractor={item => item.id.toString()}
      onEndReached={loadMore}
      refreshing={loading && page === 1 && props.activeJobs.length > 0}
      onRefresh={load}
      onEndReachedThreshold={0.8}
      renderItem={({ item, index }: { item: Job; index: number }) => (
        <TripCell
          item={item}
          index={index}
          baseURl={props.baseURl!}
          viewDetail={() =>
            props.navigation.navigate('JobDetail', {
              from: 'ActiveJob',
              id: item.id!,
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
  from?: string;
  baseURl: string;
  viewDetail?: () => void;
  cancelAction?: () => void;
};

export const TripCell: FC<TripCellProps> = ({
  item,
  index,
  from,
  baseURl,
  viewDetail,
}) => {
  const status = getStatusStyle(item?.status);
  return (
    <View key={index} style={$cellStyle}>
      <View style={$spaceBetween}>
        <View style={[$status, { backgroundColor: status.backgroundColor }]}>
          <Text
            size="xxs"
            weight="medium"
            style={[$shrinkPrimaryText, { color: status.color }]}
            text={item?.status.toUpperCase()}
          />
        </View>
        <Text
          size="xxs"
          weight="medium"
          style={$shrinkDimText}
          tx="home.started"
          txOptions={{
            value: moment(item.created_at).format('MMM D'),
          }}
        />
      </View>
      <Text size="sm" weight="medium" text={item.title} />
      <View style={$rowWrapper}>
        {item?.client_profile_pic || item?.client?.profile_image ? (
          <FastImage
            resizeMode="cover"
            style={{
              width: spacing.xl,
              height: spacing.xl,
              borderRadius: spacing.md,
              backgroundColor: colors.primaryDimmed,
            }}
            source={{
              uri:
                baseURl +
                '/' +
                (item?.client_profile_pic ?? item?.client?.profile_image),
            }}
          />
        ) : (
          <View style={$imageName}>
            <Text
              size="xs"
              weight="medium"
              style={{ color: colors.primary }}
              text={
                item.client_name ? item.client_name[0] : item.client.name[0]
              }
            />
          </View>
        )}
        <Text
          size="xs"
          weight="medium"
          style={$shrinkText}
          text={item.client_name ?? item.client.name}
        />
        <View style={$smallBox}>
          <Text
            size="xxs"
            weight="medium"
            tx="home.client"
            style={{ color: colors.primary }}
          />
        </View>
      </View>
      {item.payment_status && (
        <View style={$paymentRow}>
          <Text
            size="xxs"
            weight="medium"
            text={`PAYMENT ${item.payment_status.toUpperCase()}`}
            style={{
              color:
                item.payment_status === 'succeeded'
                  ? colors.palette.green
                  : colors.textDim,
            }}
          />
          {item.payment_status === 'succeeded' && item.provider_earnings ? (
            <Text
              size="xs"
              weight="semiBold"
              text={`${Currency.code} ${Currency.sign}${item.provider_earnings}`}
              style={{ color: colors.palette.green }}
            />
          ) : null}
        </View>
      )}
      <View style={$rowWrapper}>
        <View style={$smallBox}>
          <Text
            size="xxs"
            weight="medium"
            style={{ color: colors.primary }}
            tx="home.budget"
          />
        </View>
        <Text
          size="xs"
          weight="semiBold"
          style={$shrinkPrimaryText}
          text={Currency.code + ' ' + Currency.sign + item.budget}
        />
        {from !== 'SubmitWork' && (
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
        )}
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

const $paymentRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: spacing.xs,
  paddingTop: spacing.xs,
  borderTopWidth: 1,
  borderTopColor: colors.separator,
};

const $status: TextStyle = {
  flexShrink: 1,
  marginEnd: spacing.xxs,
  alignSelf: 'flex-start',
  borderRadius: spacing.sm,
  paddingVertical: spacing.xxs,
  paddingHorizontal: spacing.xs,
};

const $rowWrapper: ViewStyle = {
  flex: 1,
  gap: spacing.xs,
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: spacing.xxs,
};

const $smallBox: TextStyle = {
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
const $imageName: ViewStyle = {
  width: spacing.xl,
  height: spacing.xl,
  borderRadius: spacing.md,
  backgroundColor: colors.primaryDimmed,
  justifyContent: 'center',
  alignItems: 'center',
};

const mapStateToProps = (state: RootState) => ({
  fetching: state.home.activeJobsLoading,
  activeJobs: state.home.activeJobs,
  totalPage: state.home.totalActivePage,
  baseURl: state.setting.basic?.base_url,
});

const mapDispatch = {
  get: (params: Pagination) => getActiveJob(params),
};

const connector = connect(mapStateToProps, mapDispatch);

export const ActiveJobScreen = connector(ActiveJob);
