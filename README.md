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
- **Phase 2** — Camera scan flow & OCR pipeline
- **Phase 3** — Analysis engine & results screen
- **Phase 4** — History, insights & notifications
- **Phase 5** — Profile polish, error states, accessibility

## Design

Warm earth-tone accent palette with muted green/amber/red score states. All user-facing copy lives in `src/constants/strings.ts`.
"# nutrivexo" 
"# nutrivexo" 
