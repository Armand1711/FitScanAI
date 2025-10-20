import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAHLJoC3-3PIwd6QprjaYQL_VIFudos0VE",
  authDomain: "fitscanai-df77a.firebaseapp.com",
  projectId: "fitscanai-df77a",
  storageBucket: "fitscanai-df77a.firebasestorage.app",
  messagingSenderId: "145515939725",
  appId: "1:145515939725:web:e07c5a68a9a2d2eabc1fc4",
  measurementId: "G-DJN1P6JDVG" // Optional
};

const app = initializeApp(firebaseConfig);
// Use basic auth initialization without explicit persistence for now
export const auth = getAuth(app);
export const db = getFirestore(app);