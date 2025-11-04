// src/screens/ScanScreen.tsx
import React, { useState } from 'react';
import { View, Text, Image, Alert, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Theme } from '../theme';
import { saveScanResult } from '../services/scanService';


const GEMINI_API_KEY = 'AIzaSyDfFQVDNMK0EkrwI26kVuOeI8iGB_0y7TY';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const analyzeImage = async (base64: string): Promise<any> => {
  try {
    console.log('Sending image to Gemini...');
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Analyze this meal. Return **only valid JSON**: { "calories": number, "protein": number, "carbs": number, "fat": number }' },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64
              }
            }
          ]
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error ${response.status}`);
    }

    const json = await response.json();
    console.log('Gemini raw response:', JSON.stringify(json, null, 2));

    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!text) throw new Error('No response from Gemini');

    const cleaned = text.replace(/```json|```/g, '').trim();
    console.log('Cleaned JSON:', cleaned);

    const parsed = JSON.parse(cleaned);
    return {
      calories: Number(parsed.calories) || 0,
      protein: Number(parsed.protein) || 0,
      carbs: Number(parsed.carbs) || 0,
      fat: Number(parsed.fat) || 0,
    };
  } catch (error: any) {
    console.error('analyzeImage error:', error);
    Alert.alert('AI Failed', 'Using mock data. Check console.');
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }
};

export default function ScanScreen() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const pick = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission', 'Camera access required');
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });

    if (res.canceled || !res.assets?.[0]) return;

    const manip = await ImageManipulator.manipulateAsync(
      res.assets[0].uri,
      [{ resize: { width: 800 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    setPhoto(manip.uri);
    setLoading(true);
    setResult(null);

    try {
      const data = await analyzeImage(manip.base64!);
      setResult(data);
      await saveScanResult(data);
      Alert.alert('Success', 'Meal logged!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to analyze');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.center}>
        <GlassCard>
          <Text style={styles.title}>AI Meal Scanner</Text>
          <PrimaryButton title="Take Photo" onPress={pick} />
        </GlassCard>
      </View>

      {photo && (
        <GlassCard style={styles.photo}>
          <Image source={{ uri: photo }} style={styles.img} />
        </GlassCard>
      )}

      {loading && <LoadingOverlay message="Analyzing with Gemini…" />}

      {result && (
        <GlassCard>
          <Text style={styles.resultTitle}>Nutrients</Text>
          {Object.entries(result).map(([key, value]) => (
            <Text key={key} style={styles.nutrient}>
              {key.charAt(0).toUpperCase() + key.slice(1)}: {String(value)} {key === 'calories' ? 'kcal' : 'g'}
            </Text>
          ))}
        </GlassCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: Theme.colors.background, padding: Theme.spacing(2) },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { ...Theme.typography.h2, color: '#FFF', textAlign: 'center', marginBottom: Theme.spacing(2) },
  photo: { padding: 0, overflow: 'hidden', marginTop: Theme.spacing(3) },
  img: { width: '100%', height: 260, borderRadius: Theme.radius.md },
  resultTitle: { ...Theme.typography.h2, color: '#FFF', marginBottom: Theme.spacing(1) },
  nutrient: { ...Theme.typography.body, color: '#FFF', marginBottom: Theme.spacing(0.5) },
});