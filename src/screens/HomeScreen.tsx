import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Bar } from 'react-native-progress';
import { LineChart } from 'react-native-chart-kit';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Theme } from '../theme';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../../App';

type Nav = BottomTabNavigationProp<TabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [daily, setDaily] = useState(0);
  const [week, setWeek] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [goal, setGoal] = useState(2000);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6);

      const q = query(collection(db, 'mealLogs'), where('userId', '==', user.uid));
      const snap = await getDocs(q);

      const dayMap = new Map<number, number>();
      snap.docs.forEach(d => {
        const data = d.data();
        const date = new Date(data.date);
        if (date >= weekAgo && date <= today) {
          const idx = date.getDay();
          dayMap.set(idx, (dayMap.get(idx) ?? 0) + (data.calories ?? 0));
        }
      });

      const w = Array(7).fill(0);
      for (let i = 0; i < 7; i++) w[i] = dayMap.get(i) ?? 0;
      setWeek(w);
      setDaily(w[today.getDay()]);

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) setGoal(userDoc.data()?.goal ?? 2000);
    };
    load();
  }, []);

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    color: () => Theme.colors.primary,
    labelColor: () => Theme.colors.textSecondary,
    propsForLabels: { fontSize: 11 },
    decimalPlaces: 0,
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.title}>Daily Goal</Text>
        <Text style={styles.goal}>{goal} kcal</Text>
        <Text style={styles.today}>Today: {daily} kcal</Text>

        <Bar progress={daily / goal} width={null} color={Theme.colors.primary} style={styles.bar} />
      </Card>

      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>7‑Day Trend</Text>
        <LineChart
          data={{ labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S'], datasets: [{ data: week }] }}
          width={320}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Card>

      <Button title="Scan Meal" onPress={() => navigation.navigate('Scan')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Theme.spacing(2), backgroundColor: Theme.colors.background },
  title: { ...Theme.typography.h2, marginBottom: Theme.spacing(1) },
  goal: { ...Theme.typography.h1, color: Theme.colors.primary },
  today: { ...Theme.typography.body, marginBottom: Theme.spacing(2) },
  bar: { marginTop: Theme.spacing(2) },
  chartCard: { marginTop: Theme.spacing(3) },
  chartTitle: { ...Theme.typography.h2, marginBottom: Theme.spacing(1) },
  chart: { borderRadius: Theme.radius.md },
});