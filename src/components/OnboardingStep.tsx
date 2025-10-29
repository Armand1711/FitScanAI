import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  children: React.ReactNode;
}
export const OnboardingStep = ({ title, children }: Props) => (
  <View style={styles.step}>
    <Text style={styles.title}>{title}</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  step: { marginBottom: 30, width: '100%', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
});