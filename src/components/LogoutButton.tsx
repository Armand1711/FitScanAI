import React from 'react';
import { Button, View, StyleSheet } from 'react-native';
import { auth } from '../firebase';

interface Props {
  onLogout: () => void;
}
export const LogoutButton = ({ onLogout }: Props) => (
  <View style={styles.container}>
    <Button title="Logout" onPress={onLogout} color="#DC3545" />
  </View>
);

const styles = StyleSheet.create({
  container: { marginTop: 20 },
});