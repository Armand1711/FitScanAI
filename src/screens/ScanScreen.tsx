import React, { useState, useEffect } from 'react';
import { View, Button, Image, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import axios from 'axios';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebase';


const GEMINI_API_KEY = 'AIzaSyDfFQVDNMK0EkrwI26kVuOeI8iGB_0y7TY';

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{ calories?: number; proteins?: number; carbs?: number; fats?: number } | null>(null);

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

  const postWithRetries = async (url: string, body: any, headers: any, maxRetries = 3) => {
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        return await axios.post(url, body, { headers });
      } catch (err: any) {
        const status = err?.response?.status;
        if ((status === 429 || !err.response) && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
          console.warn(`Request failed (status ${status}). Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
          await new Promise((r) => setTimeout(r, delay));
          attempt++;
          continue;
        }
        throw err;
      }
    }
    throw new Error('Max retries reached');
  };

  const analyzeImage = async (base64: string) => {
    if (!GEMINI_API_KEY) {
      Alert.alert('Missing API Key', 'Set GEMINI_API_KEY in your source before using the scanner.');
      return;
    }

    const userId = auth.currentUser?.uid;
    if (!userId) {
      Alert.alert('Authentication Error', 'Please log in to save meal data.');
      return;
    }

    try {
      const response = await postWithRetries(
        'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=' + GEMINI_API_KEY,
        {
          contents: [{
            parts: [
              { text: 'Identify foods in this meal and estimate total calories, proteins (g), carbs (g), fats (g). Return ONLY valid JSON, e.g. {"calories":500,"proteins":20,"carbs":50,"fats":20}' },
              { inlineData: { mimeType: 'image/jpeg', data: base64 } },
            ],
          }],
        },
        { 'Content-Type': 'application/json' }
      );

      const raw = response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const textResult = String(raw).trim();

      const match = textResult.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error('Model response (no JSON):', textResult);
        throw new Error('No JSON found in model response');
      }

      const parsed = JSON.parse(match[0]);
      const calories = parsed.calories !== undefined ? Number(parsed.calories) : undefined;
      const proteins = parsed.proteins !== undefined ? Number(parsed.proteins) : undefined;
      const carbs = parsed.carbs !== undefined ? Number(parsed.carbs) : undefined;
      const fats = parsed.fats !== undefined ? Number(parsed.fats) : undefined;

      setAnalysis({ calories, proteins, carbs, fats });

      await addDoc(collection(db, 'mealLogs'), {
        userId,
        date: new Date().toISOString(),
        calories,
        proteins,
        carbs,
        fats,
      }).then(() => console.log('Meal log saved to Firestore'))
        .catch((error) => {
          console.error('Error saving meal log:', error);
          Alert.alert('Firestore Error', 'Failed to save meal data. Check permissions.');
        });
    } catch (error: any) {
      if (error.response && error.response.status === 429) {
        console.error('Rate limit exceeded after retries:', error.message);
        Alert.alert('Rate Limit Exceeded', 'Gemini API limit reached. Try again later.');
      } else if (error.response && error.response.status === 404) {
        console.error('API endpoint not found:', error.message);
        Alert.alert('API Error', 'Invalid endpoint. Verify Gemini API key and documentation.');
      } else {
        console.error('Error analyzing image:', error);
        Alert.alert('Error', 'Failed to analyze meal. Check API key or network.');
      }
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