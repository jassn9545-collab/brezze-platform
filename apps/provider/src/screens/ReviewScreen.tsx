import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BackButtom, Button, Loader, Screen, Text } from '../components';
import { AppStackScreenProps } from '../navigators';
import api from '../apis/api';
import URLs from '../config/urls';
import { colors, spacing } from '../theme';

type SubmittedReview = {
  id: number;
  star: number | string;
  review?: string | null;
};

type ReviewStatus = {
  project_id: number;
  project_status: string;
  can_review: boolean;
  has_reviewed: boolean;
  review: SubmittedReview | null;
};

type Props = AppStackScreenProps<'ReviewScreen'>;

export const ReviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [status, setStatus] = useState<ReviewStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadReviewStatus = useCallback(async () => {
    setStatusLoading(true);
    setStatusError(false);

    try {
      const response = await api.get(`/reviews/projects/${route.params.jobId}`);
      setStatus(response.data.data as ReviewStatus);
    } catch {
      setStatusError(true);
    } finally {
      setStatusLoading(false);
    }
  }, [route.params.jobId]);

  useFocusEffect(
    useCallback(() => {
      loadReviewStatus();
    }, [loadReviewStatus]),
  );

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please select a star rating before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(URLs.submitReview, {
        project_id: route.params.jobId,
        star: rating,
        review: review.trim(),
      });
      setStatus({
        project_id: route.params.jobId,
        project_status: 'completed',
        can_review: false,
        has_reviewed: true,
        review: response.data.data as SubmittedReview,
      });
    } catch {
      // The shared API client displays the server error.
    } finally {
      setSubmitting(false);
    }
  };

  const stars = (selectedRating: number, interactive = false) =>
    [1, 2, 3, 4, 5].map(item => {
      const star = (
        <Text key={item} style={item <= selectedRating ? styles.activeStar : styles.star}>
          {'\u2605'}
        </Text>
      );

      return interactive ? (
        <TouchableOpacity
          key={item}
          onPress={() => setRating(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item} star rating`}
        >
          {star}
        </TouchableOpacity>
      ) : star;
    });

  if (statusLoading) {
    return (
      <Screen preset="fixed" safeAreaEdges={['top']} contentContainerStyle={styles.container}>
        <BackButtom heading="Review Customer" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text text="Checking review status..." style={styles.statusMessage} />
        </View>
      </Screen>
    );
  }

  if (statusError) {
    return (
      <Screen preset="fixed" safeAreaEdges={['top']} contentContainerStyle={styles.container}>
        <BackButtom heading="Review Customer" />
        <View style={styles.centered}>
          <Text text="Unable to check review" style={styles.title} />
          <Text text="Please check your connection and try again." style={styles.statusMessage} />
          <Button text="Retry" style={styles.button} onPress={loadReviewStatus} />
        </View>
      </Screen>
    );
  }

  if (status?.has_reviewed && status.review) {
    const submittedRating = Number(status.review.star) || 0;
    return (
      <Screen preset="fixed" safeAreaEdges={['top']} contentContainerStyle={styles.container}>
        <BackButtom heading="Review Customer" />
        <View style={styles.centered}>
          <View style={styles.successIcon}>
            <Text text="\u2713" style={styles.checkmark} />
          </View>
          <Text text="Review Submitted" style={styles.title} />
          <Text text="Your feedback has already been received." style={styles.statusMessage} />
          <View style={styles.starContainer}>{stars(submittedRating)}</View>
          {!!status.review.review && (
            <View style={styles.submittedReviewBox}>
              <Text text={status.review.review} style={styles.submittedReviewText} />
            </View>
          )}
          <Button text="Done" style={styles.button} onPress={navigation.goBack} />
        </View>
      </Screen>
    );
  }

  if (!status?.can_review) {
    return (
      <Screen preset="fixed" safeAreaEdges={['top']} contentContainerStyle={styles.container}>
        <BackButtom heading="Review Customer" />
        <View style={styles.centered}>
          <Text text="Review Unavailable" style={styles.title} />
          <Text text="You can review this job after it is completed." style={styles.statusMessage} />
          <Button text="Go Back" style={styles.button} onPress={navigation.goBack} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen preset="auto" safeAreaEdges={['top']} contentContainerStyle={styles.container}>
      <BackButtom heading="Review Customer" />
      <Text text="Rate Your Experience" style={styles.title} />
      <View style={styles.starContainer}>{stars(rating, true)}</View>
      <Text text="Write your review" style={styles.label} />
      <TextInput
        placeholder="Share your experience with this customer..."
        placeholderTextColor={colors.textDim}
        value={review}
        onChangeText={setReview}
        multiline
        style={styles.input}
      />
      <Button
        text="Submit Review"
        style={styles.button}
        disabled={submitting}
        onPress={handleSubmit}
      />
      <Loader loading={submitting} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  statusMessage: {
    color: colors.textDim,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  successIcon: {
    alignItems: 'center',
    backgroundColor: colors.palette.dimGreen,
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  checkmark: {
    color: colors.palette.green,
    fontSize: 38,
    fontWeight: '700',
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  star: {
    fontSize: 35,
    color: colors.palette.darkGray1,
    marginHorizontal: spacing.xxs,
  },
  activeStar: {
    fontSize: 35,
    color: '#FFD700',
    marginHorizontal: spacing.xxs,
  },
  label: {
    fontSize: 14,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  input: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.separator,
    borderRadius: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.palette.white,
    color: colors.text,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: spacing.xl,
    borderRadius: spacing.sm,
    width: '100%',
  },
  submittedReviewBox: {
    backgroundColor: colors.palette.white,
    borderColor: colors.separator,
    borderRadius: spacing.sm,
    borderWidth: 1,
    padding: spacing.md,
    width: '100%',
  },
  submittedReviewText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
