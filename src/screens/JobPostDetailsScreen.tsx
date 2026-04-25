import { BackButtom, Loader, ReadMore, Screen, Text } from '../components';
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
import { getJobDetail, hireJob, HireJobParams } from '../slices/job.slice';
import FastImage from '@d11/react-native-fast-image';
import ListEmptyComponent from '../components/ListEmptyComponent';
import { BasicData } from '../slices/setting.slice';

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

  const onPressProfile = (_data: Bid) => {
    // console.log(_data,"_data")
    // Alert.alert("Profile", "Profile clicked");
    props.navigation.navigate('ProfessionalProfile', {id: _data.user_id});
  };

  const onPressHire = (data: Bid) => {
    props.hireJob({ job_id: props.route.params?.id, bid_id: data.id });
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
          {props.data && <JobCard item={props.data!} />}

          {props.data?.status === 'active' && (
            <>
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
                  />
                )}
                ListEmptyComponent={
                  <View style={styles.empty}>
                    <ListEmptyComponent tx="common.noDataFound" />
                  </View>
                }
              />
            </>
          )}
        </View>
      </Screen>
      <Loader
        loading={
          props.hireJobLoading === 'loading' || props.loading === 'loading'
        }
      />
    </>
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

      <Text size="xxs" weight="medium" text={item.address} />
    </View>
  );
};

type BidCardProps = ListRenderItemInfo<Bid> & {
  setting: BasicData;
  onPressProfile: (data: Bid) => void;
  onPressHire: (data: Bid) => void;
};



const BidCard = ({
  item,
  setting,
  onPressProfile,
  onPressHire,
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

          <View style={styles.spaceBetween}>

            <Text
              size="xxs"
              text={item.work_description}
            />
          </View>
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
              style={styles.primaryBtn}
              onPress={() => onPressHire(item)}
            >
              <Text
                size="xxs"
                weight="semiBold"
                tx="jobPostDetails.hire"
                txOptions={{
                  value: item.freelancer_name.split(' ')[0],
                }}
                numberOfLines={1}
                style={{ color: colors.palette.white }}
              />
            </TouchableOpacity>
          </View>
        </View>
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
});

const mapStateToProps = (state: RootState) => ({
  data: state.job.jobDetail,
  setting: state.setting.basic,
  loading: state.job.jobDetailLoading,
  hireJobLoading: state.job.hireJobLoading,
});

const mapDispatch = {
  get: getJobDetail,
  hireJob: (params: HireJobParams) => hireJob(params),
};

const connector = connect(mapStateToProps, mapDispatch);

export const jobPostDetailsScreen = connector(JobPostDetails);
