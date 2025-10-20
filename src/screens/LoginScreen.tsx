import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    console.log('Email checked:', email, 'Valid:', emailRegex.test(email)); // Debug log
    return emailRegex.test(email);
  };

  const handleSignUp = () => {
    if (!email || !password || password.length < 6 || !isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email and a password (at least 6 characters).');
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        Alert.alert('Success', 'Account created!');
        // Automatically populate Firestore (see Step 2)
      })
      .catch((error) => Alert.alert('Error', error.message));
  };

  const handleLogin = () => {
    if (!email || !password || !isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email and password.');
      return;
    }
    signInWithEmailAndPassword(auth, email, password)
      .then(() => Alert.alert('Success', 'Logged in!'))
      .catch((error) => Alert.alert('Error', error.message));
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Login" onPress={handleLogin} />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 },
});