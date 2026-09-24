import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  AnalysisResult,
  AppSettings,
  HouseholdMember,
  OnboardingHealthProfileDraft,
  SavedScan,
} from '../types';
import { generateId } from '../services/id';
import { cancelWeeklyDigest } from '../services/notifications';

const BACKUP_VERSION = 1;

interface BackupPayload {
  version: number;
  exportedAt: string;
  healthProfileDraft: OnboardingHealthProfileDraft;
  householdMembers: HouseholdMember[];
  activeMemberId: string | null;
  savedScans: SavedScan[];
  settings: AppSettings;
}

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
  /** Household/family profiles. Empty until the user adds their first one via the
   * Household screen — until then the app behaves exactly as a single-profile app. */
  householdMembers: HouseholdMember[];
  activeMemberId: string | null;

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
  /**
   * Dietary patterns are multi-select (someone can be vegetarian AND low-sodium),
   * except "No specific pattern" is exclusive of every other option: picking it
   * clears the rest, and picking anything else clears it.
   */
  toggleDietaryPattern: (pattern: string) => void;
  toggleMutedAmbiguousAllergen: (allergen: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  saveScan: (analysis: AnalysisResult) => SavedScan;
  deleteScan: (id: string) => void;
  clearHistory: () => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
  clearAllData: () => void;

  addHouseholdMember: (name: string) => void;
  renameHouseholdMember: (id: string, name: string) => void;
  removeHouseholdMember: (id: string) => void;
  /** Snapshots the current profile back into the outgoing active member, then loads the target
   * member's profile into `healthProfileDraft` — every existing screen keeps reading/writing
   * `healthProfileDraft` exactly as before, with no awareness that household mode exists. */
  switchActiveMember: (id: string) => void;

  /** Serializes everything the user would want backed up to a JSON string, for the user to save
   * via the OS share sheet (email, Drive, Files, etc) — there's no Nutrivexo server involved. */
  exportBackup: () => string;
  /** Restores from a JSON string previously produced by exportBackup. Replaces current data. */
  restoreBackup: (json: string) => { success: boolean; error?: string };
}

const NO_SPECIFIC_PATTERN = 'No specific pattern';

const defaultHealthProfileDraft: OnboardingHealthProfileDraft = {
  allergies: [],
  medicalConditions: [],
  dietaryPatterns: [NO_SPECIFIC_PATTERN],
  healthGoals: [],
};

const defaultSettings: AppSettings = {
  notificationsEnabled: false,
  weeklyDigestEnabled: false,
  highConcernAlertsEnabled: true,
  mutedAmbiguousAllergens: [],
};

function toSavedScan(analysis: AnalysisResult, scoredForMemberName?: string): SavedScan {
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
    lowConfidence: analysis.lowConfidence,
    scoredForMemberName,
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
      householdMembers: [],
      activeMemberId: null,

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

      toggleDietaryPattern: (pattern) => {
        const current = get().healthProfileDraft.dietaryPatterns;
        let next: string[];
        if (pattern === NO_SPECIFIC_PATTERN) {
          next = current.includes(NO_SPECIFIC_PATTERN) ? [] : [NO_SPECIFIC_PATTERN];
        } else if (current.includes(pattern)) {
          next = current.filter((value) => value !== pattern);
        } else {
          next = [...current.filter((value) => value !== NO_SPECIFIC_PATTERN), pattern];
        }
        set({ healthProfileDraft: { ...get().healthProfileDraft, dietaryPatterns: next } });
      },

      toggleMutedAmbiguousAllergen: (allergen) => {
        const current = get().settings.mutedAmbiguousAllergens ?? [];
        const next = current.includes(allergen)
          ? current.filter((value) => value !== allergen)
          : [...current, allergen];
        set({ settings: { ...get().settings, mutedAmbiguousAllergens: next } });
      },

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
        const { householdMembers, activeMemberId } = get();
        // Only tag a scan with who it was for once there's more than one member — with a single
        // (or no) household member, that context would just be noise in the history list.
        const scoredForMemberName =
          householdMembers.length > 1
            ? householdMembers.find((m) => m.id === activeMemberId)?.name
            : undefined;
        const savedScan = toSavedScan(analysis, scoredForMemberName);
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
          householdMembers: [],
          activeMemberId: null,
        });
      },

      addHouseholdMember: (name) => {
        // First member added: seed it from the current (single) profile so nothing is lost, and
        // make it explicitly "Me" before adding the new one alongside it.
        if (get().householdMembers.length === 0) {
          const meId = generateId('member');
          set({
            householdMembers: [{ id: meId, name: 'Me', profile: get().healthProfileDraft }],
            activeMemberId: meId,
          });
        }
        const newId = generateId('member');
        const newMember: HouseholdMember = {
          id: newId,
          name: name.trim() || 'New member',
          profile: defaultHealthProfileDraft,
        };
        set({ householdMembers: [...get().householdMembers, newMember] });
        get().switchActiveMember(newId);
      },

      renameHouseholdMember: (id, name) =>
        set({
          householdMembers: get().householdMembers.map((m) =>
            m.id === id ? { ...m, name: name.trim() || m.name } : m
          ),
        }),

      removeHouseholdMember: (id) => {
        const { householdMembers, activeMemberId } = get();
        const remaining = householdMembers.filter((m) => m.id !== id);
        if (activeMemberId !== id) {
          set({ householdMembers: remaining });
          return;
        }
        if (remaining.length === 0) {
          // Removed the only/last member — fall back to single-profile mode, keeping whatever
          // profile that member currently had active as the plain healthProfileDraft.
          set({ householdMembers: [], activeMemberId: null });
          return;
        }
        set({ householdMembers: remaining });
        get().switchActiveMember(remaining[0].id);
      },

      switchActiveMember: (id) => {
        const { householdMembers, activeMemberId, healthProfileDraft } = get();
        // Snapshot the outgoing member's in-progress edits back into their slot first.
        const updatedMembers = householdMembers.map((m) =>
          m.id === activeMemberId ? { ...m, profile: healthProfileDraft } : m
        );
        const target = updatedMembers.find((m) => m.id === id);
        if (!target) return;
        set({
          householdMembers: updatedMembers,
          activeMemberId: id,
          healthProfileDraft: target.profile,
        });
      },

      exportBackup: () => {
        const state = get();
        const backup: BackupPayload = {
          version: BACKUP_VERSION,
          exportedAt: new Date().toISOString(),
          healthProfileDraft: state.healthProfileDraft,
          householdMembers: state.householdMembers,
          activeMemberId: state.activeMemberId,
          savedScans: state.savedScans,
          settings: state.settings,
        };
        return JSON.stringify(backup, null, 2);
      },

      restoreBackup: (json) => {
        let parsed: Partial<BackupPayload>;
        try {
          parsed = JSON.parse(json);
        } catch {
          return {
            success: false,
            error: "That doesn't look like valid backup text — make sure you pasted the whole thing.",
          };
        }
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.savedScans)) {
          return { success: false, error: "That doesn't look like a Nutrivexo backup." };
        }
        set({
          healthProfileDraft: parsed.healthProfileDraft ?? defaultHealthProfileDraft,
          householdMembers: Array.isArray(parsed.householdMembers) ? parsed.householdMembers : [],
          activeMemberId: parsed.activeMemberId ?? null,
          savedScans: parsed.savedScans,
          settings: { ...defaultSettings, ...(parsed.settings ?? {}) },
        });
        return { success: true };
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
        householdMembers: state.householdMembers,
        activeMemberId: state.activeMemberId,
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
