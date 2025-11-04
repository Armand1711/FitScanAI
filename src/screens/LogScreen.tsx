import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { getMealLogs, deleteMealLog } from '../services/scanService';
import { Theme } from '../theme';

export default function LogScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getMealLogs();
      setLogs(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const remove = (id: string) => {
    Alert.alert('Delete', 'Remove this log?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMealLog(id);
          setLogs(prev => prev.filter(log => log.id !== id));
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading logs...</Text>
      </View>
    );
  }

  if (!logs.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No meal logs yet</Text>
        <Text style={styles.caption}>Scan a meal to get started!</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={logs}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      renderItem={({ item }) => (
        <GlassCard>
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString()} • {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={styles.calories}>{item.calories} kcal</Text>
          <View style={styles.nutrients}>
            <Text style={styles.nut}>P: {item.protein}g</Text>
            <Text style={styles.nut}>C: {item.carbs}g</Text>
            <Text style={styles.nut}>F: {item.fat}g</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => remove(item.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Theme.spacing(3) },
  loadingText: { ...Theme.typography.h2, color: '#FFF' },
  emptyText: { ...Theme.typography.h2, color: '#FFF', textAlign: 'center' },
  caption: { ...Theme.typography.caption, marginTop: 8, textAlign: 'center' },
  list: { padding: Theme.spacing(2), backgroundColor: Theme.colors.background },
  separator: { height: Theme.spacing(3) },
  date: { ...Theme.typography.caption },
  calories: { ...Theme.typography.h1, color: Theme.colors.primary, marginVertical: 4 },
  nutrients: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  nut: { ...Theme.typography.body, color: '#B0B0B0' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 },
  delete: { color: Theme.colors.error, fontWeight: '600' },
});