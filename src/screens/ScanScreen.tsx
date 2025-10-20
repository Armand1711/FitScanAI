import React, { useState, useEffect } from 'react';
import { View, Button, Image, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Replace with your Clarifai API key from https://clarifai.com/apps
const CLARIFAI_API_KEY = '152a52f05d014950983d9df526abed78'; // Your Clarifai key

// Simple lookup for calorie estimates (expand with Edamam API for precision)
const FOOD_CALORIE_LOOKUP: Record<string, { calories: number; proteins: number; carbs: number; fats: number }> = {
  'apple': { calories: 52, proteins: 0.3, carbs: 14, fats: 0.2 },
  'banana': { calories: 89, proteins: 1.1, carbs: 23, fats: 0.3 },
  'bread': { calories: 265, proteins: 9, carbs: 49, fats: 3.2 },
  'chicken': { calories: 239, proteins: 27, carbs: 0, fats: 14 },
  'pizza': { calories: 266, proteins: 11, carbs: 33, fats: 10 },
  // Add more foods as needed; fallback to average for unknown
};

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{ calories?: number; proteins?: number; carbs?: number; fats?: number } | null>(null);

  // Ensure auth state is ready
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        Alert.alert('Authentication Error', 'Please log in to scan meals.');
      }
    });
    return unsubscribe;
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to scan meals.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          asset.uri,
          [{ resize: { width: 800 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
        );
        setImage(manipResult.uri ?? asset.uri ?? null);
        if (manipResult.base64) {
          await analyzeImage(manipResult.base64);
        } else if (asset.base64) {
          await analyzeImage(asset.base64);
        } else {
          Alert.alert('Error', 'No image data available.');
        }
      } catch (err) {
        console.error('Image manipulation error:', err);
        Alert.alert('Error', 'Failed to process image.');
      }
    }
  };

  const analyzeImage = async (base64: string) => {
    if (!CLARIFAI_API_KEY) {
      Alert.alert('Missing API Key', 'Set CLARIFAI_API_KEY in your source before using the scanner.');
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Authentication Error', 'Please log in to save meal data.');
      return;
    }

    try {
      const response = await axios.post(
        'https://api.clarifai.com/v2/models/food-item-recognition/versions/1/predict',
        {
          inputs: [{ data: { image: { base64 } } }],
        },
        {
          headers: {
            Authorization: `Key ${CLARIFAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const predictions = response.data.outputs[0].data.regions || response.data.outputs[0].data.concepts || [];
      let totalCalories = 0, totalProteins = 0, totalCarbs = 0, totalFats = 0;

      predictions.forEach((region: any) => {
        const concept = region.data.concepts?.[0] || region.data.region?.data?.concepts?.[0] || region;
        if (concept && concept.name) {
          const lookup = FOOD_CALORIE_LOOKUP[concept.name.toLowerCase()] || { calories: 100, proteins: 5, carbs: 15, fats: 5 }; // Fallback average
          const confidence = concept.value || 1;
          totalCalories += lookup.calories * confidence;
          totalProteins += lookup.proteins * confidence;
          totalCarbs += lookup.carbs * confidence;
          totalFats += lookup.fats * confidence;
        }
      });

      const parsed = { calories: Math.round(totalCalories), proteins: Math.round(totalProteins), carbs: Math.round(totalCarbs), fats: Math.round(totalFats) };
      setAnalysis(parsed);

      // Save to Firestore 'mealLogs' collection for the logged-in user (created automatically)
      await addDoc(collection(db, 'mealLogs'), {
        userId,
        date: new Date().toISOString(),
        ...parsed,
      }).then(() => console.log('Meal log saved to Firestore for user:', userId))
        .catch((error) => {
          console.error('Error saving meal log:', error);
          Alert.alert('Firestore Error', 'Failed to save meal data. Check permissions.');
        });
    } catch (error) {
      console.error('Error analyzing image:', error);
      Alert.alert('Error', 'Failed to analyze meal. Check API key or network.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Scan Meal" onPress={pickImage} />
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : (
        <Text style={styles.placeholder}>No image</Text>
      )}
      {analysis && (
        <View style={styles.analysis}>
          <Text>Calories: {analysis.calories ?? '—'} kcal</Text>
          <Text>Proteins: {analysis.proteins ?? '—'} g</Text>
          <Text>Carbs: {analysis.carbs ?? '—'} g</Text>
          <Text>Fats: {analysis.fats ?? '—'} g</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  image: { width: 300, height: 200, resizeMode: 'cover', marginTop: 16, borderRadius: 8 },
  placeholder: { marginTop: 16, color: '#666' },
  analysis: { marginTop: 20, alignItems: 'flex-start' },
});