import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export interface ProfileData {
  goal: number;
  name?: string;
  dietaryPreference?: string;
}

export const getProfile = async (uid: string): Promise<ProfileData> => {
  const snap = await getDoc(doc(db, 'users', uid));
  if (snap.exists()) {
    const data = snap.data();
    return {
      goal: data.goal ?? 2000,
      name: data.name ?? '',
      dietaryPreference: data.dietaryPreference ?? 'None',
    };
  }
  return { goal: 2000 };
};

export const saveProfile = async (uid: string, data: ProfileData) => {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
};