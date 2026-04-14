import { BackButtom, ReadMore, Screen, Text } from '../components';
import { StyleSheet, View, Image, TouchableOpacity } from 'react-native';
import React, { FC, useEffect } from 'react';
import { spacing, colors } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';
import { translate } from '../i18n';
import { Currency } from '../config/defaults';
import { Job } from '../slices/types';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { getJobDetail } from '../slices/job.slice';

type NavigationProps = AppStackScreenProps<'jobPostDetails'>;
type Props = NavigationProps & ConnectedProps<typeof connector>;

export type JobPostDetailParams = {
  id: number;
};

const JobPostDetails: FC<Props> = props => {
  useEffect(() => {
    if (props.route.params?.id) {
      props.get({ job_id: props.route.params?.id });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.route.params?.id]);

  return (
    <Screen
      preset="auto"
      safeAreaEdges={['top']}
      contentContainerStyle={styles.container}
    >
      <BackButtom headingTx="jobPostDetails.heading" />
      <View style={styles.main}>
        {props.data && <JobCard item={props.data!} />}
        <Text
          weight="semiBold"
          tx="jobPostDetails.proposalsHeader"
          txOptions={{
            value: props?.data?.bids ?? 0,
          }}
        />

        {props.data?.bids.map(item => (
          <View key={item.id} style={styles.proposalCard}>
            <View style={styles.row}>
              <Image source={{uri: item.freelancer_image}} style={styles.avatar} />

              <View style={styles.flex1}>
                <Text text="Marcus Thorne" weight="semiBold" />
                <Text
                  text="⭐ 4.9 (124 reviews)"
                  size="xs"
                  // style={styles.gray}
                />
              </View>

              <Text
                text={translate('jobPostDetails.price')}
                weight="semiBold"
                style={styles.price}
              />
            </View>

            <Text
              text={translate('jobPostDetails.bioQuote')}
              // style={styles.gray}
            />

            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => props.navigation.navigate('ProfessionalProfile')}
              >
                <Text text={translate('jobPostDetails.viewProfile')} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => props.navigation.navigate('JobPostList')}
              >
                <Text
                  text={translate('jobPostDetails.hire')}
                  style={styles.primaryBtnText}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </Screen>
  );
};

const JobCard = ({ item }: { item: Job }) => {
  return (
    <View key={item.id} style={styles.card}>
      <Text size="sm" weight="medium" text={item.title} />
      <ReadMore text={item.description} style={styles.extraSmallText} />

      <Text
        size="xxs"
        weight="medium"
        tx="jobPostDetails.fixedPrice"
        txOptions={{
          value: Currency.code + ' ' + item.budget,
        }}
      />

      <View style={styles.spaceBetween}>
        <Text
          size="xxs"
          weight="medium"
          style={styles.flexOne}
          text={item.address}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  flexOne: { flex: 1 },
  main: {
    marginHorizontal: spacing.md,
  },
  card: {
    gap: spacing.xs,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: spacing.sm,
    backgroundColor: colors.palette.offWhite2,
  },
  spaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  extraSmallText: {
    fontSize: spacing.xs + 2,
    lineHeight: spacing.sm + 2,
  },
  jobPoints: {
    flex: 1,
    gap: spacing.xs,
    flexWrap: 'wrap',
    flexDirection: 'row',
    marginTop: spacing.xxs,
    marginBottom: spacing.xxxs,
  },
  jobQuickPoint: {
    alignSelf: 'flex-start',
    borderRadius: spacing.xs,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.palette.white,
  },
  proposalCard: {
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.md,
    borderColor: colors.palette.grayLight,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: spacing.lg,
  },


  price: {
    color: colors.palette.primaryBlue,
  },

  primaryBtnText: {
    color: colors.palette.white,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },


  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },


  btnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },

  outlineBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  primaryBtn: {
    flex: 1,
    backgroundColor: colors.palette.primaryBlue,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  statusText: {
    color: colors.palette.primaryBlue,
  },

  link: {
    color: colors.palette.primaryBlue,
  },

  flex1: {
    flex: 1,
  },
});

const mapStateToProps = (state: RootState) => ({
  data: state.job.jobDetail,
  setting: state.setting.basic,
  loading: state.job.jobDetailLoading,
});

const mapDispatch = {
  get: getJobDetail,
};

const connector = connect(mapStateToProps, mapDispatch);

export const jobPostDetailsScreen = connector(JobPostDetails);
