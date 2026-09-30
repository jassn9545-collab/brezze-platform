import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Screen, Button } from '../components';
import { AppStackScreenProps } from '../navigators/AppStack';
import { navigationRef } from '../navigators';

type Props = AppStackScreenProps<'JobCompleted'>;

export const JobCompletedScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <Screen preset="fixed" contentContainerStyle={styles.container}>
      
      {/* ICON */}
      <View style={styles.iconContainer}>
        <View style={styles.circle}>
          <Text style={styles.check}>✓</Text>
        </View>
      </View>

      {/* TITLE */}
      <Text style={styles.title}>
        Thanks! Your Job is Completed 🎉
      </Text>

      {/* SUB TEXT */}
      <Text style={styles.subtitle}>
        Your service has been successfully completed. 
        We hope you had a great experience.
      </Text>

      {/* DESCRIPTION */}
      <Text style={styles.description}>
        Now you can share your feedback and help others by reviewing the service provider.
      </Text>

      {/* BUTTONS */}
      <View style={styles.buttonContainer}>
        
        {/* Review Button */}
        <Button
          text="Review Provider"
          style={styles.reviewBtn}
          onPress={() => navigation.navigate('ReviewScreen')}
        />

        {/* Continue Button */}
        <TouchableOpacity onPress={() => navigationRef.resetRoot({
          index: 0,
          routes: [{ name: 'Drawer' }],
        })}>
          <Text style={styles.continueText}>Skip & Continue</Text>
        </TouchableOpacity>

      </View>

    </Screen>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  iconContainer: {
    marginBottom: 20,
  },

  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  check: {
    color: '#fff',
    fontSize: 50,
    fontWeight: 'bold',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
  },

  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },

  description: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },

  buttonContainer: {
    marginTop: 40,
    width: '100%',
  },

  reviewBtn: {
    backgroundColor: '#1565C0',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
  },

  continueText: {
    marginTop: 15,
    textAlign: 'center',
    color: '#1565C0',
    fontSize: 14,
  },
});