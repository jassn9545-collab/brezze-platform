import { FlatList, ViewStyle } from 'react-native';
import React, { FC, useRef } from 'react';
import { BookingScreenProps } from '../navigators';
import { TripCell } from './ActiveJobScreen';
import { spacing } from '../theme';

type ScreenProps = BookingScreenProps<'CompleteJob'>;
//   type StoreProps = ConnectedProps<typeof connector>;
type Props = ScreenProps;

//   let page = 1;
const CompleteJob: FC<Props> = () => {
  const flatlist = useRef<FlatList>(null);

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

  // const loading = props.fetching === 'loading';
  return (
    <FlatList
      ref={flatlist}
      data={[1, 1, 1, 1, 1, 1]}
      contentContainerStyle={$container}
      // keyExtractor={item => item._id}
      keyExtractor={(_, index) => index.toString()}
      // onEndReached={loadMore}
      // refreshing={loading && page === 1 && props.trips.length > 0}
      // onRefresh={load}
      // onEndReachedThreshold={0.2}
      renderItem={({ item, index }) => (
        <TripCell
          item={item}
          index={index}
          // onPress={() =>
          //   props.navigation.navigate('PastTripDetails', {
          //     tripId: item._id,
          //   })
          // }
        />
      )}
      // ListEmptyComponent={
      //   <View style={$empty}>
      //     {loading ? (
      //       <Loader loading={loading} backgroundColor={colors.transparent} />
      //     ) : (
      //       <Text tx="trip.noPast" style={$noText} />
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

//   const $noText: TextStyle = {
//     flex: 1,
//     textAlign: 'center',
//     marginTop: '50%',
//   };

//   const $empty: ViewStyle = {
//     flex: 1,
//   };

//   const $extaFetch: ViewStyle = {
//     height: spacing.xxl,
//     justifyContent: 'center',
//     alignItems: 'center',
//   };

//   const mapStateToProps = (state: RootState) => ({
//     fetching: state.ride.fetching,
//     trips: state.ride.pastTrips,
//     totalPage: state.ride.totalPastPage,
//   });

//   const mapDispatch = {
//     get: (params: ListPageParam) => getPastTrips(params),
//   };

//   const connector = connect(mapStateToProps, mapDispatch);

export const CompleteJobScreen = CompleteJob;
