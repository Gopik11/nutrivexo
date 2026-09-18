# Nutrivexo

AI-powered mobile app that scans product ingredient labels and delivers personalized health insights.

## Tech Stack

- **Expo** (React Native, TypeScript)
- **React Navigation** — onboarding stack + main tabs
- **Zustand** — app state with persisted health profile
- **NativeWind** — Tailwind-based design system

## Getting Started

```bash
npm install
npm start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Project Structure

```
src/
  components/ui/     # Design system (Button, Card, Badge, ScoreRing, AlertBanner)
  constants/       # Theme tokens + centralized strings
  navigation/      # Root, onboarding, and tab navigators
  screens/         # Onboarding + main tab screens
  store/           # Zustand state
  types/           # Data model types
```

## Phases

- **Phase 1** ✓ Scaffold, design system, navigation
- **Phase 2** ✓ Camera scan flow & on-device OCR pipeline (with manual-entry fallback)
- **Phase 3** ✓ Analysis engine & results screen
- **Phase 4** ✓ History, insights & notifications
- **Phase 5** ✓ Profile polish, error states, accessibility

## How scanning works

Nutrivexo never sends your data anywhere — all OCR and analysis run on-device:

1. **Capture**: point the camera at a label, or switch to "Type it in" and paste/type the ingredient list yourself.
2. **OCR**: on-device ML Kit text recognition (`@react-native-ml-kit/text-recognition`) reads the photo. This is a native module, so it only works in a [custom dev client](https://docs.expo.dev/develop/development-builds/introduction/) build (`npx expo prebuild` + `expo run:ios` / `expo run:android`, or an EAS build) — **not** in plain Expo Go. If it's unavailable, the app automatically offers manual entry instead, so it's always usable.
3. **Match**: `src/services/ingredientMatcher.ts` matches recognized text against the curated database in `src/data/ingredients.ts` (exact, alias, and OCR-typo-tolerant fuzzy matching).
4. **Score**: `src/services/scoring.ts` combines matched ingredients, any nutrition facts it could parse, and your health profile into a 0–100 score, allergen alerts, and recommendations.
5. **Save**: results can be saved to History, which powers the Insights trends and (optionally) a local notification when a saved scan matches one of your allergies.

The ingredient database is a curated, general-education reference, not a medical or regulatory database — see the in-app Disclaimer.

## Design

Warm earth-tone accent palette with muted green/amber/red score states. All user-facing copy lives in `src/constants/strings.ts`.
"# nutrivexo" 
"# nutrivexo" 
