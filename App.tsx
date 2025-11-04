import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

import { auth, db } from './src/firebase';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import LogScreen from './src/screens/LogScreen';
import PlannerScreen from './src/screens/PlannerScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SavedPlansScreen from './src/screens/SavedPlansScreen';
import { Theme } from './src/theme';

SplashScreen.preventAutoHideAsync();

export type TabParamList = {
  Home: undefined;
  Scan: undefined;
  Logs: undefined;
  Planner: undefined;
  Saved: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: { uid: string };
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: Theme.colors.primary,
      tabBarInactiveTintColor: '#B0B0B0',
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} /> }} />
    <Tab.Screen name="Scan" component={ScanScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="camera" size={24} color={color} /> }} />
    <Tab.Screen name="Logs" component={LogScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} /> }} />
    <Tab.Screen name="Planner" component={PlannerScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="restaurant" size={24} color={color} /> }} />
    <Tab.Screen name="Saved" component={SavedPlansScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="bookmark" size={24} color={color} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} /> }} />
  </Tab.Navigator>
);

const useOnboardingCheck = (user: User | null) => {
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setReady(true);
      return;
    }
    (async () => {
      setUid(user.uid);
      const snap = await getDoc(doc(db, 'users', user.uid));
      setNeedsOnboarding(!snap.exists() || !snap.data()?.onboardingCompleted);
      setReady(true);
    })();
  }, [user]);

  return { ready, needsOnboarding, uid };
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const { ready, needsOnboarding, uid } = useOnboardingCheck(user);
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  useEffect(() => {
    if (fontsLoaded && ready) SplashScreen.hideAsync();
  }, [fontsLoaded, ready]);

  if (!fontsLoaded || !ready) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!user ? (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : needsOnboarding && uid ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} initialParams={{ uid }} />
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Theme.colors.background },
  tabBar: {
    backgroundColor: 'rgba(26,26,26,0.9)',
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingBottom: 10,
    paddingTop: 10,
    height: 60,
  },
});