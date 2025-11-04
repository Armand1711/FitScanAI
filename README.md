# FitScanAI – Nutrition Intelligence in Your Pocket

**FitScanAI** is an AI-powered mobile app that helps you track meals, generate personalized nutrition plans, and achieve your fitness goals — all with a single photo.

---

## Features

| Screen | How to Use |
|--------|------------|
| **Login / Register** | Use email + password |
| **Onboarding** | Enter name, diet, allergies, goal → AI sets calorie target |
| **Home** | View daily goal, 7-day trend |
| **Scan** | Tap "Take Photo" → AI analyzes → logs meal |
| **Logs** | View all scans + delete |
| **Planner** | Tap "Generate Plan" → AI creates meal plan |
| **Saved** | View, copy, delete saved plans |
| **Profile** | Upload photo, change password |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native (Expo), TypeScript |
| **UI** | Glassmorphism, `expo-blur`, `expo-linear-gradient` |
| **Navigation** | `@react-navigation` (Stack + Bottom Tabs) |
| **AI** | Google Gemini 1.5 Flash (`generateContent`) |
| **Backend** | Firebase Auth, Firestore |
| **Fonts** | Inter (Google Fonts) |
| **Icons** | Ionicons |
| **Safe Area** | `react-native-safe-area-context` |

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Armand1711/FitScanAI
cd fitscanai
npm install