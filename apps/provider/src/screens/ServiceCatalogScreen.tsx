import { BackButtom, Screen } from '../components';
import { FlatList, StyleSheet } from 'react-native';
import React, { FC } from 'react';
import { AppStackScreenProps } from '../navigators';
import { Service } from './ProfileScreen';
import { spacing } from '../theme';

type NavigationProps = AppStackScreenProps<'ServiceCatalog'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

const ServiceCatalog: FC<Props> = () => {
  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom headingTx="drawer.serviceCatalogs" />
      <FlatList
        style={styles.flatlist}
        data={[1, 1, 1, 1, 1, 1]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        renderItem={info => <Service {...info} />}
      />
    </Screen>
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
    marginHorizontal: spacing.md,
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

export const ServiceCatalogScreen = ServiceCatalog;
