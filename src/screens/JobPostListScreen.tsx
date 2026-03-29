import { BackButtom, Screen, Text } from '../components';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { FC } from 'react';
import { spacing, images, colors } from '../theme';
import { translate } from '../i18n';
import { AppStackScreenProps } from '../navigators/AppStack';

type NavigationProps = AppStackScreenProps<'JobPostList'>;
type Props = NavigationProps;

const JobPostList: FC<Props> = (props) => {

  const jobs = [
    {
      status: 'IN PROGRESS',
      title: 'Master Electrician for House Pipe Fitting',
      location: '42 Hubbard Street, Victoria',
      proposals: '15 Received',
      time: 'Posted 2 days ago',
      type: 'progress',
    },
    {
      status: 'PENDING REVIEW',
      title: 'Washing Machine Repair Technician',
      location: 'Franklin Avenue at 3rd St.',
      proposals: '4 Received',
      time: 'Posted 4 hours ago',
      type: 'pending',
    },
    {
      status: 'DRAFT',
      title: 'Emergency Lighting Installation...',
      location: 'Location not set',
      proposals: 'No proposals yet',
      time: 'Saved Yesterday',
      type: 'draft',
    },
  ];

  const getStatusStyle = (type: string) => {
    switch (type) {
      case 'progress':
        return { backgroundColor: colors.palette.startColor + '33', color: colors.palette.primaryBlue };
      case 'pending':
        return { backgroundColor: colors.palette.centerColor + '33', color: colors.palette.warning || '#FEF3C7' };
      default:
        return { backgroundColor: colors.palette.lightGray, color: colors.palette.grayLight2 || '#666' };
    }
  };

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={styles.container}
      safeAreaEdges={['top']}
    >
      {/* HEADER */}
      <BackButtom heading={translate('jobPostList.heading')} />

      <View style={styles.main}>
        {/* LIST */}
        {jobs.map((item, index) => {
          const statusStyle = getStatusStyle(item.type);

          return (
            <View key={index} style={styles.card}>

              {/* TOP ROW */}
              <View style={styles.topRow}>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                  <Text text={item.status} size="xxs" style={{ color: statusStyle.color }} />
                </View>
                <Text text={item.time} size="xxs" style={styles.timeText} />
              </View>

              {/* TITLE */}
              <Text text={item.title} weight="semiBold" style={styles.title} />

              {/* LOCATION */}
              <Text text={item.location} size="xs" style={styles.location} />

              {/* BOTTOM ROW */}
              <View style={styles.bottomRow}>

                {/* Avatars */}
                <View style={styles.avatarRow}>
                  <Image source={images.profile1} style={styles.avatar} />
                  <Image source={images.profile2} style={styles.avatar} />
                  <View style={styles.plusAvatar}>
                    <Text text="+12" size="xxs" style={{ color: colors.palette.white }} />
                  </View>
                </View>

                {/* Proposals */}
                <View style={styles.alignRight}>
                  <Text tx="jobPostList.proposals" size="xxs" style={styles.proposalLabel} />
                  <Text
                    text={item.proposals}
                    weight="semiBold"
                    style={[
                      styles.proposalText,
                      item.type === 'draft' && styles.proposalDraftText,
                    ]}
                  />
                </View>
              </View>

              {/* Draft Button */}
              {/* {item.type === 'draft' && ( */}
              <TouchableOpacity style={styles.draftBtn}>
                <Text tx="jobPostList.completeButton" style={styles.draftBtnText} onPress={() => props.navigation.navigate('jobPostDetails')} />
              </TouchableOpacity>
              {/* )} */}

            </View>
          );
        })}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({

  container: {
    flexGrow: 1,

    backgroundColor: colors.palette.jobPostBackground,
  },
  main: {
    marginHorizontal: spacing.md,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  timeText: {
    color: colors.palette.grayText,
  },

  title: {
    marginTop: spacing.sm,
  },

  location: {
    marginTop: 4,
    color: colors.palette.grayText,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },

  avatarRow: {
    flexDirection: 'row',
  },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: -8,
  },

  plusAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.palette.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },

  proposalLabel: {
    color: colors.palette.grayText,
  },

  proposalText: {
    color: colors.palette.primaryBlue,
  },

  proposalDraftText: {
    color: colors.palette.grayLight3 || '#999',
  },

  alignRight: {
    alignItems: 'flex-end',
  },

  draftBtn: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.palette.primaryBlue,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },

  draftBtnText: {
    color: colors.palette.primaryBlue,
  },

});

export const jobPostListScreen = JobPostList;