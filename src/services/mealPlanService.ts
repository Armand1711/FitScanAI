// src/services/mealPlanService.ts
import { addDoc, collection, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';

// YOUR KEY – HARD‑CODED
const GEMINI_API_KEY = 'AIzaSyDfFQVDNMK0EkrwI26kVuOeI8iGB_0y7TY';

export interface SavedMealPlan {
  id?: string;
  goal: number;
  diet: string;
  allergies: string[];
  planText: string;
  createdAt: string;
}

/* ---------- SAVE ---------- */
export const saveMealPlan = async (plan: Omit<SavedMealPlan, 'id' | 'createdAt'>) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  const ref = await addDoc(collection(db, 'savedPlans'), {
    ...plan,
    userId: auth.currentUser.uid,
    createdAt: new Date().toISOString(),
  });

  return { id: ref.id, ...plan, createdAt: new Date().toISOString() };
};

/* ---------- GET ---------- */
export const getSavedPlans = async (): Promise<SavedMealPlan[]> => {
  if (!auth.currentUser) return [];

  const q = query(
    collection(db, 'savedPlans'),
    where('userId', '==', auth.currentUser.uid)
  );

  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
  } as SavedMealPlan));
};

/* ---------- DELETE ---------- */
export const deleteMealPlan = async (id: string) => {
  await deleteDoc(doc(db, 'savedPlans', id));
};

/* ---------- GENERATE ---------- */
export const generateMealPlan = async (profile: {
  goal: number;
  dietaryPreference: string;
  allergies: string[];
}) => {
  const allergiesText = profile.allergies.length
    ? `Avoid these allergies: ${profile.allergies.join(', ')}.`
    : 'No allergies specified.';

  const prompt = `
You are a nutrition expert. Create a **balanced ${profile.goal} kcal daily meal plan** for a **${profile.dietaryPreference}** diet.
${allergiesText}
Include **breakfast, lunch, dinner, and 1‑2 snacks** with **approximate calorie counts** for each item.
Return **only plain text** – no markdown, no JSON.
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Failed to generate plan');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
};