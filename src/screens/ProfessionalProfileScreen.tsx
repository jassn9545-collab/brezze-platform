import { BackButtom, Screen, Text } from '../components';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { FC } from 'react';
import { spacing, images, colors } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';

type Props = AppStackScreenProps<'ProfessionalProfile'>;

const ProfessionalProfile: FC<Props> = () => {
  return (
    <Screen preset="fixed" contentContainerStyle={styles.container}>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.headerRow}>
          <BackButtom heading="Austin Butler" />
          <TouchableOpacity style={styles.menuBtn}>
            <Text text="⋮" style={styles.menuIcon} />
          </TouchableOpacity>
        </View>

        {/* PROFILE */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image source={images.profile1} style={styles.avatar} />
            <View style={styles.verifiedBadge}>
              <Text text="✓" style={styles.verifiedIcon} />
            </View>
          </View>
          <Text text="Austin Butler" weight="semiBold" style={styles.name} />
          <Text text="42 Hebbard Street, Victoria" size="xs" style={styles.gray} />

          <View style={styles.badge}>
            <Text tx="professionalProfile.topRated" size="xxs" style={styles.topRatedText} />
          </View>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text text="$40K+" weight="semiBold" />
            <Text tx="professionalProfile.totalEarnings" size="xxs" style={styles.gray} />
          </View>

          <View style={styles.statBox}>
            <Text text="450" weight="semiBold" />
            <Text tx="professionalProfile.totalJobs" size="xxs" style={styles.gray} />
          </View>

          <View style={styles.statBox}>
            <Text text="98%" weight="semiBold" />
            <Text tx="professionalProfile.jobSuccess" size="xxs" style={styles.gray} />
          </View>
        </View>
        {/* TITLE */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text tx="professionalProfile.specialist" weight="semiBold" style={styles.specialistText} />
            <Text text="$45.00/hr" style={styles.rateText} />
          </View>

          <Text
            tx="professionalProfile.description"
            size="xs"
            style={styles.gray}
          />
          <TouchableOpacity>
            <Text tx="professionalProfile.more" size="xs" style={styles.moreLink} />
          </TouchableOpacity>
        </View>

        {/* SERVICES */}
        <View style={styles.section}>
          <Text tx="professionalProfile.services" weight="semiBold" />

          <View style={styles.chipsRow}>
            {[
              { key: 'housePipeFitting', tx: 'professionalProfile.housePipeFitting' as const, text: images.greenCheckIcon },
              { key: 'wireFitting', tx: 'professionalProfile.wireFitting' as const, text: images.greenCheckIcon },
              { key: 'switchInstall', tx: 'professionalProfile.switchInstall' as const, text: images.greenCheckIcon },
              { key: 'homeAppliancesInstall', tx: 'professionalProfile.homeAppliancesInstall' as const, text: images.greenCheckIcon }
            ].map((item) => (
              <View key={item.key} style={styles.chip}>
                <Text tx={item.tx} size="xxs" />
                <Image source={item.text} style={styles.checkIcon} />

              </View>
            ))}
          </View>
        </View>

        {/* SERVICE CATALOG */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text tx="professionalProfile.serviceCatalog" weight="semiBold" />
            <Text tx="professionalProfile.viewAll" style={styles.seeAllLink} />
          </View>

          {[1,2].map((item) => (
            <View key={item} style={styles.catalogCard}>

              <View style={styles.catalogContent}>
                <Text tx={item === 1 ? "professionalProfile.switchboxInstallation" : "professionalProfile.acSwitchboxInstallation"} weight="medium" />
                <Text text={item === 1 ? "AUD $49.00 | 30 mins" : "AUD $59.00 | 45 mins"} size="xs" style={styles.gray} />

                <View style={styles.serviceBtnContainer}>
                  <TouchableOpacity style={item === 1 ? styles.selectedServiceBtn : styles.addServiceBtn}>
                    <Text tx={item === 1 ? "professionalProfile.selected" : "professionalProfile.addService"} size="xs" style={item === 1 ? styles.selectedBtnText : styles.addBtnText} />
                  </TouchableOpacity>
                </View>
              </View>
             

              <Image source={item === 1 ? images.switchbox : images.switchbox} style={styles.catalogImage} />
            </View>
          ))}
        </View>

        {/* REVIEWS */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text tx="professionalProfile.reviews" weight="semiBold" />
            <Text tx="professionalProfile.seeAll" style={styles.seeAllLink} />
          </View>

          {[1,2].map((item) => (
            <View key={item} style={styles.reviewCard}>
              <Text tx="professionalProfile.sarahMiller" weight="medium" />
              <Text text="⭐⭐⭐⭐⭐" />
              <Text
                tx="professionalProfile.reviewText"
                size="xs"
                style={styles.gray}
              />
            </View>
          ))}
        </View>

      </ScrollView>

      {/* FOOTER BUTTON */}
      <TouchableOpacity style={styles.hireBtn}>
        <Text tx="professionalProfile.hireNow" weight="semiBold" style={{ color: '#fff' }} />
      </TouchableOpacity>

    </Screen>
  );
};

const styles = StyleSheet.create({

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },

  menuBtn: {
    padding: spacing.sm,
  },

  menuIcon: {
    fontSize: 20,
    color: '#333',
  },

  avatarContainer: {
    position: 'relative',
  },

  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.palette.green,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.palette.white,
  },

  verifiedIcon: {
    color: colors.palette.white,
    fontSize: 10,
    fontWeight: 'bold',
  },

  checkIcon: {
    color: colors.palette.green,
    fontSize: 12,
    marginRight: 4,
  },

  moreLink: {
    color: colors.palette.primaryBlue,
    marginTop: 4,
  },

  specialistText: {
    flex: 1,
    marginRight: spacing.sm,
  },

  rateText: {
    color: colors.palette.primaryBlue,
    flexShrink: 0,
  },

  catalogBtnText: {
    color: colors.palette.primaryBlue,
  },

  seeAllLink: {
    color: colors.palette.primaryBlue,
  },

  topRatedText: {
    color: colors.palette.green,
  },

  container: {
    flex: 1,
    backgroundColor: colors.palette.jobPostBackground,
  },

  profileContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },

  name: {
    marginTop: spacing.sm,
  },

  gray: {
    color: colors.palette.grayText,
  },

  badge: {
    backgroundColor: colors.palette.transparentGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: spacing.xs,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: spacing.md,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: spacing.sm,
  },

  statBox: {
    alignItems: 'center',
    flex: 1,
  },

  section: {
    backgroundColor: colors.palette.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },

  chip: {
    backgroundColor: colors.palette.offWhite2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },

  catalogCard: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    backgroundColor: colors.palette.offWhite,
    padding: spacing.sm,
    borderRadius: 10,
  },

  catalogContent: {
    flex: 1,
  },

  catalogImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },

  serviceBtnContainer: {
    alignItems: 'flex-start',
  },

  selectedServiceBtn: {
    marginTop: spacing.xs,
    backgroundColor: '#09B285',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },

  addServiceBtn: {
    marginTop: spacing.xs,
    backgroundColor: colors.palette.primarylight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },

  selectedBtnText: {
    color: colors.palette.white,
    fontWeight: '500',
    fontSize: 10,
  },

  addBtnText: {
    color: colors.palette.primaryColor,
    fontWeight: '500',
    fontSize: 10,
  },

  reviewCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.palette.offWhite,
    padding: spacing.sm,
    borderRadius: 10,
  },

  hireBtn: {
    margin: spacing.md,
    backgroundColor: colors.palette.primaryBlue,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

});

export const ProfessionalProfileScreen = ProfessionalProfile;