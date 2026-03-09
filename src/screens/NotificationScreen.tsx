// import { BackButtom, Screen, Text } from '../components';
// import {
//   ActivityIndicator,
//   FlatList,
//   Image,
//   ListRenderItemInfo,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { connect, ConnectedProps } from 'react-redux';
// import React, { FC, useEffect, useRef } from 'react';
// import { colors, images, spacing } from '../theme';
// import { AppStackScreenProps } from '../navigators';
// import moment from 'moment';
// import { RootState } from '../store';
// import { getNotifications } from '../slices/auth.slice';
// import { Notification as NotificationType } from '../slices/types';
// import ListEmptyComponent from '../components/ListEmptyComponent';

// type NavigationProps = AppStackScreenProps<'Notification'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

// let page = 1;
// const Notification: FC<Props> = props => {
//   const flatlist = useRef<FlatList<NotificationType>>(null);

//   const fetching = props.fetching === 'loading';
//   const loadMore = () => {
//     if (!fetching && props.totalcount > props.notification.length) {
//       page++;
//       getData();
//     }
//   };

//   const load = () => {
//     page = 1;
//     getData();
//   };

//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   useEffect(load, []);

//   const getData = () => {
//     props.get({ page });
//   };
//   return (
//     <Screen
//       preset="fixed"
//       safeAreaEdges={['top']}
//       contentContainerStyle={styles.container}
//     >
//       <BackButtom headingTx="home.notifications" />
//       <FlatList
//         ref={flatlist}
//         data={props.notification}
//         style={styles.flatlist}
//         contentContainerStyle={styles.contentContainer}
//         showsVerticalScrollIndicator={false}
//         keyExtractor={item => item?.id?.toString()}
//         onEndReached={loadMore}
//         onEndReachedThreshold={0.8}
//         renderItem={info => <NotificationCard {...info} />}
//         ListEmptyComponent={
//           <View style={styles.empty}>
//             <ListEmptyComponent tx="common.noDataFound" />
//           </View>
//         }
//         ListFooterComponent={
//           <View style={styles.extaFetch}>
//             {page !== 1 && fetching ? (
//               <ActivityIndicator size="small" color={colors.primary} />
//             ) : null}
//           </View>
//         }
//       />
//     </Screen>
//   );
// };

// type NotificationCardProps = ListRenderItemInfo<NotificationType>;
// const NotificationCard = ({ item }: NotificationCardProps) => {
//   return (
//     <TouchableOpacity
//       activeOpacity={0.9}
//       key={item.id}
//       style={styles.singleNotification}
//     >
//       <Image source={images.notificationIcon} />
//       <View style={styles.wrapText}>
//         <Text
//           size="xs"
//           weight="medium"
//           style={styles.title}
//           text={item?.message}
//         />
//         <Text
//           size="xxs"
//           weight="medium"
//           style={styles.lightTextStyle}
//           text={moment(item?.created_at).fromNow()}
//         />
//       </View>
//     </TouchableOpacity>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//   },
//   contentContainer: {
//     flexGrow: 1,
//     paddingTop: spacing.sm,
//   },
//   flatlist: {
//     flex: 1,
//   },
//   empty: {
//     flex: 1,
//   },
//   extaFetch: {
//     height: spacing.xxl,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   singleNotification: {
//     flex: 1,
//     gap: spacing.sm,
//     alignItems: 'center',
//     flexDirection: 'row',
//     borderRadius: spacing.sm,
//     marginBottom: spacing.sm,
//     paddingVertical: spacing.xs,
//     marginHorizontal: spacing.md,
//     paddingHorizontal: spacing.sm,
//     backgroundColor: colors.palette.offWhite2,
//   },
//   wrapText: { flex: 1, marginEnd: spacing.md, gap: spacing.xxxs },
//   title: { flex: 1 },
//   lightTextStyle: {
//     color: colors.palette.placeholderColor,
//   },
// });

// const mapStateToProps = (state: RootState) => ({
//   totalcount: state.auth.totalNotifications,
//   notification: state.auth.userNotifications,
//   fetching: state.auth.userNotificationsLoading,
// });

// const mapDispatch = {
//   get: getNotifications,
// };

// const connector = connect(mapStateToProps, mapDispatch);

// export const NotificationScreen = connector(Notification);
