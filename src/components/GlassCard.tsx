import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Theme } from '../theme';

export const GlassCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <BlurView intensity={80} tint="dark" style={[styles.card, style]}>
    {children}
  </BlurView>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26,26,26,0.7)',
    borderRadius: Theme.radius.md,
    padding: Theme.spacing(3),
    borderWidth: 1,
    borderColor: Theme.colors.border,
    ...Theme.shadow,
  },
});