import { BackButtom, Screen, Text } from '../components';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { FC } from 'react';
import { spacing, images, colors } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';
import { translate } from '../i18n';

type Props = AppStackScreenProps<'jobPostDetails'>;

const JobPostDetails: FC<Props> = (props) => {
  return (
    <Screen preset="scroll" contentContainerStyle={styles.container}>

      <BackButtom heading={translate('jobPostDetails.heading')} />

      {/* JOB CARD */}
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text text={translate('jobPostDetails.statusInProgress')} size="xxs" style={styles.statusText} />
        </View>

        <Text text={translate('jobPostDetails.title')} weight="semiBold" style={styles.title} />

        <Text text={translate('jobPostDetails.subtitle')} size="xs" style={styles.gray} />

        <View style={styles.tags}>
          <View style={styles.tag}><Text text={translate('jobPostDetails.tagContract')} size="xxs" /></View>
          <View style={styles.tag}><Text text={translate('jobPostDetails.tagExperience')} size="xxs" /></View>
          <View style={styles.tag}><Text text={translate('jobPostDetails.tagPayment')} size="xxs" /></View>
        </View>

        <Text text={translate('jobPostDetails.location')} size="xs" style={styles.gray} />
      </View>

      {/* PROPOSALS HEADER */}
      <View style={styles.rowBetween}>
        <Text text={translate('jobPostDetails.proposalsHeader')} weight="semiBold" />
        <Text text={translate('jobPostDetails.viewAll')} style={styles.link} />
      </View>

      {/* PROPOSAL LIST */}
      {[1,2,3].map((item) => (
        <View key={item} style={styles.proposalCard}>

          <View style={styles.row}>
            <Image source={images.profile1} style={styles.avatar} />

            <View style={styles.flex1}>
              <Text text="Marcus Thorne" weight="semiBold" />
              <Text text="⭐ 4.9 (124 reviews)" size="xs" style={styles.gray} />
            </View>

              <Text text={translate('jobPostDetails.price')} weight="semiBold" style={styles.price} />
          </View>

          <Text
            text={translate('jobPostDetails.bioQuote')}
            style={styles.gray}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.outlineBtn} onPress={()=> props.navigation.navigate('ProfessionalProfile')}>
              <Text text={translate('jobPostDetails.viewProfile')} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={()=> props.navigation.navigate('JobPostList')}>
              <Text text={translate('jobPostDetails.hire')} style={styles.primaryBtnText} />
            </TouchableOpacity>
          </View>

        </View>
      ))}

    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.md,
    backgroundColor: colors.palette.jobPostBackground,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
  },

  badge: {
    backgroundColor: colors.palette.startColor + '33',
    alignSelf: 'flex-start',
    padding: 6,
    borderRadius: 6,
  },

  title: {
    marginTop: spacing.sm,
  },

  gray: {
    color: colors.palette.grayText,
    marginTop: 4,
  },

  price: {
    color: colors.palette.primaryBlue,
  },

  primaryBtnText: {
    color: colors.palette.white,
  },

  tags: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },

  tag: {
    backgroundColor: colors.palette.offWhite2,
    padding: 6,
    borderRadius: 6,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },

  proposalCard: {
    backgroundColor: '#fff',
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
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

export const jobPostDetailsScreen = JobPostDetails;