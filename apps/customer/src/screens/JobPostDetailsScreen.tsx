import {
  BackButtom,
  Button,
  Loader,
  JobPaymentButton,
  ReadMore,
  Screen,
  Text,
} from '../components';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import React, { FC, useEffect } from 'react';
import { spacing, colors } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';
import { Currency } from '../config/defaults';
import { Bid, Job } from '../slices/types';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import {
  getJobDetail,
  hireJob,
  completeJob,
  HireJobParams,
  CompleteJobParams,
} from '../slices/job.slice';
import FastImage from '@d11/react-native-fast-image';
import ListEmptyComponent from '../components/ListEmptyComponent';
import { BasicData } from '../slices/setting.slice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { translate } from '../i18n';

type NavigationProps = AppStackScreenProps<'jobPostDetails'>;
type Props = NavigationProps & ConnectedProps<typeof connector>;

export type JobPostDetailParams = {
  id: number;
};

const JobPostDetails: FC<Props> = props => {
  const insets = useSafeAreaInsets();
  const [currentJobId, setCurrentJobId] = React.useState<number | null>(null);
  const { route, hireJobLoading, get } = props;

  useEffect(() => {
    if (route.params?.id && route.params?.id !== currentJobId) {
      setCurrentJobId(route.params?.id);
      get({ job_id: route.params?.id });
    }
  }, [route.params?.id, currentJobId, get]);

  useEffect(() => {
    if (hireJobLoading === 'loaded' && currentJobId) {
      get({ job_id: currentJobId });
    }
  }, [hireJobLoading, currentJobId, get]);

  const onPressProfile = (_data: Bid) => {
    props.navigation.navigate('ProfessionalProfile', { id: _data.user_id });
  };

  const onPressHire = (data: Bid) => {
    if (route.params?.id) {
      props.hireJob({ job_id: route.params?.id, bid_id: data.id });
    }
  };

  const onPressCompleteJob = () => {
    if (props.data?.id) {
      props.completeJob({ job_id: props.data.id });
    }
  };

  return (
    <>
      <Screen
        preset="fixed"
        safeAreaEdges={['top']}
        contentContainerStyle={styles.container}
      >
        <BackButtom headingTx="jobPostDetails.heading" />
        <View style={styles.main}>
          {props.data && <JobCard item={props.data} />}

          <Text
            weight="semiBold"
            tx="jobPostDetails.proposalsHeader"
            txOptions={{
              value: '(' + (props?.data?.bids?.length ?? 0) + ')',
            }}
          />
          <FlatList
            data={props.data?.bids}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            renderItem={info => (
              <BidCard
                {...info}
                setting={props.setting!}
                onPressProfile={onPressProfile}
                onPressHire={onPressHire}
                isHired={info.item.is_hired || false}
                hireJobLoading={props.hireJobLoading === 'loading'}
                hiredFreelancerName={
                  info.item.is_hired ? info.item.freelancer_name : ''
                }
              />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <ListEmptyComponent tx="common.noDataFound" />
              </View>
            }
          />
        </View>

        {props.data?.status === 'in progress' && (
          <>
            <View style={styles.flexOne} />
            <Button
              style={[
                styles.button,
                { marginBottom: insets.bottom + spacing.md },
              ]}
              tx="jobPostDetails.completeJob"
              onPress={onPressCompleteJob}
            />
          </>
        )}
        {props.data?.status === 'completed' && (
          <>
            <View style={styles.flexOne} />
            <JobPaymentButton
              jobId={props.data.id}
              style={[
                styles.button,
                { marginBottom: insets.bottom + spacing.md },
              ]}
              onPaid={() => get({ job_id: props.data!.id })}
            />
          </>
        )}
      </Screen>
      <Loader
        loading={
          props.hireJobLoading === 'loading' ||
          props.loading === 'loading' ||
          props.completeJobLoading === 'loading'
        }
      />
    </>
  );
};

const JobCard = ({ item }: { item: Job }) => {
  const statusStyle = getStatusStyle(item.status);

  return (
    <View key={item.id} style={styles.card}>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: statusStyle.backgroundColor },
        ]}
      >
        <Text
          size="xxs"
          weight="bold"
          text={item.status.toUpperCase()}
          style={{ color: statusStyle.color }}
        />
      </View>

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

      <Text size="xxs" weight="medium" text={item.address} />
    </View>
  );
};

type BidCardProps = ListRenderItemInfo<Bid> & {
  setting: BasicData;
  onPressProfile: (data: Bid) => void;
  onPressHire: (data: Bid) => void;
  isHired: boolean;
  hireJobLoading: boolean;
  hiredFreelancerName: string;
};

const BidCard = ({
  item,
  setting,
  onPressProfile,
  onPressHire,
  isHired,
  hireJobLoading,
  hiredFreelancerName,
}: BidCardProps) => {
  return (
    <View key={item.id} style={styles.proposalCard}>
      <View style={styles.row}>
        <FastImage
          source={{ uri: setting.base_url + '/' + item?.freelancer_image }}
          resizeMode="cover"
          style={styles.avatar}
        />
        <View style={styles.flexOne}>
          <View style={styles.spaceBetween}>
            <Text
              weight="bold"
              style={styles.flexOne}
              text={item.freelancer_name}
            />
            <Text
              size="md"
              weight="bold"
              style={{ color: colors.primary }}
              text={Currency.sign + item.bid_amount}
            />
          </View>

          {item.work_description && (
            <View style={styles.spaceBetween}>
              <Text size="xxs" text={item.work_description} />
            </View>
          )}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => onPressProfile(item)}
            >
              <Text
                size="xxs"
                weight="semiBold"
                numberOfLines={1}
                tx="jobPostDetails.viewProfile"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.hireBtn,
                (isHired || hireJobLoading) && styles.hireBtnDisabled,
              ]}
              onPress={() => onPressHire(item)}
              disabled={isHired || hireJobLoading}
            >
              <Text
                size="xxs"
                weight="semiBold"
                text={
                  isHired
                    ? `${translate(
                        'jobPostDetails.hired',
                      )}${hiredFreelancerName}`
                    : translate('jobPostDetails.hireText')
                }
                numberOfLines={1}
                style={{
                  color: !isHired ? colors.palette.white : colors.palette.black,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const getStatusStyle = (type: string) => {
  switch (type) {
    case 'active':
      return {
        backgroundColor: colors.palette.primarylight,
        color: colors.primary,
      };
    case 'inactive':
      return {
        backgroundColor: colors.palette.centerColor,
        color: colors.error,
      };
    case 'completed':
      return {
        backgroundColor: colors.palette.offGreen,
        color: colors.palette.green,
      };
    case 'in progress':
      return {
        backgroundColor: colors.palette.yellowLight,
        color: colors.palette.yellow,
      };
    default:
      return {
        backgroundColor: colors.palette.lightGray,
        color: colors.palette.black,
      };
  }
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
    marginBottom: spacing.xs,
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
  empty: {
    flex: 1,
  },
  proposalCard: {
    flex: 1,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.md,
    borderRadius: spacing.md,
    borderColor: colors.palette.grayLight,
  },
  row: {
    gap: spacing.sm,
    flexDirection: 'row',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: spacing.lg,
    backgroundColor: colors.palette.offWhite2,
  },
  btnRow: {
    gap: spacing.xs,
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  outlineBtn: {
    flex: 1,
    flexBasis: 0,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    borderColor: colors.palette.borderColor,
  },
  primaryBtn: {
    flex: 1,
    flexBasis: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.xs,
    minHeight: 36,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary,
  },
  hireBtn: {
    backgroundColor: colors.primary,
    borderRadius: spacing.xs,
    padding: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 80,
  },
  hireBtnDisabled: {
    backgroundColor: colors.palette.gray,
    opacity: 0.6,
  },
  statusBadge: {
    paddingVertical: spacing.xxs,
    borderRadius: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
    minWidth: 80,
    alignItems: 'center',
  },
  completeJobButton: {
    backgroundColor: colors.primary,
    margin: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderRadius: spacing.md,
    marginHorizontal: spacing.md,
  },
});

const mapStateToProps = (state: RootState) => ({
  data: state.job.jobDetail,
  setting: state.setting.basic,
  loading: state.job.jobDetailLoading,
  hireJobLoading: state.job.hireJobLoading,
  completeJobLoading: state.job.completeJobLoading,
});

const mapDispatch = {
  get: getJobDetail,
  hireJob: (params: HireJobParams) => hireJob(params),
  completeJob: (params: CompleteJobParams) => completeJob(params),
};

const connector = connect(mapStateToProps, mapDispatch);

export const jobPostDetailsScreen = connector(JobPostDetails);
