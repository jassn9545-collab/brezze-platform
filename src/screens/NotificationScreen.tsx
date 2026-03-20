import { BackButtom, Screen, Text } from '../components';
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC } from 'react';
import { colors, images, spacing } from '../theme';
import { AppStackScreenProps } from '../navigators';
import moment from 'moment';
// import { RootState } from '../store';
// import { getNotifications } from '../slices/auth.slice';
// import { Notification as NotificationType } from '../slices/types';

type NavigationProps = AppStackScreenProps<'Notification'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

// let page = 1;
const Notification: FC<NavigationProps> = () => {
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
  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom headingTx="home.notification" />
      <FlatList
        // ref={flatlist}
        // data={props.notification}
        data={[1, 1, 1, 1, 1, 1, 1, 1]}
        style={styles.flatlist}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        // keyExtractor={item => item?.id?.toString()}
        // onEndReached={loadMore}
        // onEndReachedThreshold={0.8}
        renderItem={info => <NotificationCard {...info} />}
        // ListEmptyComponent={
        //   <View style={styles.empty}>
        //     <ListEmptyComponent tx="common.noDataFound" />
        //   </View>
        // }
        // ListFooterComponent={
        //   <View style={styles.extaFetch}>
        //     {page !== 1 && fetching ? (
        //       <ActivityIndicator size="small" color={colors.primary} />
        //     ) : null}
        //   </View>
        // }
      />
    </Screen>
  );
};

// type NotificationCardProps = ListRenderItemInfo<NotificationType>;
type NotificationCardProps = ListRenderItemInfo<any>;
const NotificationCard = ({ item }: NotificationCardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      key={item.id}
      style={styles.singleNotification}
    >
      <View style={styles.titleWrappper}>
        <View style={styles.dot} />
        <Text
          size="sm"
          weight="medium"
          text="Apply Success"
          style={styles.whiteText}
        />
      </View>

      <Text
        size="xs"
        weight="medium"
        style={styles.whiteText}
        text="Please verify your profile information to continue using this app"
      />
      <View style={styles.spaceBetween}>
        <View style={styles.timer}>
          <Image source={images.clock} tintColor={colors.palette.lightCream} />
          <Text
            size="xs"
            weight="medium"
            style={styles.lightTextStyle}
            text={moment(item?.created_at).fromNow()}
          />
        </View>
        <Text
          size="xs"
          weight="semiBold"
          style={styles.whiteText}
          tx="home.markRead"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: spacing.sm,
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
  singleNotification: {
    flex: 1,
    gap: spacing.sm,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.palette.primaryColor,
  },
  titleWrappper: {
    gap: spacing.xs,
    alignItems: 'center',
    flexDirection: 'row',
  },
  dot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: spacing.sm / 2,
    backgroundColor: colors.palette.white,
  },
  wrapText: { flex: 1, marginEnd: spacing.md, gap: spacing.xxxs },
  title: { flex: 1 },
  lightTextStyle: {
    color: colors.palette.lightCream,
  },
  whiteText: {
    color: colors.palette.white,
  },
  spaceBetween: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timer: {
    gap: spacing.xxs,
    alignItems: 'center',
    flexDirection: 'row',
  },
});

// const mapStateToProps = (state: RootState) => ({
//   totalcount: state.auth.totalNotifications,
//   notification: state.auth.userNotifications,
//   fetching: state.auth.userNotificationsLoading,
// });

// const mapDispatch = {
//   get: getNotifications,
// };

// const connector = connect(mapStateToProps, mapDispatch);

export const NotificationScreen = Notification;
