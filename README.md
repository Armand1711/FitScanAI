# FitScanAI — Nutrition Intelligence in Your Pocket

[![Expo](https://img.shields.io/badge/Expo-✔️-4CAF50)](https://expo.dev/) [![React Native](https://img.shields.io/badge/React%20Native-✔️-61DAFB)](https://reactnative.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-✔️-3178C6)](https://www.typescriptlang.org/) [![Firebase](https://img.shields.io/badge/Firebase-✔️-FFCA28)](https://firebase.google.com/) [![Gemini AI](https://img.shields.io/badge/Google%20Gemini-vision%20%2B%20text-4285F4)](https://ai.google/) [![License](https://img.shields.io/badge/License-MIT-%23000000)](LICENSE)

FitScanAI is an AI-powered mobile app that helps you track meals, generate personalized nutrition plans, and reach your fitness goals — all from a single photo.

---

## Demo Video


  https://youtu.be/e56sno5W8wg



## Features

- Login / Register (email + password)
- Onboarding: name, diet, allergies, goal → AI sets calorie target
- Home: daily calorie goal and 7-day trend
- Scan: take a photo → AI estimates calories & macronutrients → logs meal
- Logs: view, delete, and manage meal entries
- Planner: generate personalized meal plans
- Saved: store and re-use generated plans
- Profile: update avatar and password

--- 

## Tech Stack

- Frontend: React Native (Expo), TypeScript
- UI: Glassmorphism with `expo-blur`, `expo-linear-gradient`
- Navigation: `@react-navigation` (Stack + Bottom Tabs)
- AI: Google Gemini (Vision + Text) — `generateContent` API
- Backend: Firebase Authentication & Firestore
- Fonts: Inter
- Icons: Ionicons
- Safe areas: `react-native-safe-area-context`

--- 

## Quick Start

1. Clone & install
```bash
git clone https://github.com/Armand1711/FitScanAI.git
cd FitScanAI
npm install
```

2. Set up environment
- Create a `.env` (do NOT commit) at the project root:

```
GEMINI_API_KEY=your_google_gemini_api_key_here
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

- Add `.env` to `.gitignore`.

3. Expose env to Expo
Create `app.config.js` at project root:

```js
// app.config.js
const dotenv = require('dotenv');
dotenv.config();

module.exports = ({ config }) => ({
  ...config,
  extra: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || '',
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || '',
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || '',
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || '',
  },
});
```

4. Configure Firebase
Create `src/firebase.ts` and paste your Firebase config (example):

```ts
// src/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import Constants from 'expo-constants';

const extra = (Constants.expoConfig?.extra ?? {}) as any;

const firebaseConfig = {
  apiKey: extra.FIREBASE_API_KEY,
  authDomain: extra.FIREBASE_AUTH_DOMAIN,
  projectId: extra.FIREBASE_PROJECT_ID,
  storageBucket: extra.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID,
  appId: extra.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

5. Start the app
```bash
npx expo start -c
```
Scan the QR code with Expo Go (or run on a simulator).

---

## Environment & Secrets — Important

- Do NOT hardcode API keys in source. Use `.env` + `app.config.js` (or EAS secrets) for Expo.
- For production builds, use EAS secrets or cloud secret management.
- Restart Metro with the `-c` flag after changing env values to clear cache.

--- 

## Gemini Vision Notes

- The app sends compressed/resized base64 images to Gemini. Reduce image size to avoid rate limits.
- If you encounter 429 (rate limit), the app includes exponential backoff retry logic. For heavy usage, request quota increases from Google or use batching.

--- 

## Firestore Collections

- `users` — onboarding info (onboardingCompleted, profile, preferences)
- `mealLogs` — stored scans: { userId, date, calories, protein, carbs, fat, rawImageUri }
- `savedPlans` — generated meal plans per user

--- 

## Troubleshooting

- "GEMINI_API_KEY missing" — ensure `.env` exists and `app.config.js` is configured, then restart Metro:
  `npx expo start -c`
- For bundling/TS errors, open the terminal output in VS Code and fix the reported file/line.
- If you see leaked keys in code, rotate the key immediately.

--- 

## Contributing

- Fork → feature branch → open PR
- Keep secrets out of commits
- Run linter & tests before PR

--- 

## License

MIT — see LICENSE file.

--- 

Built by Armand Naude — FitScanAI: Eat smarter. Train better. Live healthier.