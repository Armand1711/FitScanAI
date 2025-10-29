import { addDoc, collection, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface SavedMealPlan {
  id?: string;
  goal: number;
  diet: string;
  allergies: string[];
  planText: string;
  createdAt: string;
}


export const saveMealPlan = async (plan: SavedMealPlan) => {
  if (!auth.currentUser) throw new Error('Not authenticated');
  const ref = await addDoc(collection(db, 'savedPlans'), {
    ...plan,
    userId: auth.currentUser.uid,
    createdAt: new Date().toISOString(),
  });
  return { id: ref.id, ...plan };
};


export const getSavedPlans = async (): Promise<SavedMealPlan[]> => {
  if (!auth.currentUser) return [];
  const q = query(collection(db, 'savedPlans'), where('userId', '==', auth.currentUser.uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as SavedMealPlan));
};


export const deleteMealPlan = async (id: string) => {
  await deleteDoc(doc(db, 'savedPlans', id));
};