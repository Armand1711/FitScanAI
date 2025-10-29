// src/screens/SavedPlansScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { getSavedPlans, deleteMealPlan, SavedMealPlan } from '../services/mealPlanService';
import { Theme } from '../theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import * as Clipboard from 'expo-clipboard';

export default function SavedPlansScreen() {
  const [plans, setPlans] = useState<SavedMealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await getSavedPlans();
      setPlans(data);
    } catch (e) {
      Alert.alert('Error', 'Could not load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Plan', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMealPlan(id);
            setPlans(p => p.filter(x => x.id !== id));
          } catch (e) {
            Alert.alert('Error', 'Could not delete');
          }
        },
      },
    ]);
  };

  const copyPlan = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Plan copied to clipboard');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>Loading your plans…</Text>
      </View>
    );
  }

  if (plans.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No saved plans yet.</Text>
        <Text style={styles.hint}>Generate a plan and tap "Save Plan"</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={plans}
      keyExtractor={item => item.id!}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Card>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <Text style={styles.meta}>
            {item.goal} kcal • {item.diet}
            {item.allergies.length ? ` • No ${item.allergies.join(', ')}` : ''}
          </Text>
          <Text style={styles.plan} numberOfLines={4}>
            {item.planText}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => copyPlan(item.planText)}>
              <Text style={styles.action}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id!)}>
              <Text style={[styles.action, styles.delete]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  empty: { fontSize: 18, color: '#666' },
  hint: { marginTop: 8, color: '#888' },
  list: { padding: Theme.spacing(2) },
  date: { ...Theme.typography.caption },
  meta: { fontWeight: '600', marginVertical: 4 },
  plan: { lineHeight: 20, marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  action: { color: Theme.colors.primary, fontWeight: '600' },
  delete: { color: Theme.colors.error },
  loading: { ...Theme.typography.body, color: '#666' },
});