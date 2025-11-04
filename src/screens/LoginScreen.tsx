import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { Theme } from '../theme';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const login = async () => {
    if (!email || !password) return Alert.alert('Error', 'Fill in all fields');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      Alert.alert('Login Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <GlassCard style={styles.card}>
        <Text style={styles.title}>Welcome Back</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#B0B0B0"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#B0B0B0"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <PrimaryButton title={loading ? 'Logging in...' : 'Login'} onPress={login} disabled={loading} />
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          Don't have an account? Sign Up
        </Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: Theme.colors.background, padding: Theme.spacing(2) },
  card: { width: '100%' },
  title: { ...Theme.typography.h2, color: '#FFF', textAlign: 'center', marginBottom: Theme.spacing(3) },
  input: {
    backgroundColor: '#2D2D2D',
    color: '#FFF',
    padding: Theme.spacing(2),
    borderRadius: Theme.radius.sm,
    marginBottom: Theme.spacing(2),
  },
  link: { color: Theme.colors.primary, textAlign: 'center', marginTop: Theme.spacing(2) },
});