import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Theme } from '../theme';

export const Card = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing(2.5),
    ...Theme.shadow,
    marginBottom: Theme.spacing(2),
  },
});