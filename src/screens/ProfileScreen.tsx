import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { Theme } from '../theme';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(2000);
  const [diet, setDiet] = useState('omnivore');
  const [allergies, setAllergies] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const d = snap.data();
        setName(d.name || '');
        setGoal(d.goal || 2000);
        setDiet(d.dietaryPreference || 'omnivore');
        setAllergies(d.allergies?.join(', ') || '');
        setPhoto(d.photo || null);
      }
    };
    load();
  }, []);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission', 'Gallery access required');

    const res = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });
    if (res.canceled || !res.assets?.[0]) return;

    setPhoto(res.assets[0].uri);
  };

  const save = async () => {
    setLoading(true);
    try {
      await setDoc(doc(db, 'users', auth.currentUser!.uid), {
        name,
        goal,
        dietaryPreference: diet,
        allergies: allergies.split(',').map(a => a.trim()).filter(Boolean),
        photo,
      }, { merge: true });
      Alert.alert('Saved', 'Profile updated');
    } catch (e) {
      Alert.alert('Error', 'Could not save');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = () => {
    Alert.prompt(
      'Change Password',
      'Enter current password',
      async (current) => {
        if (!current) return;
        Alert.prompt(
          'New Password',
          'Enter new password',
          async (newPass) => {
            if (!newPass) return;
            try {
              const credential = EmailAuthProvider.credential(auth.currentUser!.email!, current);
              await reauthenticateWithCredential(auth.currentUser!, credential);
              await updatePassword(auth.currentUser!, newPass);
              Alert.alert('Success', 'Password changed');
            } catch (e: any) {
              Alert.alert('Error', e.message);
            }
          }
        );
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <GlassCard>
        <TouchableOpacity onPress={pickPhoto} style={styles.photoContainer}>
          <Image source={{ uri: photo || 'https://via.placeholder.com/120' }} style={styles.photo} />
          <Text style={styles.photoText}>Change Photo</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{name}</Text>

        <Text style={styles.label}>Daily Goal</Text>
        <Text style={styles.value}>{goal} kcal</Text>

        <Text style={styles.label}>Diet</Text>
        <Text style={styles.value}>{diet}</Text>

        <Text style={styles.label}>Allergies</Text>
        <Text style={styles.value}>{allergies || 'None'}</Text>

        <PrimaryButton title="Save Changes" onPress={save} disabled={loading} />
        <PrimaryButton title="Change Password" onPress={changePassword} />
      </GlassCard>

      <PrimaryButton title="Logout" onPress={() => auth.signOut()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: Theme.spacing(2), backgroundColor: Theme.colors.background },
  photoContainer: { alignItems: 'center', marginBottom: Theme.spacing(3) },
  photo: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: Theme.colors.primary },
  photoText: { color: Theme.colors.primary, marginTop: 8 },
  label: { ...Theme.typography.caption, marginTop: Theme.spacing(2) },
  value: { ...Theme.typography.body, color: '#FFF', padding: Theme.spacing(1.5), backgroundColor: '#2D2D2D', borderRadius: Theme.radius.sm, marginBottom: Theme.spacing(1) },
});