import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const [goal, setGoal] = useState(2000); // Default goal
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        const userDoc = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGoal(data.goal || 2000); // Load existing goal or default to 2000
        }
      } else {
        setGoal(2000); // Reset to default if logged out
      }
    });
    return unsubscribe;
  }, []);

  const saveGoal = async () => {
    if (userId && !isNaN(goal) && goal > 0) {
      try {
        await setDoc(doc(db, 'users', userId), { goal }, { merge: true });
        Alert.alert('Success', 'Goal saved successfully!');
      } catch (error) {
        console.error('Error saving goal:', error);
        Alert.alert('Error', 'Failed to save goal. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please enter a valid goal greater than 0.');
    }
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        setGoal(2000); // Reset goal on logout
        Alert.alert('Logged Out', 'You have been logged out.');
      })
      .catch((error) => {
        console.error('Error logging out:', error);
        Alert.alert('Error', 'Failed to log out.');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Daily Calorie Goal</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={goal.toString()}
        onChangeText={(text) => setGoal(Number(text) || 2000)} 
      />
      <Button title="Save Goal" onPress={saveGoal} color="#28A745" />
      <View style={styles.logoutContainer}>
        <Button title="Logout" onPress={handleLogout} color="#DC3545" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20, width: 200, borderRadius: 5, textAlign: 'center' },
  logoutContainer: { marginTop: 20 }, 
});