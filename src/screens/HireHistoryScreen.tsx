import { BackButtom, Screen, Text } from '../components';
import {
  StyleSheet,
  View,
  Image,
} from 'react-native';
import React, { FC } from 'react';
import { spacing, images, colors } from '../theme';
import { AppStackScreenProps } from '../navigators/AppStack';
import { translate } from '../i18n';

type Props = AppStackScreenProps<'HireHistory'>;

const HireHistory: FC<Props> = () => {

  const data = [
    { status: 'In Progress', color: '#2F6BFF' },
    { status: 'Completed', color: '#28A745' },
    { status: 'Completed', color: '#28A745' },
  ];

  return (
    <Screen preset="scroll" contentContainerStyle={styles.container}>
      
      <BackButtom heading={translate('hireHistory.heading')} />

      {data.map((item, index) => (
        <View key={index} style={styles.card}>

          <View style={styles.rowBetween}>
            <View style={styles.row}>
              <Image source={images.profile1} style={styles.avatar} />

              <View>
                <Text text="Austin Butler" weight="semiBold" />
                <Text text="Master Electrician" size="xs" style={styles.gray} />
              </View>
            </View>

            <View style={[styles.badge, { backgroundColor: item.color + '20' }]}>
              <Text text={item.status} size="xxs" style={[styles.badgeText, { color: item.color }]} />
            </View>
          </View>

          <View style={styles.rowBetween}>
            <View>
              <Text tx="hireHistory.amountPaid" size="xs" style={styles.gray} />
              <Text tx="hireHistory.payValue" weight="semiBold" />
            </View>

            <View>
              <Text tx="hireHistory.rating" size="xs" style={styles.gray} />
              <Text tx="hireHistory.ratingStars" />
            </View>
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
    padding: spacing.md,
    borderRadius: 16,
    marginBottom: spacing.md,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  gray: {
    color: colors.palette.grayText,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  badgeText: {
    fontWeight: 'bold',
  }

});

export const HireHistoryScreen = HireHistory;