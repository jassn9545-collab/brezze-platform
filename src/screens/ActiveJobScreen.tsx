import {
  FlatList,
  Image,
  ImageStyle,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import React, { FC, useRef } from 'react';
import { colors, images, spacing } from '../theme';
import { BookingScreenProps } from '../navigators';
import { Text } from '../components';
import { Currency } from '../config/defaults';

type ScreenProps = BookingScreenProps<'ActiveJob'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = ScreenProps;

// let page = 1;
const ActiveJob: FC<Props> = () => {
  const flatlist = useRef<FlatList>(null);
  // const isFocused = useIsFocused();

  // const loadMore = () => {
  //   if (props.totalPage > page) {
  //     page++;
  //     getData();
  //   }
  // };

  // const load = () => {
  //   flatlist.current?.scrollToOffset({animated: true, offset: 0});
  //   page = 1;
  //   getData();
  // };

  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // useFocusEffect(useCallback(load, []));

  // const getData = () => {
  //   props.get({
  //     orderBy: 'date_created_utc',
  //     order: -1,
  //     page: page,
  //     limit: 10,
  //   });
  // };

  // useEffect(() => {
  //   if (props.canceling === 'loaded' && isFocused) {
  //     props.resetCanceling();
  //     load();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [props.canceling]);

  // const loading = props.fetching === 'loading';
  return (
    <FlatList
      ref={flatlist}
      data={[1]}
      contentContainerStyle={$container}
      // keyExtractor={item => item._id}
      keyExtractor={(_, index) => index.toString()}
      // onEndReached={loadMore}
      // refreshing={loading && page === 1 && props.trips.length > 0}
      // onRefresh={load}
      // onEndReachedThreshold={0.2}
      renderItem={({ item, index }: { item: any; index: number }) => (
        <TripCell
          item={item}
          index={index}
          // viewDetail={() => {
          //   props.tripDetails(item._id);
          //   props.navigation.navigate('RideOptions', {
          //     pickupAddress: getAddressParam(item.pickUp),
          //     dropupAddress: getAddressParam(item.dropOff),
          //     data: {
          //       type: item.isRoundTrip ? 'round' : item.rideType,
          //     },
          //   });
          // }}
          // cancelAction={() => {
          //   Alert.alert(
          //     translate('ride.cancelRide'),
          //     translate('ride.cancelTrip'),
          //     [
          //       {
          //         text: translate('common.ok'),
          //         onPress: () =>
          //           props.cancelRide({
          //             id: item._id!,
          //             announce: true,
          //           }),
          //       },
          //       {
          //         text: translate('common.cancel'),
          //         style: 'cancel',
          //       },
          //     ],
          //   );
          // }}
        />
      )}
      // ListEmptyComponent={
      //   <View style={$empty}>
      //     {loading ? (
      //       <Loader loading={loading} backgroundColor={colors.transparent} />
      //     ) : (
      //       <Text tx="trip.noUpcoming" style={$noText} />
      //     )}
      //   </View>
      // }
      // ListFooterComponent={
      //   <View style={$extaFetch}>
      //     {page !== 1 && loading ? (
      //       <ActivityIndicator size="small" color={colors.primary} />
      //     ) : null}
      //   </View>
      // }
    />
  );
};

type TripCellProps = {
  item: any;
  index: number;
  viewDetail?: () => void;
  cancelAction?: () => void;
};

export const TripCell: FC<TripCellProps> = ({ index }) => {
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

        <TouchableOpacity style={$button}>
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

// const $extaFetch: ViewStyle = {
//   height: spacing.xxl,
//   justifyContent: 'center',
//   alignItems: 'center',
// };

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

// const $noText: TextStyle = {
//   flex: 1,
//   textAlign: 'center',
//   marginTop: '50%',
// };

// const $empty: ViewStyle = {
//   flex: 1,
// };

// const mapStateToProps = (state: RootState) => ({
//   fetching: state.ride.fetching,
//   trips: state.ride.upcomingTrips,
//   canceling: state.ride.canceling,
//   totalPage: state.ride.totalUpcomingPage,
// });

// const mapDispatch = {
//   get: (params: ListPageParam) => getUpcomingTrips(params),
//   tripDetails: (id: string) => getTripDetails(id),
//   cancelRide: (arg: CancelTrip) => cancelTrip(arg),
//   resetCanceling: () => rideActions.resetCanceling(),
// };

// const connector = connect(mapStateToProps, mapDispatch);

export const ActiveJobScreen = ActiveJob;
