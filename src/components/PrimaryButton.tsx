import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}
export const PrimaryButton = ({ title, onPress, disabled }: Props) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.8}>
    <LinearGradient
      colors={disabled ? ['#666', '#666'] : [Theme.colors.primary, Theme.colors.primaryDark]}
      style={styles.btn}
    >
      <Text style={styles.text}>{title}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    paddingVertical: Theme.spacing(2.5), 
    paddingHorizontal: Theme.spacing(6), 
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    marginVertical: Theme.spacing(2), 
  },
  text: { ...Theme.typography.body, color: '#FFF', fontWeight: '600' },
});