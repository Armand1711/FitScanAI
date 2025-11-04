import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, Alert, TouchableOpacity, Modal, Button } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { getSavedPlans, deleteMealPlan } from '../services/mealPlanService';
import { Theme } from '../theme';
import * as Clipboard from 'expo-clipboard';

export default function SavedPlansScreen() {
  const [plans, setPlans] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
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
    <>
      <FlatList
        data={plans}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelected(item)}>
            <GlassCard>
              <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.meta}>{item.goal} kcal • {item.diet}</Text>
              <Text style={styles.preview} numberOfLines={2}>{item.planText}</Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => copy(item.planText)}>
                  <Text style={styles.action}>Copy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => remove(item.id)}>
                  <Text style={[styles.action, styles.delete]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modal}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Meal Plan</Text>
            <Text style={styles.modalDate}>{selected && new Date(selected.createdAt).toLocaleString()}</Text>
            <Text style={styles.modalText}>{selected?.planText}</Text>
            <Button title="Close" onPress={() => setSelected(null)} />
          </GlassCard>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, textAlign: 'center', paddingTop: 50, ...Theme.typography.body, color: '#FFF' },
  separator: { height: Theme.spacing(3) },
  list: { padding: Theme.spacing(2), flexGrow: 1, backgroundColor: Theme.colors.background },
  date: { ...Theme.typography.caption }, 
  meta: { fontWeight: '600', marginVertical: 4, color: '#FFF' },
  preview: { lineHeight: 20, marginBottom: 8, color: '#FFF' },
  actions: { flexDirection: 'row', justifyContent: 'space-between' },
  action: { color: Theme.colors.primary, fontWeight: '600' },
  delete: { color: Theme.colors.error },
  modal: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: Theme.spacing(3) },
  modalCard: { maxHeight: '80%' },
  modalTitle: { ...Theme.typography.h2, color: '#FFF', textAlign: 'center' },
  modalDate: { ...Theme.typography.caption, textAlign: 'center', marginBottom: Theme.spacing(2) },
  modalText: { lineHeight: 24, ...Theme.typography.body, color: '#FFF', marginBottom: Theme.spacing(3) },
});