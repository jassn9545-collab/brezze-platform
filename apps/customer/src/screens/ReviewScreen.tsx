import React, { useCallback, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen, Text, Button, Loader } from '../components';
import { AppStackScreenProps } from '../navigators/AppStack';
import { useDispatch, useSelector } from 'react-redux';
import { submitReview, SubmitReviewParams } from '../slices/job.slice';
import { RootState, AppDispatch } from '../store';
import api from '../apis/api';

type SubmittedReview = {
  id: number;
  star: number | string;
  review?: string | null;
  created_at?: string | null;
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
  const dispatch = useDispatch<AppDispatch>();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [status, setStatus] = useState<ReviewStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState(false);
  
  const submitReviewLoading = useSelector((state: RootState) => state.job.submitReviewLoading);

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

  // ⭐ Render Stars
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((item) => (
      <TouchableOpacity key={item} onPress={() => setRating(item)}>
        <Text style={item <= rating ? styles.activeStar : styles.star}>
          ★
        </Text>
      </TouchableOpacity>
    ));
  };

  // ✅ Submit
  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating required', 'Please select a star rating before submitting.');
      return;
    }

    const params: SubmitReviewParams = {
      project_id: route.params.jobId,
      star: rating.toString(),
      review: review.trim(),
    };

    try {
      const submittedReview = await dispatch(submitReview(params)).unwrap();
      setStatus({
        project_id: route.params.jobId,
        project_status: 'completed',
        can_review: false,
        has_reviewed: true,
        review: submittedReview as SubmittedReview,
      });
    } catch {
      // API errors are displayed by the shared request handler.
    }
  };

  if (statusLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0965BD" />
        <Text style={styles.statusMessage}>Checking review status...</Text>
      </Screen>
    );
  }

  if (statusError) {
    return (
      <Screen preset="fixed" contentContainerStyle={[styles.container, styles.centered]}>
        <Text style={styles.title}>Unable to check review</Text>
        <Text style={styles.statusMessage}>Please check your connection and try again.</Text>
        <Button text="Retry" style={styles.button} onPress={loadReviewStatus} />
        <Button text="Go Back" style={styles.secondaryButton} onPress={navigation.goBack} />
      </Screen>
    );
  }

  if (status?.has_reviewed && status.review) {
    const submittedRating = Number(status.review.star) || 0;

    return (
      <Screen preset="fixed" contentContainerStyle={[styles.container, styles.centered]}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        <Text style={styles.title}>Review Submitted</Text>
        <Text style={styles.statusMessage}>Your feedback has already been received.</Text>
        <View style={styles.starContainer}>
          {[1, 2, 3, 4, 5].map(item => (
            <Text key={item} style={item <= submittedRating ? styles.activeStar : styles.star}>
              ★
            </Text>
          ))}
        </View>
        {!!status.review.review && (
          <View style={styles.submittedReviewBox}>
            <Text style={styles.submittedReviewText}>{status.review.review}</Text>
          </View>
        )}
        <Button text="Done" style={styles.button} onPress={navigation.goBack} />
      </Screen>
    );
  }

  if (!status?.can_review) {
    return (
      <Screen preset="fixed" contentContainerStyle={[styles.container, styles.centered]}>
        <Text style={styles.title}>Review Unavailable</Text>
        <Text style={styles.statusMessage}>You can review this job after it is completed.</Text>
        <Button text="Go Back" style={styles.button} onPress={navigation.goBack} />
      </Screen>
    );
  }

  return (
    <Screen preset="fixed" contentContainerStyle={styles.container}>
      
      {/* TITLE */}
      <Text style={styles.title}>Rate Your Experience</Text>

      {/* STARS */}
      <View style={styles.starContainer}>
        {renderStars()}
      </View>

      {/* REVIEW INPUT */}
      <Text style={styles.label}>Write your review</Text>
      <TextInput
        placeholder="Share your experience..."
        value={review}
        onChangeText={setReview}
        multiline
        style={styles.input}
      />

      {/* BUTTON */}
      <Button
        text="Submit Review"
        style={styles.button}
        onPress={handleSubmit}
      />

      <Loader loading={submitReviewLoading === 'loading'} />

    </Screen>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F4F6F8',
  },

  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
  },

  statusMessage: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },

  successIcon: {
    alignItems: 'center',
    backgroundColor: '#E8F5EE',
    borderRadius: 36,
    height: 72,
    justifyContent: 'center',
    marginBottom: 4,
    width: 72,
  },

  checkmark: {
    color: '#198754',
    fontSize: 38,
    fontWeight: '700',
  },

  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 30,
  },

  star: {
    fontSize: 35,
    color: '#ccc',
    marginHorizontal: 5,
  },

  activeStar: {
    fontSize: 35,
    color: '#FFD700',
    marginHorizontal: 5,
  },

  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#333',
  },

  input: {
    height: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
    textAlignVertical: 'top',
  },

  button: {
    marginTop: 30,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    width: '100%',
  },

  secondaryButton: {
    backgroundColor: '#667085',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    marginTop: 12,
    width: '100%',
  },

  submittedReviewBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    width: '100%',
  },

  submittedReviewText: {
    color: '#333333',
    fontSize: 15,
    lineHeight: 22,
  },
});
