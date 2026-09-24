import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AnalysisResult, AppSettings, OnboardingHealthProfileDraft, SavedScan } from '../types';
import { generateId } from '../services/id';
import { cancelWeeklyDigest } from '../services/notifications';

interface AppState {
  hasCompletedOnboarding: boolean;
  /** True once the persisted store has finished loading from AsyncStorage. Not persisted itself —
   * always starts false so RootNavigator can hold a loading state instead of briefly rendering
   * onboarding for a returning user before the real hasCompletedOnboarding value is known. */
  hasHydrated: boolean;
  disclaimerAccepted: boolean;
  cameraPermissionGranted: boolean;
  notificationsPermissionGranted: boolean;
  healthProfileDraft: OnboardingHealthProfileDraft;
  savedScans: SavedScan[];
  settings: AppSettings;

  setHasHydrated: (hydrated: boolean) => void;
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

  saveScan: (analysis: AnalysisResult) => SavedScan;
  deleteScan: (id: string) => void;
  clearHistory: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  clearAllData: () => void;
}

const defaultHealthProfileDraft: OnboardingHealthProfileDraft = {
  allergies: [],
  medicalConditions: [],
  dietaryPattern: 'No specific pattern',
  healthGoals: [],
};

const defaultSettings: AppSettings = {
  notificationsEnabled: false,
  weeklyDigestEnabled: false,
  highConcernAlertsEnabled: true,
};

function toSavedScan(analysis: AnalysisResult): SavedScan {
  return {
    id: generateId('savedscan'),
    scannedAt: new Date().toISOString(),
    product: analysis.product,
    score: analysis.score,
    scoreLevel: analysis.scoreLevel,
    alerts: analysis.alerts,
    recommendations: analysis.recommendations,
    matchedIngredientNames: analysis.matchedIngredients.map((m) => m.ingredient.name),
    unmatchedTerms: analysis.unmatchedTerms,
    scoreFactors: analysis.scoreFactors,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      hasHydrated: false,
      disclaimerAccepted: false,
      cameraPermissionGranted: false,
      notificationsPermissionGranted: false,
      healthProfileDraft: defaultHealthProfileDraft,
      savedScans: [],
      settings: defaultSettings,

      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),

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

      saveScan: (analysis) => {
        const savedScan = toSavedScan(analysis);
        set({ savedScans: [savedScan, ...get().savedScans] });
        return savedScan;
      },

      deleteScan: (id) => set({ savedScans: get().savedScans.filter((scan) => scan.id !== id) }),

      clearHistory: () => set({ savedScans: [] }),

      updateSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

      clearAllData: () => {
        // Cancel any OS-level scheduled notification too — resetting `settings` alone would leave
        // a previously-scheduled weekly digest armed even though the Settings toggle now shows off.
        cancelWeeklyDigest().catch(() => {});
        set({
          savedScans: [],
          healthProfileDraft: defaultHealthProfileDraft,
          settings: defaultSettings,
        });
      },
    }),
    {
      name: 'nutrivexo-app-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        healthProfileDraft: state.healthProfileDraft,
        savedScans: state.savedScans,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state, error) => {
        // Always flip hasHydrated, even if AsyncStorage read failed — otherwise RootNavigator's
        // loading state would hang forever instead of falling back to onboarding.
        if (state) {
          state.setHasHydrated(true);
        } else {
          useAppStore.setState({ hasHydrated: true });
        }
        if (error) {
          console.warn('Nutrivexo: failed to rehydrate persisted state', error);
        }
      },
    }
  )
);
