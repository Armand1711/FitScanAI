// src/services/scanService.ts
import axios, { AxiosError } from 'axios';
import { auth, db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';

const GEMINI_API_KEY = 'AIzaSyDfFQVDNMK0EkrwI26kVuOeI8iGB_0y7TY';

export interface NutrientResult {
  calories?: number;
  proteins?: number;
  carbs?: number;
  fats?: number;
}


export const analyzeImage = async (base64: string): Promise<NutrientResult> => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  const prompt = `
You are a nutrition expert. Analyze this meal photo and estimate:
- Total calories (kcal)
- Proteins (g)
- Carbs (g)
- Fats (g)

Return ONLY valid JSON like:
{"calories":520,"proteins":25,"carbs":60,"fats":18}
`;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64 } },
          ],
        },
      ],
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in response');

  const parsed = JSON.parse(match[0]);
  return {
    calories: Number(parsed.calories) || undefined,
    proteins: Number(parsed.proteins) || undefined,
    carbs: Number(parsed.carbs) || undefined,
    fats: Number(parsed.fats) || undefined,
  };
};


export const saveScanResult = async (result: NutrientResult) => {
  if (!auth.currentUser) throw new Error('User not authenticated');

  await addDoc(collection(db, 'mealLogs'), {
    userId: auth.currentUser.uid,
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    ...result,
  });
};