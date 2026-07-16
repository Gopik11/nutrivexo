import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OnboardingHealthProfileDraft } from '../types';

interface AppState {
  hasCompletedOnboarding: boolean;
  disclaimerAccepted: boolean;
  cameraPermissionGranted: boolean;
  notificationsPermissionGranted: boolean;
  healthProfileDraft: OnboardingHealthProfileDraft;
  setDisclaimerAccepted: (accepted: boolean) => void;
  setCameraPermissionGranted: (granted: boolean) => void;
  setNotificationsPermissionGranted: (granted: boolean) => void;
  updateHealthProfileDraft: (patch: Partial<OnboardingHealthProfileDraft>) => void;
  toggleHealthProfileItem: (
    field: keyof Pick<
      OnboardingHealthProfileDraft,
      'allergies' | 'medicalConditions' | 'healthGoals'
    >,
    item: string
  ) => void;
  setDietaryPattern: (pattern: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const defaultHealthProfileDraft: OnboardingHealthProfileDraft = {
  allergies: [],
  medicalConditions: [],
  dietaryPattern: 'No specific pattern',
  healthGoals: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      disclaimerAccepted: false,
      cameraPermissionGranted: false,
      notificationsPermissionGranted: false,
      healthProfileDraft: defaultHealthProfileDraft,

      setDisclaimerAccepted: (accepted) => set({ disclaimerAccepted: accepted }),

      setCameraPermissionGranted: (granted) => set({ cameraPermissionGranted: granted }),

      setNotificationsPermissionGranted: (granted) =>
        set({ notificationsPermissionGranted: granted }),

      updateHealthProfileDraft: (patch) =>
        set({ healthProfileDraft: { ...get().healthProfileDraft, ...patch } }),

      toggleHealthProfileItem: (field, item) => {
        const current = get().healthProfileDraft[field];
        const next = current.includes(item)
          ? current.filter((value) => value !== item)
          : [...current, item];
        set({ healthProfileDraft: { ...get().healthProfileDraft, [field]: next } });
      },

      setDietaryPattern: (pattern) =>
        set({
          healthProfileDraft: { ...get().healthProfileDraft, dietaryPattern: pattern },
        }),

      completeOnboarding: () => set({ hasCompletedOnboarding: true }),

      resetOnboarding: () =>
        set({
          hasCompletedOnboarding: false,
          disclaimerAccepted: false,
          cameraPermissionGranted: false,
          notificationsPermissionGranted: false,
          healthProfileDraft: defaultHealthProfileDraft,
        }),
    }),
    {
      name: 'nutrivexo-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        healthProfileDraft: state.healthProfileDraft,
      }),
    }
  )
);
