import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Bar } from 'react-native-progress';
import { LineChart } from 'react-native-chart-kit';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { Theme } from '../theme';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [daily, setDaily] = useState(0);
  const [week, setWeek] = useState([0,0,0,0,0,0,0]);
  const [goal, setGoal] = useState(2000);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date();
      const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 6);

      const q = query(collection(db, 'mealLogs'), where('userId', '==', user.uid));
      const snap = await getDocs(q);

      const dayMap = new Map();
      snap.docs.forEach(d => {
        const date = new Date(d.data().date);
        if (date >= weekAgo && date <= today) {
          const idx = date.getDay();
          dayMap.set(idx, (dayMap.get(idx) || 0) + (d.data().calories || 0));
        }
      });

      const w = Array(7).fill(0);
      for (let i = 0; i < 7; i++) w[i] = dayMap.get(i) || 0;
      setWeek(w);
      setDaily(w[today.getDay()]);

      const userSnap = await getDoc(doc(db, 'users', user.uid));
      if (userSnap.exists()) setGoal(userSnap.data().goal || 2000);
    };
    load();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <GlassCard>
        <Text style={styles.title}>Daily Goal</Text>
        <Text style={styles.goal}>{goal} kcal</Text>
        <Text style={styles.today}>Today: {daily} kcal</Text>
        <Bar progress={daily/goal} width={null} color={Theme.colors.primary} style={styles.bar} />
      </GlassCard>

      <GlassCard style={styles.chart}>
        <Text style={styles.chartTitle}>7‑Day Trend</Text>
        <LineChart
          data={{ labels: ['S','M','T','W','T','F','S'], datasets: [{ data: week }] }}
          width={340}
          height={200}
          chartConfig={{
            backgroundGradientFrom: '#1A1A1A',
            backgroundGradientTo: '#1A1A1A',
            color: () => Theme.colors.primary,
            labelColor: () => '#B0B0B0',
          }}
          bezier
          style={{ borderRadius: Theme.radius.md }}
        />
      </GlassCard>

      <PrimaryButton title="Scan Meal" onPress={() => navigation.navigate('Scan')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Theme.spacing(2), backgroundColor: Theme.colors.background },
  title: { ...Theme.typography.h2, color: '#FFF', marginBottom: Theme.spacing(1) },
  goal: { ...Theme.typography.h1, color: Theme.colors.primary },
  today: { ...Theme.typography.body, color: '#FFF', marginBottom: Theme.spacing(2) },
  bar: { marginTop: Theme.spacing(2) },
  chart: { marginTop: Theme.spacing(3) },
  chartTitle: { ...Theme.typography.h2, color: '#FFF', marginBottom: Theme.spacing(1) },
});