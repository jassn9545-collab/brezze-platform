import { Button, Screen, Text } from '../components';
import { Image, StyleSheet, View } from 'react-native';
import React, { FC, useCallback, useRef } from 'react';
import { colors, images, spacing } from '../theme';
import { TxKeyPath } from '../i18n';
import { AuthStackScreenProps } from '../navigators';
import { commonStyle } from '../theme/style';
import { useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkVerificationStatus } from '../slices/auth.slice';

interface Progress {
  id: number;
  review: boolean;
  text: TxKeyPath;
}

const progressList: Progress[] = [
  {
    id: 1,
    review: true,
    text: 'review.review1',
  },
  {
    id: 2,
    review: true,
    text: 'review.review2',
  },
  {
    id: 3,
    review: true,
    text: 'review.review3',
  },
];
type NavigationProps = AuthStackScreenProps<'DocumentReview'>;

const DocumentReview: FC<NavigationProps> = () => {
  const dispatch = useAppDispatch();
  const checkingRef = useRef(false);
  const checking = useAppSelector(
    state => state.auth.verificationStatusLoading === 'loading',
  );

  const refreshStatus = useCallback(async () => {
    if (checkingRef.current) {
      return;
    }
    checkingRef.current = true;
    try {
      await dispatch(checkVerificationStatus()).unwrap();
    } finally {
      checkingRef.current = false;
    }
  }, [dispatch]);

  useFocusEffect(
    useCallback(() => {
      refreshStatus();
      const timer = setInterval(refreshStatus, 5000);
      return () => clearInterval(timer);
    }, [refreshStatus]),
  );

  return (
    <Screen
      preset="auto"
      contentContainerStyle={styles.containerStyle}
      safeAreaEdges={['top']}
    >
      <View style={styles.main}>
        <Text size="md" weight="semiBold" tx="review.heading" />
        <Text size="sm" weight="light" tx="review.description" />

        <Text
          tx="review.progress"
          size="sm"
          weight="medium"
          style={styles.primaryColor}
        />

        <View style={[styles.progressContainer, commonStyle.customShadow]}>
          {progressList.map((item, index) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.row}>
                <Image
                  source={item.review ? images.smallTick : images.waitingIcon}
                />
                {index !== progressList.length - 1 && (
                  <View style={styles.line} />
                )}
              </View>
              <Text tx={item.text} size="sm" style={styles.flex} />
            </View>
          ))}
        </View>
        <Button
          text={checking ? 'Checking status...' : 'Check verification status'}
          disabled={checking}
          onPress={refreshStatus}
          style={styles.refreshButton}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    flexGrow: 1,
  },
  main: {
    gap: spacing.xxs,
    margin: spacing.md,
  },
  primaryColor: {
    color: colors.primary,
    marginTop: spacing.xs,
  },
  progressContainer: {
    padding: spacing.md,
    marginTop: spacing.sm,
    backgroundColor: colors.background,
  },
  refreshButton: {
    marginTop: spacing.lg,
  },
  card: {
    gap: spacing.sm,
    flexDirection: 'row',
  },
  row: {
    gap: spacing.sm,
    alignItems: 'center',
  },
  flex: {
    flex: 1,
  },
  line: {
    width: 2,
    flexGrow: 1,
    minHeight: 28,
    marginTop: spacing.xxs,
    marginBottom: spacing.md,
    backgroundColor: colors.primary,
  },
});

export const DocumentReviewScreen = DocumentReview;
