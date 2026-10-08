import { BackButtom, Button, Loader, SafeRemoteImage, Screen, Text } from '../components';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { FC, useEffect } from 'react';
import { AppStackScreenProps } from '../navigators';
import { colors, spacing } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TxKeyPath } from '../i18n';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { getJobDetail } from '../slices/home.slice';
import { Currency } from '../config/defaults';

type NavigationProps = AppStackScreenProps<'JobDetail'>;
type StoreProps = ConnectedProps<typeof connector>;
type Props = NavigationProps & StoreProps;

interface JobQuichPointType {
  key: TxKeyPath;
  value: string;
}

export type JobDetailParams = {
  id: number;
  from: 'ActiveJob' | 'CompleteJob' | 'Home' | 'SavedJob' | 'ApplyJob';
};

const JobDetail: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  const jobQuickPoints: JobQuichPointType[] = [
    {
      key: 'home.category',
      value: props.setting?.skills.find(
        item => item?.id === Number(props?.data?.category),
      )?.name!,
    },
    // {
    //   key: 'home.paymentVerified',
    //   value: 'Verified',
    // },
    // {
    //   key: 'home.experienceLevel',
    //   value: 'Experience',
    // },
    {
      key: 'home.projectCost',
      value: Currency.code + props.data?.budget,
    },
  ];

  useEffect(() => {
    if (props.route.params?.id) {
      props.get({ project_id: props.route.params?.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.route.params?.id]);

  const onPressLogo = () => {
    props.navigation.navigate('ImageViewer', {
      urls: [props.data?.base_url! + '/' + props.data?.images?.[0]?.image],
      initialIndex: 0,
    });
  };

  const onPressJob = () => {
    if (props.route.params.from === 'ActiveJob') {
      props.navigation.navigate('SubmitWork');
    } else if (!props.data?.job_applied) {
      props.navigation.navigate('JobApply');
    }
  };

  const alreadyApplied =
    props.route.params.from === 'ApplyJob' || Boolean(props.data?.job_applied);

  return (
    <>
      <BackButtom
        headingTx="home.jobDetails"
        style={{
          paddingHorizontal: spacing.md,
          paddingTop: insets.top + spacing.sm,
        }}
      />
      <Screen preset="auto" contentContainerStyle={styles.container}>
        <View style={styles.main}>
          <TouchableOpacity style={styles.jobLogo} onPress={onPressLogo}>
            <SafeRemoteImage
              resizeMode="cover"
              style={styles.jobLogoStyle}
              uri={props.data?.images?.[0]?.image
                ? props.data?.base_url! + '/' + props.data.images[0].image
                : null}
              fallback={require('../assets/images/dummy/jobLogo.png')}
            />
          </TouchableOpacity>
          <Text
            size="md"
            weight="medium"
            style={styles.textCenter}
            text={props.data?.title}
          />
          <Text
            size="sm"
            weight="medium"
            style={styles.textCenter}
            text={props.data?.address}
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
            <Text size="xxs" weight="medium" text={props.data?.description} />
          </View>

          {/* <View style={styles.wrapHeadingText}>
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
          </View> */}

          {/* <View style={styles.wrapHeadingText}>
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
          </View> */}
        </View>
      </Screen>
      {(props.route.params.from === 'ApplyJob' || props.route.params.from === 'ActiveJob') && (
        <Button
          tx="chat.messageClient"
          onPress={() => props.navigation.navigate('ChatDetail', { projectId: props.route.params.id })}
          style={styles.chatButton}
        />
      )}
      <Button
        tx={
          props.route.params.from === 'ActiveJob'
            ? 'home.submitWork'
            : alreadyApplied
              ? 'home.alreadyApplied'
              : 'home.applyJob'
        }
        onPress={onPressJob}
        disabled={alreadyApplied && props.route.params.from !== 'ActiveJob'}
        style={[
          styles.buttonStyle,
          alreadyApplied && props.route.params.from !== 'ActiveJob' && {
            backgroundColor: colors.primaryDimmed,
          },
          { marginBottom: insets.bottom + spacing.sm },
        ]}
      />
      <Loader loading={props.loading === 'loading'} />
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.palette.offWhite2,
  },
  jobLogoStyle: {
    width: '100%',
    height: '100%',
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
  chatButton: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
});

const mapStateToProps = (state: RootState) => ({
  data: state.home.jobDetail,
  setting: state.setting.basic,
  loading: state.home.jobDetailLoading,
});

const mapDispatch = {
  get: getJobDetail,
};

const connector = connect(mapStateToProps, mapDispatch);

export const JobDetailScreen = connector(JobDetail);
