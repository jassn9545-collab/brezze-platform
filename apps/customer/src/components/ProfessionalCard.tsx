import React, { FC } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { DiscoveryProfessional } from '../apis/discovery';
import { Currency } from '../config/defaults';
import { colors, images, spacing } from '../theme';
import { commonStyle } from '../theme/style';
import { Text } from './Text';

type ProfessionalCardProps = {
  professional: DiscoveryProfessional;
  onPress: () => void;
};

export const ProfessionalCard: FC<ProfessionalCardProps> = ({ professional, onPress }) => {
  const categories = professional.categories.filter(
    (category, index, items) =>
      items.findIndex(
        item =>
          item.id === category.id ||
          item.name.trim().toLowerCase() === category.name.trim().toLowerCase(),
      ) === index,
  );
  const profileTitle = professional.profile_title?.trim();
  const title =
    profileTitle || categories.map(category => category.name).join(' · ') || 'Service professional';
  const normalizedTitle = title.toLowerCase();
  const visibleCategories = profileTitle
    ? categories
        .filter(category => !normalizedTitle.includes(category.name.trim().toLowerCase()))
        .slice(0, 2)
    : [];

  return (
    <TouchableOpacity
      style={[styles.card, commonStyle.customShadow]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.cardContent}>
        <Image
          source={professional.profile_image ? { uri: professional.profile_image } : images.user}
          style={styles.profileImage}
        />

        <View style={styles.details}>
          <Text text={professional.name} weight="semiBold" />
          <Text text={title} size="xs" />

          {visibleCategories.length > 0 ? (
            <View style={styles.tagContainer}>
              {visibleCategories.map(category => (
                <View key={category.id} style={styles.tag}>
                  <Text text={category.name} size="xxs" />
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <Text text={`⭐ ${professional.rating || 'New'}`} />
      </View>

      <View style={styles.cardBottom}>
        <Text
          text={
            professional.starting_price
              ? `From ${Currency.code} ${Currency.sign}${professional.starting_price}`
              : `${professional.catalog_count} service${professional.catalog_count === 1 ? '' : 's'}`
          }
          size="xs"
        />

        <TouchableOpacity style={styles.profileBtn} onPress={onPress} accessibilityRole="button">
          <Text tx="home.viewProfile" size="xxs" weight="bold" style={styles.viewProfileText} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.palette.offWhite,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  cardContent: {
    flex: 1,
    gap: spacing.md,
    flexDirection: 'row',
  },
  details: { flex: 1 },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  tag: {
    backgroundColor: colors.palette.offWhite2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    marginRight: 5,
  },
  cardBottom: {
    gap: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileBtn: {
    borderRadius: spacing.xs,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.primaryDimmed,
  },
  viewProfileText: { color: colors.primary },
});
