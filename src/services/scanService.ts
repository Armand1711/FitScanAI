// src/services/scanService.ts
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Save scan result
export const saveScanResult = async (data: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  await addDoc(collection(db, 'mealLogs'), {
    userId: user.uid,
    ...data,
    date: new Date().toISOString(),
  });
};


export const getMealLogs = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log('getMealLogs: No user logged in');
    return [];
  }

  try {
    const q = query(
      collection(db, 'mealLogs'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );

    const snap = await getDocs(q);
    const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`getMealLogs: Loaded ${logs.length} logs`);
    return logs;
  } catch (error: any) {
    console.error('getMealLogs ERROR:', error.message);

    if (error.code === 'failed-precondition') {
      console.log('INDEX MISSING! Create it here:');
      console.log('https://console.firebase.google.com/v1/r/project/fitscanai-df77a/firestore/indexes?create_composite=ClBwcm9qZWN0cy9maXRzY2FuYWktZGY3N2EvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL21lYWxMb2dzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGggKBGRhdGUQAhoMCghfX25hbWVfXxAC');
    }

    return [];
  }
};

// Delete log
export const deleteMealLog = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'mealLogs', id));
    console.log(`Deleted log: ${id}`);
  } catch (error) {
    console.error('deleteMealLog error:', error);
    throw error;
  }
};