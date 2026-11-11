import React, { FC } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { colors, images, spacing } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scale } from 'react-native-size-matters';
import { Text } from './Text';

const CustomDrawer: FC<DrawerContentComponentProps> = (props) => {
  const insets = useSafeAreaInsets();
  // const drawerStatus = useDrawerStatus();
  //   const [expandedCategory, setExpandedCategory] = useState<boolean>(true);

  //   const loadingState = useAppSelector(store => store.auth.logoutLoading);
  //   const profile = useAppSelector(store => store.auth.myProfile?.data);
  //   const baseUrl = useAppSelector(store => store.home.baseURl);

  const menuItems = [
    { title: 'Post a New Job', icon: images.plusIconCircle, screen: 'JobPost' },
    { title: 'My Job Postings', icon: images.myJobs, screen: 'JobPostList' },
    { title: 'Hire History', icon: images.hireHistrory, screen: 'HireHistory' },
    { title: 'Notifications', icon: images.notificationIcon, screen: 'Notifications' },
    { divider: true },
    { title: 'Payment Methods', icon: images.paymentIcon, screen: 'PaymentMethods' },
    { title: 'Privacy Policy', icon: images.privacyIcon, screen: 'PrivacyPolicy' },
    { title: 'Help & Support', icon: images.helpIcon, screen: 'HelpSupport' },
    { title: 'Password Manager', icon: images.passwordIcon, screen: 'PasswordManager' },
  ];

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
      <View>
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <View style={styles.row}>
            <Image source={images.profile1} style={styles.avatar} />
            <View>
              <Text text="Alex Harrison" weight="semiBold" />
              <View style={styles.verified}>
                <Text text="Verified Client" size="xxs" style={{ color: '#1BA672' }} />
              </View>
            </View>
          </View>
        </View>

        {/* MENU */}
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.menuContainer}>

            {menuItems.map((item, index) => {
              if (item.divider) return <View key={index} style={styles.divider} />;

              return (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => item.screen && props.navigation.navigate(item.screen as never)}
                >
                  <Image source={item.icon} style={styles.icon} />
                  <Text text={item.title} style={styles.menuText} />
                </TouchableOpacity>
              );
            })}

          </View>
        </ScrollView>


        {/* <Text>Hello</Text> */}
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

      {/* LOGOUT */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TouchableOpacity style={styles.logoutBtn}
          onPress={() =>
            props.navigation.navigate('CenterModal', {
              modalType: 'logout',
              image: images.logoutIcon,
              title: 'profile.logoutConfirmation',
              desc: 'profile.logoutConfirmationDesc',
              btnText: 'profile.yesLogout',
            })
          }>
          <Text text="Logout" weight="semiBold" style={{ color: '#FF3B30' }} />
        </TouchableOpacity>

        <Text text="VERSION 2.4.0" size="xxs" style={styles.version} />
      </View>
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
    backgroundColor: colors.palette.white,
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
  // header: {
  //   paddingHorizontal: spacing.md,
  //   paddingBottom: spacing.md,
  // },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  verified: {
    backgroundColor: '#E6F7F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
  },

  menuContainer: {
    paddingHorizontal: spacing.md,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: spacing.md,
  },

  icon: {
    width: 22,
    height: 22,
    tintColor: '#333',
  },

  menuText: {
    fontSize: 15,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: spacing.sm,
  },

  footer: {
    padding: spacing.md,
  },

  logoutBtn: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },

  version: {
    textAlign: 'center',
    marginTop: spacing.sm,
    color: '#8A94A6',
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
  // menuContainer: {
  //   flex: 1,
  //   backgroundColor: colors.palette.primaryDimmed,
  // },
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
