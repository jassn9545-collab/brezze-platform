import { BackButtom, Screen, Text } from '../components';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, { FC } from 'react';
import { spacing, images } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';

type Props = AppStackScreenProps<'HireHistoryDetails'>;

const HireHistoryDetails: FC<Props> = () => {

  return (
   <Screen preset="fixed" contentContainerStyle={styles.container}>
      
      {/* TOP CONTENT */}
      <View>
        <BackButtom heading="Hire history Details" />

        <View style={styles.card}>
          <View style={styles.row}>
            <Image source={images.profile1} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text text="Austin Butler" weight="semiBold" />
              <Text text="Master Electrician" size="xs" style={styles.gray} />
            </View>

            <View style={styles.badge}>
              <Text text="IN PROGRESS" size="xxs" style={{ color: '#2F6BFF' }} />
            </View>
          </View>

          <Text text="Fixed Amount: AUD $500.00" style={styles.amount} />
          <Text text="Pro: Robert Johnson • Oct 24, 2023" size="xs" style={styles.gray} />

          <Text text="Overall Progress" style={styles.progressLabel} />

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '65%' }]} />
          </View>
        </View>
      </View>

      {/* BOTTOM CONTENT */}
      <View>
        <View style={styles.chatBox}>
          <View>
            <Text text="Need to clarify something?" weight="semiBold" />
            <Text
              text="Message Robert directly for updates."
              size="xs"
              style={styles.gray}
            />
          </View>

          <TouchableOpacity style={styles.chatBtn}>
            <Text text="Chat" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text text="Pending Release:" style={styles.gray} />
          <Text text="$280.00 AUD" weight="semiBold" style={styles.price} />
        </View>

        <TouchableOpacity style={styles.primaryBtn}>
          <Text text="Release Payment" style={{ color: '#fff' }} />
        </TouchableOpacity>
      </View>

    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
  flex: 1,
  padding: spacing.md,
  backgroundColor: '#F5F6FA',
  justifyContent: 'space-between',
},

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: spacing.md,
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

  badge: {
    backgroundColor: '#D6E4FF',
    padding: 6,
    borderRadius: 6,
  },

  amount: {
    marginTop: spacing.sm,
    fontWeight: '600',
  },

  gray: {
    color: '#8A94A6',
    marginTop: 4,
  },

  progressLabel: {
    marginTop: spacing.md,
  },

  progressBar: {
    height: 6,
    backgroundColor: '#E0E3EB',
    borderRadius: 6,
    marginTop: 6,
  },

  progressFill: {
    height: 6,
    backgroundColor: '#2F6BFF',
    borderRadius: 6,
  },

  chatBox: {
    marginTop: spacing.lg,
    backgroundColor: '#E9EEF8',
    padding: spacing.md,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  chatBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },

  price: {
    color: '#2F6BFF',
  },

  primaryBtn: {
    marginTop: spacing.md,
    backgroundColor: '#2F6BFF',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  

});

export const HireHistoryDetailsScreen = HireHistoryDetails;