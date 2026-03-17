import { BackButtom, Button, Screen, Text } from '../components';
import { Image, StyleSheet, View } from 'react-native';
import React, { FC } from 'react';
import { AppStackScreenProps } from '../navigators';
import { colors, spacing } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TxKeyPath } from '../i18n';

type NavigationProps = AppStackScreenProps<'JobDetail'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

interface JobQuichPointType {
  key: TxKeyPath;
  value: string;
}
const jobQuickPoints: JobQuichPointType[] = [
  {
    key: 'home.jobType',
    value: 'Contract',
  },
  {
    key: 'home.paymentVerified',
    value: 'Verified',
  },
  {
    key: 'home.experienceLevel',
    value: 'Experience',
  },
  {
    key: 'home.projectCost',
    value: 'AUD 500',
  },
];

const JobDetail: FC<Props> = props => {
  const insets = useSafeAreaInsets();

  const onPressJob = () => {
    props.navigation.navigate('JobApply');
  };
  
  return (
    <>
      <BackButtom
        headingTx="home.jobDetails"
        style={{
          paddingTop: insets.top + spacing.sm,
          marginHorizontal: spacing.md,
        }}
      />
      <Screen preset="auto" contentContainerStyle={styles.container}>
        <View style={styles.main}>
          <View style={styles.jobLogo}>
            <Image source={require('../assets/images/dummy/jobLogo.png')} />
          </View>
          <Text
            size="md"
            weight="medium"
            style={styles.textCenter}
            text="Electrician Need for House Pipe Fitting"
          />
          <Text
            size="sm"
            weight="medium"
            style={styles.textCenter}
            text="42 Hebbard Street, Victoria, Australia"
          />
          <View style={styles.jobPoints}>
            {jobQuickPoints?.map((data, index) => (
              <View key={index} style={styles.jobQuickPoint}>
                <Text size="xs" weight="medium" tx={data.key} />
                <Text size="sm" weight="medium" text={data.value} />
              </View>
            ))}
          </View>

          <View style={styles.wrapHeadingText}>
            <Text size="md" weight="semiBold" tx="home.description" />
            <Text
              size="xxs"
              weight="medium"
              text="By clicking on Accept and Proceed, you consent to provide us with the requested data. By clicking on Accept and Proceed, you consent to provide us with the Accept and Proceed, requested data"
            />
          </View>

          <View style={styles.wrapHeadingText}>
            <Text size="md" weight="semiBold" tx="home.requirement" />
            <View style={styles.singleDescription}>
              <View style={styles.bulletPoint} />
              <Text
                size="xxs"
                weight="medium"
                text="By clicking on Accept and Proceed, you consent to provide us with the requested data."
              />
            </View>

            <View style={styles.singleDescription}>
              <View style={styles.bulletPoint} />
              <Text
                size="xxs"
                weight="medium"
                text="By clicking on Accept and Proceed, you consent to provide us with the requested data. "
              />
            </View>

            <View style={styles.singleDescription}>
              <View style={styles.bulletPoint} />
              <Text
                size="xxs"
                weight="medium"
                text="By clicking on Accept and Proceed, you consent to provide us with the requested data. By clicking on Accept and Proceed requested data."
              />
            </View>
          </View>

          <View style={styles.wrapHeadingText}>
            <Text size="md" weight="semiBold" tx="home.responsibilities" />
            <View style={styles.singleDescription}>
              <View style={styles.bulletPoint} />
              <Text
                size="xxs"
                weight="medium"
                text="By clicking on Accept and Proceed, you consent to provide us with the requested data. By clicking on Accept and Proceed requested data."
              />
            </View>

            <View style={styles.singleDescription}>
              <View style={styles.bulletPoint} />
              <Text
                size="xxs"
                weight="medium"
                text="By clicking on Accept and Proceed, you consent to provide us with the requested data. "
              />
            </View>

            <View style={styles.singleDescription}>
              <View style={styles.bulletPoint} />
              <Text
                size="xxs"
                weight="medium"
                text="By clicking on Accept and Proceed, you consent to provide us with the requested data. By clicking on Accept and Proceed requested data."
              />
            </View>
          </View>
        </View>
      </Screen>
      <Button
        tx="home.applyJob"
        onPress={onPressJob}
        style={[
          styles.buttonStyle,
          { marginBottom: insets.bottom + spacing.sm },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  main: {
    margin: spacing.md,
  },
  jobLogo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    alignSelf: 'center',
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.palette.offWhite2,
  },
  textCenter: {
    textAlign: 'center',
  },
  jobPoints: {
    flex: 1,
    gap: spacing.xs,
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  jobQuickPoint: {
    width: '48%',
    gap: spacing.xxxs,
    borderRadius: spacing.xs,
    paddingStart: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.palette.offWhite2,
  },
  wrapHeadingText: {
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  singleDescription: {
    gap: spacing.xs,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: spacing.xs,
    marginTop: spacing.xxs + 1,
    backgroundColor: colors.palette.black,
  },
  buttonStyle: {
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

export const JobDetailScreen = JobDetail;
