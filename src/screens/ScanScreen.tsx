import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Theme } from '../theme';
import { analyzeImage, saveScanResult } from '../services/scanService';

export default function ScanScreen() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const pick = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission', 'Camera access required');

    const res = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 });
    if (res.canceled || !res.assets?.[0]) return;

    const asset = res.assets[0];
    const manip = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 800 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    setPhoto(manip.uri);
    setLoading(true);
    try {
      const data = await analyzeImage(manip.base64!);
      setResult(data);
      await saveScanResult(data); // Save to Firestore
      Alert.alert('Saved!', 'Meal logged successfully');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <Text style={styles.title}>AI Meal Scanner</Text>
        <Button title="Take Photo" onPress={pick} />
      </Card>

      {photo && (
        <Card style={styles.photoCard}>
          <Image source={{ uri: photo }} style={styles.photo} />
        </Card>
      )}

      {loading && <LoadingOverlay message="Analyzing meal…" />}

      {result && (
        <Card>
          <Text style={styles.resultTitle}>Nutrients</Text>
          {['calories', 'proteins', 'carbs', 'fats'].map(k => (
            <Text key={k} style={styles.nutrient}>
              {k.charAt(0).toUpperCase() + k.slice(1)}: {result[k] ?? '-'} {k === 'calories' ? 'kcal' : 'g'}
            </Text>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Theme.spacing(2), backgroundColor: Theme.colors.background },
  title: { ...Theme.typography.h2, marginBottom: Theme.spacing(2) },
  photoCard: { padding: 0, overflow: 'hidden' },
  photo: { width: '100%', height: 240, borderRadius: Theme.radius.md },
  resultTitle: { ...Theme.typography.h2, marginBottom: Theme.spacing(1) },
  nutrient: { ...Theme.typography.body, marginBottom: Theme.spacing(0.5) },
});