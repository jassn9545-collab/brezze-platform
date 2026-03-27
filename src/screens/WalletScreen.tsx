import { BackButtom, Screen, Text } from '../components';
import { StyleSheet, View } from 'react-native';
import React, { FC } from 'react';
import { AppStackScreenProps } from '../navigators';
import { Currency } from '../config/defaults';
import { colors, spacing } from '../theme';

type NavigationProps = AppStackScreenProps<'Wallet'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

const Wallet: FC<Props> = () => {
  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom headingTx="payment.wallet" />

      <View style={styles.balance}>
        <Text size="xs" weight="medium" tx="payment.availableBalance" />
        <Text
          size="xl"
          weight="semiBold"
          text={Currency.code + Currency.sign + '1240.55'}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  balance: {
    gap: spacing.xxxs,
    padding: spacing.md,
    marginTop: spacing.md,
    borderRadius: spacing.md,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.md,
    backgroundColor: colors.palette.offWhite2,
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

export const WalletScreen = Wallet;
