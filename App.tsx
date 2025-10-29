import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { auth, db } from './src/firebase';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ScanScreen from './src/screens/ScanScreen';
import LogScreen from './src/screens/LogScreen';
import PlannerScreen from './src/screens/PlannerScreen';
import ProfileScreen from './src/screens/ProfileScreen';


export type TabParamList = {
  Home: undefined;
  Scan: undefined;
  Logs: undefined;
  Planner: undefined;
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
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }}
    />
    <Tab.Screen
      name="Scan"
      component={ScanScreen}
      options={{ tabBarIcon: ({ color, size }) => <Ionicons name="camera" size={size} color={color} /> }}
    />
    <Tab.Screen
      name="Logs"
      component={LogScreen}
      options={{ tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} /> }}
    />
    <Tab.Screen
      name="Planner"
      component={PlannerScreen}
      options={{ tabBarIcon: ({ color, size }) => <Ionicons name="restaurant" size={size} color={color} /> }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{ tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} /> }}
    />
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
      const completed = snap.exists() && snap.data()?.onboardingCompleted === true;
      setNeedsOnboarding(!completed);
      setReady(true);
    })();
  }, [user]);

  return { ready, needsOnboarding, uid };
};


export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const { ready, needsOnboarding, uid } = useOnboardingCheck(user);

  
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  
  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#28A745" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* 1. NOT LOGGED IN */}
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : needsOnboarding && uid ? (
          /* 2. NEW USER → ONBOARDING */
          <Stack.Screen name="Onboarding" component={OnboardingScreen} initialParams={{ uid }} />
        ) : (
          /* 3. LOGGED IN + ONBOARDING DONE → MAIN TABS */
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});