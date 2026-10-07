import React, { FC, useCallback, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';
import { getPrivacyPolicy, PrivacyPolicy } from '../apis/account';
import { BackButtom, Button, Screen, Text } from '../components';
import { colors, images, spacing } from '../theme';

export const PrivacyPolicyScreen: FC = () => {
  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      setPolicy(await getPrivacyPolicy());
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load().catch(() => undefined);
  }, [load]));

  return (
    <Screen preset="scroll" safeAreaEdges={['top', 'bottom']} contentContainerStyle={styles.container}>
      <BackButtom heading="Privacy policy" />
      <View style={styles.divider} />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : loadError || !policy ? (
        <View style={styles.errorState}>
          <Text text="Privacy policy could not be loaded." style={styles.body} />
          <Button text="Retry" onPress={load} style={styles.retry} />
        </View>
      ) : (
        <View style={styles.content}>
          <Text text={`Updated ${moment(policy.updated_at).format('MMMM D, YYYY')}`} size="xxs" style={styles.updated} />
          <Text text={policy.title} weight="bold" size="xl" style={styles.pageTitle} />
          <Text text={policy.intro} size="sm" style={styles.body} />

          {policy.sections.map(section => (
            <View key={section.title} style={styles.section}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.iconWrap}>
                  <Image source={images.privacyIcon} style={styles.icon} />
                </View>
                <Text text={section.title} weight="bold" size="xl" style={styles.sectionTitle} />
              </View>
              {section.paragraphs.map((paragraph, index) => (
                <Text key={`${section.title}-${index}`} text={paragraph} size="sm" style={styles.paragraph} />
              ))}
            </View>
          ))}

          {policy.rights.map(right => (
            <View key={right.title} style={styles.rightCard}>
              <Text text={right.title} weight="bold" />
              <Text text={right.description} size="sm" style={styles.rightDescription} />
            </View>
          ))}

          <Text text="Contact Us" weight="bold" size="lg" style={styles.contactTitle} />
          <Text text="If you have questions about this Privacy Policy or want to exercise a privacy right, contact us at:" size="sm" style={styles.body} />
          <Text text={policy.contact_email} weight="semiBold" style={styles.email} selectable />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingBottom: spacing.xl, backgroundColor: colors.background },
  divider: { height: 1, marginHorizontal: spacing.md, backgroundColor: colors.palette.borderGray },
  loader: { marginTop: spacing.xl },
  content: { padding: spacing.md },
  updated: { alignSelf: 'flex-start', color: colors.primary, backgroundColor: colors.primaryDimmed, borderRadius: 10, paddingHorizontal: spacing.xs, paddingVertical: 3 },
  pageTitle: { marginTop: spacing.md, color: '#172033' },
  body: { marginTop: spacing.xs, color: '#657084', lineHeight: 22 },
  section: { marginTop: spacing.lg },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconWrap: { width: 32, height: 32, borderRadius: spacing.xxs, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  icon: { width: 18, height: 18, tintColor: colors.palette.white },
  sectionTitle: { flex: 1, color: '#172033' },
  paragraph: { marginTop: spacing.sm, color: '#657084', lineHeight: 22 },
  rightCard: { marginTop: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: '#DDE3EC', borderRadius: spacing.xs },
  rightDescription: { marginTop: spacing.xxs, color: '#657084', lineHeight: 21 },
  contactTitle: { marginTop: spacing.lg, color: '#172033' },
  email: { marginTop: spacing.sm, color: colors.primary },
  errorState: { alignItems: 'center', padding: spacing.xl },
  retry: { width: 120, minHeight: 44, marginTop: spacing.md },
});
