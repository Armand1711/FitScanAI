import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function LogScreen() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const q = query(collection(db, 'mealLogs'), where('userId', '==', auth.currentUser.uid));
        const snapshot = await getDocs(q);
        const logData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLogs(logData);
        console.log('Logs fetched:', logData.length); // Debug log
      } catch (error) {
        console.error('Error fetching logs:', error);
        Alert.alert('Error', 'Failed to load logs. Check console.');
      }
    };
    fetchLogs();
  }, []);

  const deleteLog = async (id) => {
    try {
      await deleteDoc(doc(db, 'mealLogs', id));
      setLogs(logs.filter(log => log.id !== id));
      console.log('Log deleted:', id);
      Alert.alert('Success', 'Log deleted!');
    } catch (error) {
      console.error('Error deleting log:', error);
      Alert.alert('Error', 'Failed to delete log.');
    }
  };

  const editLog = async (id, newCalories) => {
    try {
      await updateDoc(doc(db, 'mealLogs', id), { calories: newCalories });
      const updatedLogs = logs.map(log => log.id === id ? { ...log, calories: newCalories } : log);
      setLogs(updatedLogs);
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
            <Text>{item.date}: {item.calories || 0} kcal</Text>
            <Button title="Edit (+100)" onPress={() => editLog(item.id, (item.calories || 0) + 100)} />
            <Button title="Delete" onPress={() => deleteLog(item.id)} color="#DC3545" />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  item: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  empty: { textAlign: 'center', padding: 20, color: '#666' },
});