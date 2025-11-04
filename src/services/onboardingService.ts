// src/services/onboardingService.ts
import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

// YOUR KEY – HARD‑CODED
const GEMINI_API_KEY = 'AIzaSyDfFQVDNMK0EkrwI26kVuOeI8iGB_0y7TY';

export interface OnboardingData {
  allergies: string[];
  diet: string;
  fitnessGoal: string;
  name?: string;
}

export const calculateCalorieGoal = async (data: OnboardingData): Promise<number> => {
  const prompt = `
You are a nutrition expert. The user provided:
- Allergies: ${data.allergies.join(', ') || 'none'}
- Preferred diet: ${data.diet}
- Fitness goal: ${data.fitnessGoal}

Estimate a **realistic daily calorie target** (in kcal) for a healthy adult.
Return **only the number**, nothing else.
`;

  try {
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const text = res.data.candidates?.[0]?.content?.parts?.[0]?.text ?? '2000';
    const parsed = Number(text.trim());
    return isNaN(parsed) ? 2000 : parsed;
  } catch (error: any) {
    console.error('calculateCalorieGoal error:', error.response?.data || error.message);
    return 2000; // Fallback
  }
};

export const saveOnboarding = async (uid: string, data: OnboardingData, goal: number) => {
  await setDoc(
    doc(db, 'users', uid),
    {
      ...data,
      goal,
      onboardingCompleted: true,
      createdAt: new Date().toISOString(),
    },
    { merge: true }
  );
};