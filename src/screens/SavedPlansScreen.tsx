import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { getSavedPlans, deleteMealPlan } from '../services/mealPlanService';
import { Theme } from '../theme';
import * as Clipboard from 'expo-clipboard';

export default function SavedPlansScreen() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const data = await getSavedPlans();
    setPlans(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = (id: string) => {
    Alert.alert('Delete', 'Remove this plan?', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteMealPlan(id);
        setPlans(p => p.filter(x => x.id !== id));
      }},
    ]);
  };

  const copy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied!', 'Plan copied');
  };

  if (loading) return <Text style={styles.center}>Loading…</Text>;
  if (!plans.length) return <Text style={styles.center}>No saved plans</Text>;

  return (
    <FlatList
      data={plans}
      keyExtractor={i => i.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <GlassCard>
          <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.meta}>{item.goal} kcal • {item.diet}</Text>
          <Text style={styles.plan} numberOfLines={3}>{item.planText}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => copy(item.planText)}>
              <Text style={styles.action}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => remove(item.id)}>
              <Text style={[styles.action, styles.delete]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, textAlign: 'center', paddingTop: 50, ...Theme.typography.body, color: '#FFF' },
  list: { padding: Theme.spacing(2) },
  date: { ...Theme.typography.caption },
  meta: { fontWeight: '600', marginVertical: 4, color: '#FFF' },
  plan: { lineHeight: 20, marginBottom: 8, color: '#FFF' },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  action: { color: Theme.colors.primary, fontWeight: '600' },
  delete: { color: Theme.colors.error },
});