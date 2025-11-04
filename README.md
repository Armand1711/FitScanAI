FitScanAI – Nutrition Intelligence in Your Pocket
FitScanAI is an AI-powered mobile app that helps you track meals, generate personalized nutrition plans, and achieve your fitness goals — all with a single photo.

Features









































ScreenHow to UseLogin / RegisterUse email + passwordOnboardingEnter name, diet, allergies, goal → AI sets calorie targetHomeView daily goal, 7-day trendScanTap "Take Photo" → AI analyzes → logs mealLogsView all scans + deletePlannerTap "Generate Plan" → AI creates meal planSavedView, copy, delete saved plansProfileUpload photo, change password

Tech Stack









































LayerTechnologyFrontendReact Native (Expo), TypeScriptUIGlassmorphism, expo-blur, expo-linear-gradientNavigation@react-navigation (Stack + Bottom Tabs)AIGoogle Gemini 1.5 Flash (generateContent)BackendFirebase Auth, FirestoreFontsInter (Google Fonts)IconsIoniconsSafe Areareact-native-safe-area-context

Quick Start
1. Clone & Install
bashgit clone https://github.com/Armand1711/FitScanAI
cd fitscanai
npm install
2. Firebase Setup

Go to Firebase Console
Create a project: fitscanai-df77a
Enable:

Authentication → Email/Password
Firestore Database (start in test mode)


Create the following collections:

mealLogs
savedPlans
users


Copy the Web SDK config into src/firebase.ts

ts// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "fitscanai-df77a.firebaseapp.com",
  projectId: "fitscanai-df77a",
  storageBucket: "fitscanai-df77a.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
3. Run the App
bashnpx expo start
Scan the QR code with Expo Go (iOS/Android)

Mockups & UI Flow







































Acknowledgements

Google AI Studio – Gemini Vision & Text API
Firebase – Authentication & Firestore
Expo – React Native framework
Inter Font – Google Fonts
ChatGPT – Code assistance & debugging


Demonstration Video

Watch FitScanAI Demo Video (link placeholder)

Final Notes

All assets in assets/
Ready for App Store / Play Store
No deprecation warnings
Static splash screen: splash-screen.png



FitScanAI – Eat smarter. Train better. Live healthier.


Built by Armand Naude
