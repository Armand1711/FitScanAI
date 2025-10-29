import React from 'react';
import { Text, TextInput, StyleSheet } from 'react-native';

interface Props {
  value: number;
  onChange: (v: number) => void;
}
export const GoalInput = ({ value, onChange }: Props) => (
  <>
    <Text style={styles.label}>Daily Calorie Goal</Text>
    <TextInput
      style={styles.input}
      keyboardType="numeric"
      value={value.toString()}
      onChangeText={t => onChange(Number(t) || 2000)}
      placeholder="e.g. 2500"
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