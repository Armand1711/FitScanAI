import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button } from 'react-native';
import { Bar } from 'react-native-progress';
import { LineChart } from 'react-native-chart-kit';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../../App';

type HomeScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [dailyCalories, setDailyCalories] = useState(0);
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [goal, setGoal] = useState(2000);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6);

      const q = query(
        collection(db, 'mealLogs'),
        where('userId', '==', user.uid)
      );
      const snap = await getDocs(q);

      const dayMap = new Map<number, number>();
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      snap.docs.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.date);
        if (date >= weekAgo && date <= today) {
          const dayIndex = date.getDay();
          const current = dayMap.get(dayIndex) || 0;
          dayMap.set(dayIndex, current + (data.calories || 0));
        }
      });

      const week = Array(7).fill(0);
      for (let i = 0; i < 7; i++) {
        week[i] = dayMap.get(i) || 0;
      }
      setWeeklyData(week);

      const todayIndex = today.getDay();
      setDailyCalories(week[todayIndex]);

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setGoal(userDoc.data()?.goal || 2000);
      }
    };
    fetchData();
  }, []);

  const chartConfig = {
    backgroundGradientFrom: '#1e1e1e',
    backgroundGradientTo: '#1e1e1e',
    color: (opacity = 1) => `rgba(40, 167, 69, ${opacity})`,
    strokeWidth: 3,
    decimalPlaces: 0,
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Daily Goal: {goal} kcal</Text>
      <Text style={styles.intake}>Today: {dailyCalories} kcal</Text>

      <Bar progress={dailyCalories / goal} width={280} color="#28A745" style={styles.bar} />

      <Text style={styles.chartTitle}>7-Day Calorie Trend</Text>
      <LineChart
        data={{
          labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          datasets: [{ data: weeklyData }],
        }}
        width={320}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />

      <View style={styles.button}>
        <Button title="Scan Meal" onPress={() => navigation.navigate('Scan')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  intake: { fontSize: 16, marginBottom: 12 },
  bar: { marginBottom: 20 },
  chartTitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  chart: { borderRadius: 16 },
  button: { marginTop: 20, width: 200 },
});