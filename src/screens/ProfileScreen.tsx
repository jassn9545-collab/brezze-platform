
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, { FC, useEffect } from 'react';
import { Screen, Text, Loader, BackButtom } from '../components';
import { spacing,  images } from '../theme';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { getCustomerProfile } from '../slices/profile.slice';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigators/AppStack';

type Props = ConnectedProps<typeof connector>;

const ClientProfileScreen: FC<Props> = props => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { getCustomerProfile, customerProfile, customerProfileLoading,  } = props;
  useEffect(() => {
    getCustomerProfile();
  }, [getCustomerProfile]);

  console.log('Customer Profile Data:', customerProfile);
  console.log('Loading State:', customerProfileLoading);
  
  if (customerProfileLoading === 'loading') {
    return (
      <Screen preset="fixed" contentContainerStyle={styles.container}>
        <Loader loading={true} />
      </Screen>
    );
  }
  
  console.log(props.setting,"asa")




  
  return (
    <Screen preset="fixed" contentContainerStyle={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        {/* <View style={styles.header}> */}
          {/* <Text text="←" style={styles.back} /> */}
          {/* <Text text={customerProfile?.name || "Loading..."} weight="semiBold" /> */}
                  <BackButtom heading={customerProfile?.name} />
          
          {/* <Text text="⋮" style={styles.menu} /> */}
        {/* </View> */}

        {/* PROFILE */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={customerProfile?.profile_image ? { uri: props?.setting?.base_url + "/" + customerProfile.profile_image } : images.profile1} 
              style={styles.avatar} 
            />
            <View style={styles.tick}>
              <Text text="✓" style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }} />
            </View>
          </View>

          <Text text={customerProfile?.name || "Loading..."} weight="semiBold" style={styles.name} />

          <Text
            text={`📍 ${customerProfile?.street_address || "No address available"}`}
            size="xs"
            style={styles.gray}
            numberOfLines={2}
            ellipsizeMode="tail"
          />

          <View style={styles.verifiedBadge}>
            <Text text="VERIFIED CLIENT" size="xxs" style={{ color: '#0BAF6E' }} />
          </View>
        </View>

        {/* STATS */}
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text text={customerProfile?.total_jobs?.toString() || "0"} weight="semiBold" />
            <Text text="Job Posted" size="xxs" style={styles.gray} />
          </View>

          <View style={styles.statItem}>
            <Text text={`${customerProfile?.avg_rating || 0} ⭐`} weight="semiBold" />
            <Text text="Avg. Rating" size="xxs" style={styles.gray} />
          </View>

          <View style={styles.statItem}>
            <Text text={customerProfile?.refral_code || "N/A"} weight="semiBold" />
            <Text text="Referral Code" size="xxs" style={styles.gray} />
          </View>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.editBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text tx="profile.editProfile" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.postBtn}>
            <Text tx="profile.postAJob" style={{ color: '#fff' }} />
          </TouchableOpacity>
        </View>

        {/* JOB POSTING */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text text="Job Posting Summary" weight="semiBold" />
            <Text text="View All" style={styles.link} />
          </View>

          {customerProfile?.last3_jobs?.map((job: any) => (
            <View key={job.id} style={styles.jobCard}>
              <Image source={images.switchbox} style={styles.jobImage} />

              <Text
                text={job.title}
                weight="medium"
              />

              <View style={styles.jobRow}>
                <Text text={`Posted ${new Date(job.created_at).toLocaleDateString()}`} size="xs" style={styles.gray} />
                <Text text={job.status.toUpperCase()} size="xxs" style={styles.active} />
              </View>

              <View style={styles.jobRow}>
                <Text text={`${job.bids_count} Applicants applied`} size="xs" style={styles.gray} />
                <TouchableOpacity style={styles.viewBtn}>
                  <Text text="View Details" size="xs" style={{ color: '#fff' }} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* CURRENT HIRING */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text text="Current Hiring" weight="semiBold" />
            <Text text="View All" style={styles.link} />
          </View>

          {[1, 2].map((item) => (
            <View key={item} style={styles.hireCard}>
              <Image source={images.profile1} style={styles.hireImg} />

              <View style={{ flex: 1 }}>
                <Text text="Michael Rodriguez" weight="medium" />
                <Text text="Master Electrician" size="xs" style={styles.gray} />

                <View style={styles.chipsRow}>
                  <View style={styles.chip}>
                    <Text text="Wiring" size="xxs" />
                  </View>
                  <View style={styles.chip}>
                    <Text text="Emergency Repair" size="xxs" />
                  </View>
                </View>

                <Text text="Starting from $45/hr" size="xs" style={styles.gray} />
              </View>

              <View>
                <Text text="⭐ 4.9" size="xs" />
                <TouchableOpacity>
                  <Text text="View Profile" style={styles.link} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* REVIEWS */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text text="Reviews" weight="semiBold" />
            <Text text="See All (4.8)" style={styles.link} />
          </View>

          <View style={styles.reviewCard}>
            <Text text="Sarah Miller" weight="medium" />
            <Text text="⭐⭐⭐⭐⭐" />
            <Text
              text="Passionate about home appliances and repair work"
              size="xs"
              style={styles.gray}
            />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6F8' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    alignItems: 'center',
  },

  back: { fontSize: 18 },
  menu: { fontSize: 18 },

  profileSection: {
    alignItems: 'center',
  },

  avatarWrapper: { position: 'relative' },

  avatar: { width: 90, height: 90, borderRadius: 45 },

  tick: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2F80ED',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  name: { marginTop: 8 },

  gray: { color: '#777' },

  verifiedBadge: {
    marginTop: 6,
    backgroundColor: '#E6F7EF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  stats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: spacing.md,
    borderRadius: 10,
    padding: spacing.sm,
  },

  statItem: { flex: 1, alignItems: 'center' },

  buttonRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    gap: 10,
  },

  editBtn: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  postBtn: {
    flex: 1,
    backgroundColor: '#2F80ED',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  section: {
    backgroundColor: '#fff',
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 10,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  link: { color: '#2F80ED' },

  jobCard: { marginTop: 10 },

  jobImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginBottom: 8,
  },

  jobRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    alignItems: 'center',
  },

  active: {
    backgroundColor: '#D1FAE5',
    color: '#10B981',
    paddingHorizontal: 6,
    borderRadius: 6,
  },

  viewBtn: {
    backgroundColor: '#2F80ED',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  hireCard: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 10,
  },

  hireImg: { width: 50, height: 50, borderRadius: 8 },

  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 4,
  },

  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  reviewCard: {
    marginTop: 10,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
  },
});

const mapStateToProps = (state: RootState) => ({
  customerProfile: state.profile.customerProfile,
  customerProfileLoading: state.profile.customerProfileLoading,
  setting: state.setting.basic,
});

const mapDispatch = {
  getCustomerProfile,
};

const connector = connect(mapStateToProps, mapDispatch);

export const ProfileScreen = connector(ClientProfileScreen);