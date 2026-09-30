import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Screen, Text, Button, Loader } from '../components';
import { AppStackScreenProps } from '../navigators/AppStack';
import { useDispatch, useSelector } from 'react-redux';
import { submitReview, SubmitReviewParams } from '../slices/job.slice';
import { RootState, AppDispatch } from '../store';

type Props = AppStackScreenProps<'ReviewScreen'>;

export const ReviewScreen: React.FC<Props> = ({ navigation, route: _route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  
  const submitReviewLoading = useSelector((state: RootState) => state.job.submitReviewLoading);

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
  const handleSubmit = () => {
    const params: SubmitReviewParams = {
      project_id: "1",
      star: rating.toString(),
      review: review,
    };

    // API call
    dispatch(submitReview(params));
  };

  // Navigate back after successful submission
  React.useEffect(() => {
    if (submitReviewLoading === 'loaded') {
      navigation.goBack();
    }
  }, [submitReviewLoading, navigation]);

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

  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
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
  },
});