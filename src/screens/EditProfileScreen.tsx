import React, { FC } from 'react';

import { AppStackScreenProps } from '../navigators';
import { BackButtom, Screen, Text } from '../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { Image, StyleSheet, View } from 'react-native';

type NavigationProps = AppStackScreenProps<'EditProfile'>;
// type StoreProps = ConnectedProps<typeof connector>;
// type Props = NavigationProps & StoreProps;

const EditProfile: FC<NavigationProps> = () => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <BackButtom
        heading="Mandeep Saini"
        style={{
          paddingHorizontal: spacing.md,
          paddingTop: insets.top + spacing.sm,
        }}
      />
      <Screen preset="auto" contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            resizeMode="cover"
            style={styles.userImage}
            source={{ uri: 'https://i.pravatar.cc/300' }}
          />
          <Text size="md" weight="semiBold" text="Mandeep Saini" />
        </View>
      </Screen>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    gap: spacing.sm,
    alignItems: 'center',
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
  },
  userImage: {
    width: 110,
    height: 110,
    borderWidth: 5,
    borderRadius: 55,
    borderColor: colors.palette.offWhite2,
  },
});

// const mapStateToProps = (state: RootState) => ({
//   profile: state.auth.myProfile?.data,
//   loading: state.auth.updateLoading,
//   baseUrl: state.home.baseURl,
// });

// const mapDispatch = {
//   getProfile,
//   update: (params: FormData) => updateProfile(params),
//   reset: () => authActions.resetUpdateLoading(),
// };

// const connector = connect(mapStateToProps, mapDispatch);

export const EditProfileScreen = EditProfile;
