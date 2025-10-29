/* src/screens/ProfileScreen.tsx */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { auth } from '../firebase';
import { getProfile, saveProfile, ProfileData } from '../services/profileService';
import { GoalInput } from '../components/GoalInput';
import { ProfileField } from '../components/ProfileField';
import { LogoutButton } from '../components/LogoutButton';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [goal, setGoal] = useState(2000);
  const [name, setName] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('None');

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async user => {
      if (user) {
        setUserId(user.uid);
        setLoading(true);
        try {
          const data = await getProfile(user.uid);
          setGoal(data.goal);
          setName(data.name ?? '');
          setDietaryPreference(data.dietaryPreference ?? 'None');
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      } else {
        setUserId(null);
        setGoal(2000);
        setName('');
        setDietaryPreference('None');
      }
    });
    return unsub;
  }, []);

 
  const handleSave = async () => {
    if (!userId || goal <= 0) {
      Alert.alert('Error', 'Please enter a valid goal > 0');
      return;
    }
    setSaving(true);
    try {
      const payload: ProfileData = { goal, name, dietaryPreference };
      await saveProfile(userId, payload);
      Alert.alert('Success', 'Profile saved!');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  
  const handleLogout = () => {
    auth
      .signOut()
      .then(() => Alert.alert('Logged Out', 'See you next time!'))
      .catch(() => Alert.alert('Error', 'Logout failed'));
  };

 
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#28A745" />
        <Text style={styles.loading}>Loading profile…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <ProfileField
        label="Name"
        value={name}
        onChange={setName}
        placeholder="Your name"
      />

      <GoalInput value={goal} onChange={setGoal} />

      <ProfileField
        label="Dietary Preference"
        value={dietaryPreference}
        onChange={setDietaryPreference}
        placeholder="e.g. vegetarian, vegan"
      />

      <Button
        title={saving ? 'Saving…' : 'Save Profile'}
        onPress={handleSave}
        color="#28A745"
        disabled={saving}
      />

      <LogoutButton onLogout={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  loading: { marginTop: 12, fontSize: 16, color: '#666' },
});