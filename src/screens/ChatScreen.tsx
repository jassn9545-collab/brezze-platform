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
import { parseSource } from '../utils/util';
import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';

type NavigationProps = AppBottomTabScreenProps<'Chat'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

const Chat: FC<Props> = props => {

  const onPressUser = () => {
    props.navigation.navigate('ChatDetail');
  };
  
  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom headingTx="chat.messages" />
      <FlatList
        // ref={flatlist}
        data={[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]}
        style={styles.flatlist}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        // keyExtractor={item => item?.id?.toString()}
        // onEndReached={loadMore}
        // onEndReachedThreshold={0.8}
        renderItem={info => <ChatCard {...info} onPressUser={onPressUser} />}
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

type ChatCardProps = ListRenderItemInfo<any> & {
  onPressUser: () => void;
};
const ChatCard = ({ item, onPressUser }: ChatCardProps) => {
  return (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.9}
      style={styles.card}
      onPress={onPressUser}
    >
      <Image
        resizeMode="cover"
        style={styles.userImage}
        {...parseSource('https://i.pravatar.cc/300', images.user)}
      />

      <View style={styles.flexOne}>
        <Text size="sm" text="Ronger stark" />
        <Text size="xxs" text="Roger that sir, thankyou" />

        <View style={styles.timeWrapper}>
          <Text size="xxs" text="2m ago" style={styles.time} />
          <View style={styles.statusWrapper}>
            <Text size="xxs" tx="chat.read" style={styles.statusInfo} />
            <Image source={images.tickIcon} />
          </View>
        </View>
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
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  flatlist: {
    flex: 1,
  },
  card: {
    gap: spacing.sm,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginHorizontal: spacing.md,
  },
  flexOne: {
    flex: 1,
  },
  userImage: {
    width: spacing.xxl + spacing.xs,
    height: spacing.xxl + spacing.xs,
    borderRadius: spacing.xl,
    backgroundColor: colors.primaryDimmed,
  },
  timeWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: { flex: 1, color: colors.textDim },
  statusWrapper: {
    gap: spacing.xxs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusInfo: { flexShrink: 1, color: colors.palette.purple },
});

// const mapStateToProps = (state: RootState) => ({
//   data: state.home.homeData,
// });

// const mapDispatch = {
//   getProfile,
//   getHomeData,
//   getCategories,
//   addToCart: (params: AddCartParams) => addToCart(params),
//   addToWishlist: (params: WishlistParams) => addToWishlist(params),
//   removeToWishlist: (params: WishlistParams) => removeToWishlist(params),
// };

// const connector = connect(mapStateToProps, mapDispatch);

export const ChatScreen = Chat;
