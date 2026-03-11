import React, { FC } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { colors, spacing } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale } from 'react-native-size-matters';

const CustomDrawer: FC<DrawerContentComponentProps> = () => {
  const insets = useSafeAreaInsets();
  // const drawerStatus = useDrawerStatus();
//   const [expandedCategory, setExpandedCategory] = useState<boolean>(true);

//   const loadingState = useAppSelector(store => store.auth.logoutLoading);
//   const profile = useAppSelector(store => store.auth.myProfile?.data);
//   const baseUrl = useAppSelector(store => store.home.baseURl);

  return (
    <View style={styles.container}>
      {/* {drawerStatus === 'open' && (
        <TouchableOpacity
          style={[styles.closeBtn, { top: insets.top }]}
          onPress={() => props.navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Animated.Image
            source={images.rightArrow}
            style={{ transform: [{ rotate: '180deg' }] }}
          />
        </TouchableOpacity>
      )} */}

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        {/* <FastImage
          source={
            profile?.profile
              ? {
                  uri: baseUrl + '/' + profile?.profile,
                }
              : images.vector
          }
          style={styles.userImage}
        />
        <Text
          weight="medium"
          size="sm"
          tx="drawer.hi"
          style={{ color: colors.palette.white }}
        />
        <Text weight="medium" size="xl" text={profile?.name} /> */}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContainer}
      >
        {/* Main Menu */}
        <View style={styles.menuContainer}>
          {/* <DrawerItem
            image={images.paymentHistory}
            tx="drawer.paymentHistory"
            onPress={() => props.navigation.navigate('Vault')}
          />
          <DrawerItem
            image={images.withDrawal}
            tx="drawerScreens.withdrawal"
            onPress={() => props.navigation.navigate('Withdrawal')}
          />
          <DrawerItem
            image={images.yourOrder}
            tx="drawer.yourOrder"
            onPress={() => props.navigation.navigate('Orders')}
          />
          <DrawerItem
            image={images.yourWishlist}
            tx="drawer.yourWishlist"
            onPress={() => props.navigation.navigate('Wishlist')}
          /> */}
        </View>
      </ScrollView>
      {/* <TouchableOpacity
        style={[
          styles.signOutItem,
          { paddingBottom: insets.bottom + spacing.xs },
        ]}
        onPress={() =>
          props.navigation.navigate('BottomModal', {
            modalType: 'logout',
            image: images.logoutIcon,
            title: 'profile.logoutConfirmtion',
            desc: 'profile.logoutConfirmtionDesc',
            btnText: 'profile.yesLogout',
          })
        }
      >
        <Image source={images.signOut} />
        <Text
          weight="medium"
          size="lg"
          tx="drawer.signOut"
          style={{ color: colors.error }}
        />
      </TouchableOpacity> */}
      {/* <Loader loading={loadingState === 'loading'} /> */}
    </View>
  );
};

// type DrawerItemParams = {
//   tx: TxKeyPath;
//   image: ImageSourcePropType;
//   onPress: () => void;
// };
// const DrawerItem = ({ tx, onPress, image }: DrawerItemParams) => (
//   <TouchableOpacity style={styles.singleItem} onPress={onPress}>
//     <Image source={image} />
//     <Text weight="medium" size="lg" tx={tx} style={styles.flexOne} />
//     <Image source={images.rightArrow} />
//   </TouchableOpacity>
// );

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  flexOne: {
    flex: 1,
  },
  // closeBtn: {
  //   zIndex: 1,
  //   right: -spacing.xs,
  //   padding: spacing.xxs,
  //   position: 'absolute',
  //   borderRadius: spacing.md,
  //   backgroundColor: colors.primary,
  // },
  header: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
  },
  userImage: {
    height: 70,
    width: 70,
    borderRadius: scale(10),
    marginBottom: spacing.xs,
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: colors.palette.primaryDimmed,
  },
  singleItem: {
    gap: spacing.sm,
    alignItems: 'center',
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.md,
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
  },
  signOutItem: {
    gap: spacing.xs,
    padding: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.palette.dimRed,
  },
});

const SideMenu = (props: DrawerContentComponentProps) => (
  <CustomDrawer {...props} />
);
export default SideMenu;
