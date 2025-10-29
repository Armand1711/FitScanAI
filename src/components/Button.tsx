import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Theme } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}
export const Button = ({ title, onPress, disabled, variant = 'primary' }: Props) => {
  const bg = {
    primary: Theme.colors.primary,
    secondary: Theme.colors.surface,
    danger: Theme.colors.error,
  }[variant];

  const color = variant === 'secondary' ? Theme.colors.primary : '#FFF';

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg, opacity: disabled ? 0.6 : 1 }]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: Theme.spacing(1.5),
    paddingHorizontal: Theme.spacing(3),
    borderRadius: Theme.radius.sm,
    alignItems: 'center',
    ...Theme.shadow,
  },
  text: { fontWeight: '600', fontSize: 16 },
});