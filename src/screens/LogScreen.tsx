import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc as firestoreDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

type LogEntry = {
  id: string;
  userId?: string;
  date?: string;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
  [key: string]: any;
};

export default function LogScreen(): React.ReactElement {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) {
          console.warn('No authenticated user - skipping log fetch');
          setLogs([]);
          return;
        }

        const q = query(collection(db, 'mealLogs'), where('userId', '==', userId));
        const snapshot = await getDocs(q);
        const logData = snapshot.docs.map(d => ({ id: d.id, ...(d.data() as Omit<LogEntry, 'id'>) })) as LogEntry[];
        setLogs(logData);
        console.log('Logs fetched:', logData.length);
      } catch (error) {
        console.error('Error fetching logs:', error);
        Alert.alert('Error', 'Failed to load logs. Check console for details.');
      }
    };

    fetchLogs();
  }, []);

  const deleteLog = async (id: string) => {
    try {
      await deleteDoc(firestoreDoc(db, 'mealLogs', id));
      setLogs(prev => prev.filter(log => log.id !== id));
      console.log('Log deleted:', id);
      Alert.alert('Success', 'Log deleted!');
    } catch (error) {
      console.error('Error deleting log:', error);
      Alert.alert('Error', 'Failed to delete log.');
    }
  };

  const editLog = async (id: string, newCalories: number) => {
    try {
      await updateDoc(firestoreDoc(db, 'mealLogs', id), { calories: newCalories });
      setLogs(prev => prev.map(log => (log.id === id ? { ...log, calories: newCalories } : log)));
      console.log('Log updated:', id);
      Alert.alert('Success', 'Log updated!');
    } catch (error) {
      console.error('Error updating log:', error);
      Alert.alert('Error', 'Failed to update log.');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No logs available. Scan a meal to start!</Text>}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.itemText}>
              <Text style={styles.dateText}>{item.date ? new Date(item.date).toLocaleString() : 'Unknown date'}</Text>
              <Text>{(item.calories ?? 0) + ' kcal'}</Text>
            </View>
            <View style={styles.buttons}>
              <Button title="Edit (+100)" onPress={() => editLog(item.id, (item.calories ?? 0) + 100)} />
              <Button title="Delete" onPress={() => deleteLog(item.id)} color="#DC3545" />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 8,
  },
  itemText: { marginBottom: 8 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between' },
  empty: { textAlign: 'center', padding: 20, color: '#666' },
  dateText: { fontWeight: '600' },
});