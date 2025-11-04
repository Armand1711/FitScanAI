import React, { useState } from 'react';
import { View, Text, Image, Alert, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
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

    const manip = await ImageManipulator.manipulateAsync(
      res.assets[0].uri,
      [{ resize: { width: 800 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    setPhoto(manip.uri);
    setLoading(true);
    try {
      const data = await analyzeImage(manip.base64!);
      setResult(data);
      await saveScanResult(data);
      Alert.alert('Success', 'Meal logged!');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <GlassCard>
        <Text style={styles.title}>AI Meal Scanner</Text>
        <PrimaryButton title="Take Photo" onPress={pick} />
      </GlassCard>

      {photo && (
        <GlassCard style={styles.photo}>
          <Image source={{ uri: photo }} style={styles.img} />
        </GlassCard>
      )}

      {loading && <LoadingOverlay message="Analyzing…" />}

      {result && (
        <GlassCard>
          <Text style={styles.resultTitle}>Nutrients</Text>
          {Object.entries(result).map(([k, v]) => (
            <Text key={k} style={styles.nutrient}>
              {k.charAt(0).toUpperCase() + k.slice(1)}: {String(v)} {k === 'calories' ? 'kcal' : 'g'}
            </Text>
          ))}
        </GlassCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Theme.spacing(2), backgroundColor: Theme.colors.background },
  title: { ...Theme.typography.h2, color: '#FFF', marginBottom: Theme.spacing(2) },
  photo: { padding: 0, overflow: 'hidden' },
  img: { width: '100%', height: 260, borderRadius: Theme.radius.md },
  resultTitle: { ...Theme.typography.h2, color: '#FFF', marginBottom: Theme.spacing(1) },
  nutrient: { ...Theme.typography.body, color: '#FFF', marginBottom: Theme.spacing(0.5) },
});