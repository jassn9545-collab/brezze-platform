import { BackButtom, Screen } from '../components';
import { FlatList, StyleSheet } from 'react-native';
import React, { FC } from 'react';
import { AppStackScreenProps } from '../navigators';
import { spacing } from '../theme';
import { JobCard } from './HomeScreen';

type NavigationProps = AppStackScreenProps<'ApplyJob'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

const ApplyJob: FC<Props> = props => {
  const onPressJob = () => {
    props.navigation.navigate('JobDetail', {
      from: 'ActiveJob'
    });
  };

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom
        headingTx="drawer.applyJobs"
        style={{
          marginHorizontal: spacing.md,
        }}
      />
      <FlatList
        // ref={flatlist}
        data={[1, 1, 1, 1, 1]}
        style={styles.flatlist}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        // keyExtractor={item => item?.id?.toString()}
        // onEndReached={loadMore}
        // onEndReachedThreshold={0.8}
        renderItem={info => <JobCard {...info} onPressJob={onPressJob} />}
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

export const ApplyJobScreen = ApplyJob;
