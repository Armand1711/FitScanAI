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
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { generateMealPlan, saveMealPlan } from '../services/mealPlanService';

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

  const generate = async () => {
    setLoading(true);
    setPlan('');
    try {
      const result = await generateMealPlan(profile);
      setPlan(result);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to generate plan');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      await saveMealPlan({
        goal: profile.goal,
        diet: profile.dietaryPreference,
        allergies: profile.allergies,
        planText: plan,
      });
      Alert.alert('Saved!', 'Meal plan added to your library');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not save plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.goalText}>Current Goal: {profile.goal} kcal</Text>
      <Text style={styles.dietText}>
        Diet: {profile.dietaryPreference}
        {profile.allergies.length ? ` | Allergies: ${profile.allergies.join(', ')}` : ''}
      </Text>

      <Button
        title={loading ? 'Generating…' : 'Generate Meal Plan'}
        onPress={generate}
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
              onPress={save}
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
  container: { flexGrow: 1, padding: 20, alignItems: 'center' },
  goalText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  dietText: { fontSize: 14, color: '#555', marginBottom: 20 },
  spinner: { marginTop: 20, alignItems: 'center' },
  loading: { marginTop: 8, color: '#666' },
  plan: { marginTop: 20, textAlign: 'left', lineHeight: 22, paddingHorizontal: 10 },
  placeholder: { marginTop: 20, color: '#888' },
  saveBtn: { marginTop: 15, width: 200 },
});