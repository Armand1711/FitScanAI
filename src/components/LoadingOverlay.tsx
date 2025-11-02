import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Theme } from '../theme';

export const LoadingOverlay = ({ message }: { message?: string }) => (
  <View style={styles.overlay}>
    <ActivityIndicator size="large" color={Theme.colors.primary} />
    {message && <Text style={styles.msg}>{message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13,13,13,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  msg: { marginTop: 12, ...Theme.typography.caption },
});