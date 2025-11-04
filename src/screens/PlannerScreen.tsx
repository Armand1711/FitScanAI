import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, Alert } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Theme } from '../theme';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { generateMealPlan, saveMealPlan } from '../services/mealPlanService';

export default function PlannerScreen() {
  const [plan, setPlan] = useState('');
  const [profile, setProfile] = useState({ goal: 2000, dietaryPreference: 'omnivore', allergies: [] as string[] });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const d = snap.data();
        setProfile({
          goal: d.goal ?? 2000,
          dietaryPreference: d.dietaryPreference ?? 'omnivore',
          allergies: d.allergies ?? [],
        });
      }
    };
    load();
  }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const text = await generateMealPlan(profile);
      setPlan(text);
    } catch (e: any) {
      Alert.alert('Error', e.message);
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
      Alert.alert('Saved', 'Plan added to library');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <GlassCard>
        <Text style={styles.title}>Meal Planner</Text>
        <Text style={styles.goal}>Goal: {profile.goal} kcal</Text>
        <Text style={styles.diet}>Diet: {profile.dietaryPreference}</Text>
        {profile.allergies.length ? (
          <Text style={styles.allergies}>Allergies: {profile.allergies.join(', ')}</Text>
        ) : null}
        <PrimaryButton title={loading ? 'Generating…' : 'Generate Plan'} onPress={generate} disabled={loading} />
      </GlassCard>

      {loading && <LoadingOverlay message="Crafting your plan…" />}

      {plan && (
        <GlassCard>
          <Text style={styles.planTitle}>Your Plan</Text>
          <Text style={styles.plan}>{plan}</Text>
          <View style={styles.saveBtn}>
            <PrimaryButton title={saving ? 'Saving…' : 'Save Plan'} onPress={save} disabled={saving} />
          </View>
        </GlassCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Theme.spacing(2), backgroundColor: Theme.colors.background },
  title: { ...Theme.typography.h2, color: '#FFF', marginBottom: Theme.spacing(1) },
  goal: { ...Theme.typography.body, color: Theme.colors.primary, fontWeight: '600' },
  diet: { ...Theme.typography.caption },
  allergies: { ...Theme.typography.caption, color: Theme.colors.error },
  planTitle: { ...Theme.typography.h2, color: '#FFF', marginBottom: Theme.spacing(1) },
  plan: { lineHeight: 22, ...Theme.typography.body, color: '#FFF' },
  saveBtn: { marginTop: Theme.spacing(2) },
});