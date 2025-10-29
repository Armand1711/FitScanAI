/* src/screens/PlannerScreen.tsx */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios, { AxiosError } from 'axios';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { saveMealPlan } from '../services/mealPlanService';

const GEMINI_API_KEY = 'AIzaSyDfFQVDNMK0EkrwI26kVuOeI8iGB_0y7TY';

interface UserProfile {
  goal: number;
  dietaryPreference: string;
  allergies: string[];
}

export default function PlannerScreen() {
  const [plan, setPlan] = useState('');
  const [profile, setProfile] = useState<UserProfile>({
    goal: 2000,
    dietaryPreference: 'omnivore',
    allergies: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = doc(db, 'users', user.uid);
      const snap = await getDoc(userDoc);
      if (snap.exists()) {
        const data = snap.data();
        setProfile({
          goal: data.goal ?? 2000,
          dietaryPreference: data.dietaryPreference ?? 'omnivore',
          allergies: data.allergies ?? [],
        });
      }
    };
    loadProfile();
  }, []);

  const generatePlan = async () => {
    setLoading(true);
    setPlan('');

    try {
      const allergiesText = profile.allergies.length
        ? `Avoid these allergies: ${profile.allergies.join(', ')}.`
        : 'No allergies specified.';

      const prompt = `
You are a nutrition expert. Create a **balanced ${profile.goal} kcal daily meal plan** for a **${profile.dietaryPreference}** diet.
${allergiesText}
Include **breakfast, lunch, dinner, and 1-2 snacks** with **approximate calorie counts** for each item.
Return **only plain text** – no markdown, no JSON.
`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const result =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      if (!result) throw new Error('Empty response from Gemini');

      setPlan(result);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          Alert.alert('Rate limit', 'Gemini API limit reached. Try again later.');
        } else if (error.response?.status === 404) {
          Alert.alert('API error', 'Model not found – check Gemini key / model name.');
        } else {
          Alert.alert('Error', error.message || 'Failed to generate plan');
        }
      } else {
        Alert.alert('Error', 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      await saveMealPlan({
        goal: profile.goal,
        diet: profile.dietaryPreference,
        allergies: profile.allergies,
        planText: plan,
        createdAt: ''
      });
      Alert.alert('Saved!', 'Meal plan added to your library');
    } catch (e) {
      Alert.alert('Error', 'Could not save plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.goalText}>Current Goal: {profile.goal} kcal</Text>
      <Text style={styles.dietText}>
        Diet: {profile.dietaryPreference}
        {profile.allergies.length
          ? ` | Allergies: ${profile.allergies.join(', ')}`
          : ''}
      </Text>

      <Button
        title={loading ? 'Generating…' : 'Generate Meal Plan'}
        onPress={generatePlan}
        disabled={loading}
      />

      {loading && (
        <View style={styles.spinner}>
          <ActivityIndicator size="large" color="#28A745" />
          <Text style={styles.loading}>Asking Gemini for your perfect plan…</Text>
        </View>
      )}

      {plan ? (
        <>
          <Text style={styles.plan}>{plan}</Text>
          <View style={styles.saveBtn}>
            <Button
              title={saving ? 'Saving…' : 'Save Plan'}
              onPress={handleSave}
              disabled={saving}
              color="#28A745"
            />
          </View>
        </>
      ) : (
        !loading && <Text style={styles.placeholder}>Plan will appear here</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  goalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  dietText: { fontSize: 14, color: '#555', marginBottom: 20 },
  spinner: { marginTop: 20, alignItems: 'center' },
  loading: { marginTop: 8, color: '#666' },
  plan: {
    marginTop: 20,
    textAlign: 'left',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  placeholder: { marginTop: 20, color: '#888' },
  saveBtn: { marginTop: 15, width: 200 },
});