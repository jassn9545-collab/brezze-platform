import React, { FC, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { DiscoveryProfessional, getDiscovery } from '../apis/discovery';
import { BackButtom, SafeRemoteImage, Screen, Text, TextField } from '../components';
import { AppBottomTabScreenProps } from '../navigators/BottomTabNavigator';
import { colors, images } from '../theme';

type Props = AppBottomTabScreenProps<'FeaturedProfessionals'>;

const FeaturedProfessionals: FC<Props> = props => {
  const [professionals, setProfessionals] = useState<DiscoveryProfessional[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;

    getDiscovery()
      .then(data => {
        if (active) setProfessionals(data.professionals);
      })
      .catch(() => {
        if (active) setProfessionals([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const visibleProfessionals = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return professionals;

    return professionals.filter(item =>
      [
        item.name,
        item.profile_title,
        item.profile_description,
        item.location,
        ...item.categories.map(category => category.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(search),
    );
  }, [professionals, query]);

  return (
    <Screen
      preset="fixed"
      backgroundColor="#F7F8FA"
      contentContainerStyle={styles.container}
      safeAreaEdges={['top']}
    >
      <BackButtom
        heading="Featured Professional"
        style={styles.header}
        onBackPress={() => props.navigation.goBack()}
      />

      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Image source={images.searchIcon} style={styles.searchIcon} />
          <TextField
            placeholder="Search for professionals..."
            containerStyle={styles.searchField}
            inputWrapperStyle={styles.searchInputWrapper}
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      <FlatList
        data={visibleProfessionals}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <FeaturedProfessionalCard
            professional={item}
            onPress={() => props.navigation.navigate('ProfessionalProfile', { id: item.id })}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loading} />
          ) : (
            <Text text="No professionals found." style={styles.emptyText} />
          )
        }
      />
    </Screen>
  );
};

type FeaturedProfessionalCardProps = {
  professional: DiscoveryProfessional;
  onPress: () => void;
};

const FeaturedProfessionalCard: FC<FeaturedProfessionalCardProps> = ({
  professional,
  onPress,
}) => {
  const title =
    professional.profile_title ||
    professional.categories.map(category => category.name).join(' · ') ||
    'Service professional';
  const topRated = professional.is_top_rated;

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.profileRow} onPress={onPress} accessibilityRole="button">
        <View style={styles.imageWrap}>
          <SafeRemoteImage
            uri={professional.profile_image}
            fallback={images.user}
            style={styles.profileImage}
          />
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.profileDetails}>
          <View style={styles.nameRow}>
            <Text
              text={professional.name}
              weight="semiBold"
              size="sm"
              style={styles.name}
              numberOfLines={1}
            />
            {professional.is_verified ? (
              <View style={styles.verifiedBadge}>
                <Image source={images.checkIcon} style={styles.verifiedIcon} />
              </View>
            ) : null}
          </View>

          <View style={[styles.expertBadge, topRated ? styles.topRatedBadge : styles.newExpertBadge]}>
            <Text
              text={topRated ? 'TOP RATED' : 'NEW EXPERT'}
              weight="semiBold"
              style={topRated ? styles.topRatedText : styles.newExpertText}
            />
          </View>

          <Text text={title} size="xxs" style={styles.profileTitle} numberOfLines={1} />
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text text={String(professional.total_jobs)} weight="semiBold" size="md" />
          <Text text="TOTAL JOBS" weight="medium" style={styles.statLabel} />
        </View>
        <View style={styles.verticalDivider} />
        <View style={styles.statBox}>
          <Text text={`${professional.job_success_score}%`} weight="semiBold" size="md" />
          <Text text="SUCCESS RATE" weight="medium" style={styles.statLabel} />
        </View>
      </View>

      <TouchableOpacity style={styles.hireButton} onPress={onPress} accessibilityRole="button">
        <Text text="Hire Now" weight="medium" size="xs" style={styles.hireButtonText} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F7F8FA',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.palette.white,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: { width: 16, height: 16 },
  searchField: {
    flex: 1,
    marginLeft: 10,
  },
  searchInputWrapper: {
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  searchInput: {
    marginVertical: 0,
    marginHorizontal: 0,
    padding: 0,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.palette.white,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageWrap: {
    width: 64,
    height: 64,
    marginRight: 12,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  onlineDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.palette.white,
    backgroundColor: colors.palette.green,
  },
  profileDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flexShrink: 1,
    color: '#111827',
  },
  verifiedBadge: {
    width: 13,
    height: 13,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
  },
  verifiedIcon: {
    width: 8,
    height: 8,
    tintColor: colors.palette.white,
  },
  expertBadge: {
    alignSelf: 'flex-start',
    marginTop: 5,
    marginBottom: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  topRatedBadge: { backgroundColor: '#FFF3DD' },
  newExpertBadge: { backgroundColor: '#EAF3FF' },
  topRatedText: { color: '#F59E0B', fontSize: 9, lineHeight: 12 },
  newExpertText: { color: '#1473E6', fontSize: 9, lineHeight: 12 },
  profileTitle: { color: '#8A8F99' },
  divider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: '#EFF0F2',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    marginTop: 1,
    color: '#9CA3AF',
    fontSize: 9,
    lineHeight: 13,
    letterSpacing: 0.4,
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#EFF0F2',
  },
  hireButton: {
    height: 48,
    marginTop: 18,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#075FEA',
  },
  hireButtonText: { color: colors.palette.white },
  loading: { marginTop: 40 },
  emptyText: { textAlign: 'center', marginTop: 40, color: colors.textDim },
});

export const FeatureScreen = FeaturedProfessionals;
