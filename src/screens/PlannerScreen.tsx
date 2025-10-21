import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, Alert } from 'react-native';
import axios, { AxiosError } from 'axios';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const GEMINI_API_KEY = 'AIzaSyDfFQVDNMK0EkrwI26kVuOeI8iGB_0y7TY';

export default function PlannerScreen() {
  const [plan, setPlan] = useState('');
  const [goal, setGoal] = useState(2000); 

  useEffect(() => {
    const fetchGoal = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setGoal(data.goal || 2000);
        }
      }
    };
    fetchGoal();
  }, []);

  const generatePlan = async () => {
    try {
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY,
        {
          contents: [{
            parts: [
              { text: `Generate a balanced ${goal} calorie daily meal plan with recipes. Return the plan as plain text, including breakfast, lunch, dinner, and snacks, with approximate calorie counts for each.` },
            ],
          }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      if (!result) {
        throw new Error('No content returned from API');
      }
      setPlan(result);
      console.log('Meal plan generated:', result.substring(0, 100));
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 429) {
          console.error('Rate limit exceeded:', error.message);
          Alert.alert('Rate Limit Exceeded', 'Gemini API limit reached. Try again later.');
        } else if (error.response?.status === 404) {
          console.error('API endpoint not found:', error.response?.data);
          Alert.alert('API Error', 'Invalid model or endpoint. Verify Gemini API key and documentation.');
        } else {
          console.error('Error generating plan:', error.message, error.response?.data);
          Alert.alert('Error', 'Failed to generate plan. Check API key or network.');
        }
      } else {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.goalText}>Current Goal: {goal} kcal</Text>
      <Button title="Generate Meal Plan" onPress={generatePlan} />
      {plan ? <Text style={styles.plan}>{plan}</Text> : <Text style={styles.placeholder}>Plan will appear here</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  goalText: { fontSize: 16, marginBottom: 20, fontWeight: 'bold' },
  plan: { marginTop: 20, textAlign: 'center', padding: 10 },
  placeholder: { marginTop: 20, color: '#666' },
});