import React, { FC } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  ImageSourcePropType,
  TouchableOpacity,
} from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { colors, images, spacing } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './Text';
import { TxKeyPath } from '../i18n';

const CustomDrawer: FC<DrawerContentComponentProps> = props => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.xs }]}>
        <Image
          resizeMode="cover"
          style={styles.userImage}
          source={{ uri: 'https://i.pravatar.cc/300' }}
        />
        <View style={styles.userDetail}>
          <Text size="md" text="Mandeep Saini" />
          <Text size="xs" weight="semiBold" text="EXPERT ELECTRICIAN" />
          <View style={styles.userBadge}>
            <Text size="xxs" weight="semiBold" text="TOP RATED" />
          </View>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContainer}
      >
        {/* Main Menu */}
        <View style={styles.menuContainer}>
          <DrawerItem
            image={images.drawerSearch}
            tx="drawer.findJobs"
            onPress={() =>
              props.navigation.navigate('BottomTab', {
                screen: 'Home',
              })
            }
          />

          <DrawerItem
            image={images.document}
            tx="drawer.applyJobs"
            onPress={() => props.navigation.navigate('ApplyJob')}
          />
          <DrawerItem
            image={images.bag}
            tx="drawer.hireJobs"
            onPress={() =>
              props.navigation.navigate('BottomTab', {
                screen: 'HireJobs',
              })
            }
          />
          <DrawerItem
            image={images.savedIcon}
            tx="drawer.savedJobs"
            onPress={() => props.navigation.navigate('ApplyJob')}
          />

          {/* 
        
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

type DrawerItemParams = {
  tx: TxKeyPath;
  image: ImageSourcePropType;
  onPress?: () => void;
};
const DrawerItem = ({ tx, onPress, image }: DrawerItemParams) => (
  <TouchableOpacity style={styles.singleItem} onPress={onPress}>
    <Image source={image} tintColor={colors.palette.black} />
    <Text weight="semiBold" size="sm" tx={tx} style={styles.flexOne} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flexOne: {
    flex: 1,
  },
  header: {
    gap: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginHorizontal: spacing.md,
  },
  userImage: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderRadius: 30,
    marginBottom: spacing.xs,
    borderColor: colors.primary,
  },
  userDetail: {
    flex: 1,
    gap: spacing.xxs + 1,
  },
  userBadge: {
    alignSelf: 'flex-start',
    borderRadius: spacing.xs,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.palette.dimGreen,
  },
  greenText :{
    color: colors.palette.green
  },
  scrollViewContainer: {
    flexGrow: 1,
  },
  scrollView: {
    flex: 1,
  },
  menuContainer: {
    flex: 1,
  },
  singleItem: {
    gap: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: spacing.sm,
    paddingVertical: spacing.sm,
    marginVertical: spacing.xxs,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-between',
    // backgroundColor: colors.palette.primaryDimmed,
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
