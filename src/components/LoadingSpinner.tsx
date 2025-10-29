import React from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';

export const LoadingSpinner = ({ message }: { message?: string }) => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#28A745" />
    {message && <Text style={styles.text}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 12, fontSize: 16, color: '#666' },
});