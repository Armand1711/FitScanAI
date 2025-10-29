import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { OnboardingStep } from '../components/OnboardingStep';
import { calculateCalorieGoal, saveOnboarding } from '../services/onboardingService';

type RouteParams = { uid: string };

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { uid } = route.params as RouteParams;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // ---- form data ----
  const [name, setName] = useState('');
  const [allergies, setAllergies] = useState('');
  const [diet, setDiet] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const finishOnboarding = async () => {
    if (!name || !diet || !fitnessGoal) {
      return Alert.alert('Error', 'Please fill in all fields');
    }

    setLoading(true);
    try {
      const allergiesArr = allergies
        .split(',')
        .map(a => a.trim())
        .filter(Boolean);

      const calorieGoal = await calculateCalorieGoal({
        allergies: allergiesArr,
        diet,
        fitnessGoal,
      });

      await saveOnboarding(uid, { allergies: allergiesArr, diet, fitnessGoal, name }, calorieGoal);

      Alert.alert('Welcome!', `Your daily goal is ${calorieGoal} kcal`);
      navigation.replace('Main'); // go to your tab navigator
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Calculating your perfect plan…" />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 1 && (
          <OnboardingStep title="1. What’s your name?">
            <TextInput
              placeholder="e.g. John"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <Button title="Next" onPress={nextStep} />
          </OnboardingStep>
        )}

        {step === 2 && (
          <OnboardingStep title="2. Any allergies? (comma-separated)">
            <TextInput
              placeholder="e.g. peanuts, shellfish"
              value={allergies}
              onChangeText={setAllergies}
              style={styles.input}
            />
            <View style={styles.nav}>
              <Button title="Back" onPress={prevStep} />
              <Button title="Next" onPress={nextStep} />
            </View>
          </OnboardingStep>
        )}

        {step === 3 && (
          <OnboardingStep title="3. Preferred diet?">
            <TextInput
              placeholder="e.g. vegetarian, keto, omnivore"
              value={diet}
              onChangeText={setDiet}
              style={styles.input}
            />
            <View style={styles.nav}>
              <Button title="Back" onPress={prevStep} />
              <Button title="Next" onPress={nextStep} />
            </View>
          </OnboardingStep>
        )}

        {step === 4 && (
          <OnboardingStep title="4. Fitness goal?">
            <TextInput
              placeholder="e.g. lose weight, gain muscle, maintain"
              value={fitnessGoal}
              onChangeText={setFitnessGoal}
              style={styles.input}
            />
            <View style={styles.nav}>
              <Button title="Back" onPress={prevStep} />
              <Button title="Finish →" onPress={finishOnboarding} color="#28A745" />
            </View>
          </OnboardingStep>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    width: '100%',
  },
  nav: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
});