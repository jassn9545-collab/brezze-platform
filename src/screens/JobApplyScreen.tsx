import { BackButtom, Button, Screen, Text, TextField } from '../components';
import { FlatList, Keyboard, StyleSheet, View } from 'react-native';
import React, { FC, useState } from 'react';
import { AppStackScreenProps } from '../navigators';
import { colors, spacing } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { JobCard } from './HomeScreen';
import { Currency } from '../config/defaults';
import { TxKeyPath } from '../i18n';
import { buildError, JobApplyParams, jobApplySchema } from '../apis/schema';
import { commonStyle } from '../theme/style';

type NavigationProps = AppStackScreenProps<'JobApply'>;
// type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps;

type FieldError = {
  bidAmount?: TxKeyPath | undefined;
  estimatedTime?: TxKeyPath | undefined;
};

const JobDetail: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  const [bidAmount, setBidAmount] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [error, setError] = useState<FieldError>({});

  const onPressJob = () => {
    let loginParams: JobApplyParams = {
      bidAmount,
      estimatedTime,
    };
    jobApplySchema
      .validate(loginParams, { abortEarly: false })
      .then(params => {
        Keyboard.dismiss();
        console.log('params', params);
        props.navigation.navigate('JobApplySucessModal');
        setError({});
      })
      .catch(errors => {
        const err = buildError<FieldError>(errors);
        setError(err);
      });
  };

  return (
    <>
      <BackButtom
        headingTx="home.jobApply"
        style={{
          paddingTop: insets.top + spacing.sm,
          paddingHorizontal: spacing.md,
        }}
      />
      <Screen preset="auto" contentContainerStyle={styles.container}>
        <View style={styles.main}>
          <FlatList
            data={[1]}
            scrollEnabled={false}
            renderItem={info => <JobCard {...info} />}
          />
          <View style={styles.jobSingleDetailWrapper}>
            <Text size="sm" weight="semiBold" tx="home.yourTerms" />
            <View style={styles.jobSingleDetail}>
              <TextField
                value={bidAmount}
                onChangeText={setBidAmount}
                keyboardType="number-pad"
                labelTx="home.bidAmount"
                LabelTextProps={{
                  style: { marginBottom: spacing.xs },
                }}
                labelTxOptions={{
                  value: '(' + Currency.code + ')',
                }}
                placeholderTx="home.bidAmountPlaceholder"
                returnKeyType="done"
                helperTx={error?.bidAmount}
                status={error?.bidAmount ? 'error' : undefined}
              />
              <Text>
                <Text
                  size="xxs"
                  weight="medium"
                  style={{ color: colors.primary }}
                  tx="home.clientBudget"
                />
                <Text
                  size="xxs"
                  weight="medium"
                  text={Currency.code + ' 500'}
                />
              </Text>
            </View>
            <View style={styles.jobSingleDetail}>
              <TextField
                value={estimatedTime}
                onChangeText={setEstimatedTime}
                keyboardType="number-pad"
                labelTx="home.estimatedTime"
                LabelTextProps={{
                  style: { marginBottom: spacing.xs },
                }}
                placeholderTx="home.estimatedTimePlaceholder"
                returnKeyType="done"
                helperTx={error?.estimatedTime}
                status={error?.estimatedTime ? 'error' : undefined}
              />
              <Text>
                <Text
                  size="xxs"
                  weight="medium"
                  style={{ color: colors.primary }}
                  tx="home.clientBudget"
                />
                <Text
                  size="xxs"
                  weight="medium"
                  text={Currency.code + ' 500'}
                />
              </Text>
            </View>
          </View>
        </View>
      </Screen>
      <View style={[styles.bottomContainer, commonStyle.customShadow]}>
        <View style={styles.jobPricing}>
          <Text
            size="xs"
            weight="medium"
            tx="home.marketFee"
            txOptions={{
              value: '10%',
            }}
          />
          <Text size="xs" weight="medium" text={Currency.sign + '50.00'} />
        </View>

        <View style={styles.jobPricing}>
          <Text size="md" weight="semiBold" tx="home.recieveMoney" />
          <Text
            size="lg"
            weight="semiBold"
            style={{ color: colors.primary }}
            text={Currency.sign + '450.00'}
          />
        </View>

        <Button
          tx="home.submitProposal"
          onPress={onPressJob}
          style={{ marginBottom: insets.bottom + spacing.sm }}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  main: {
    marginVertical: spacing.md,
  },
  jobSingleDetailWrapper: {
    marginHorizontal: spacing.md,
  },
  jobSingleDetail: {
    gap: spacing.xs,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.palette.offWhite2,
  },
  bottomContainer: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.palette.white,
  },
  jobPricing: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export const JobApplyScreen = JobDetail;
