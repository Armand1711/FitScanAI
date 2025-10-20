import React, { useEffect, useState } from 'react';
import { View, Text, ProgressBarAndroid as ProgressBar, Button, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [dailyCalories, setDailyCalories] = useState(0);
  const [goal, setGoal] = useState(2000); // Default goal; fetch from profile later

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.warn('No authenticated user found; skipping meal log fetch.');
          return;
        }
        const today = new Date().toDateString();
        const q = query(
          collection(db, 'mealLogs'),
          where('userId', '==', user.uid),
          where('date', '==', today)
        );
        const snapshot = await getDocs(q);
        const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().calories || 0), 0);
        setDailyCalories(total);
        console.log('Daily calories fetched:', total); // Debug log
      } catch (error) {
        console.error('Error fetching meal logs:', error);
      }
    };
    fetchLogs();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Goal: {goal} kcal</Text>
      <Text style={styles.intake}>Current Intake: {dailyCalories} kcal</Text>
      <ProgressBar styleAttr="Horizontal" progress={dailyCalories / goal} color="#28A745" style={styles.progress} />
      <Button title="Scan Meal" onPress={() => navigation.navigate('Scan')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  intake: { fontSize: 16, marginBottom: 10 },
  progress: { width: '100%', marginBottom: 20 },
});