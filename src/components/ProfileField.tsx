import React from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}
export const ProfileField = ({ label, value, onChange, placeholder }: Props) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
    />
  </>
);

const styles = StyleSheet.create({
  label: { fontSize: 16, marginBottom: 5, alignSelf: 'flex-start' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    width: 200,
    borderRadius: 5,
    textAlign: 'center',
  },
});