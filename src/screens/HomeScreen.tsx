import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Bar } from 'react-native-progress'; 
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../../App';

type HomeScreenNavigationProp = BottomTabNavigationProp<TabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [dailyCalories, setDailyCalories] = useState(0);
  const [goal, setGoal] = useState(2000); 

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.warn('No authenticated user, skipping fetch');
        return;
      }
      try {
        const today = new Date().toDateString();
        const q = query(collection(db, 'mealLogs'), where('userId', '==', currentUser.uid), where('date', '==', today));
        const snapshot = await getDocs(q);
        const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().calories || 0), 0);
        setDailyCalories(total);
        console.log('Daily calories fetched:', total);

        const userDoc = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          setGoal(docSnap.data().goal || 2000);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Goal: {goal} kcal</Text>
      <Text style={styles.intake}>Current Intake: {dailyCalories} kcal</Text>
      <Bar progress={dailyCalories / goal} width={200} color="#28A745" style={styles.progress} />
      <Button title="Scan Meal" onPress={() => navigation.navigate('Scan')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  intake: { fontSize: 16, marginBottom: 10 },
  progress: { marginBottom: 20 },
});