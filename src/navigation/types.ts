import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AnalysisResult } from '../types';

export type OnboardingStackParamList = {
  Welcome: undefined;
  HealthProfileSetup: undefined;
  Permissions: undefined;
  Disclaimer: undefined;
};

export type MainTabParamList = {
  Scan: undefined;
  History: undefined;
  Insights: undefined;
  Profile: undefined;
};

/** Results can be opened either with a freshly computed analysis, or by id from history. */
export type ResultsRouteParams = { analysis: AnalysisResult } | { scanId: string };

export type MainStackParamList = {
  Tabs: NavigatorScreenParams<MainTabParamList>;
  Results: ResultsRouteParams;
  EditProfile: undefined;
  Settings: undefined;
  DisclaimerView: undefined;
  DataPrivacy: undefined;
  Household: undefined;
  Backup: undefined;
  Compare: { scanIds: string[] };
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainStackParamList>;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  NativeStackScreenProps<MainStackParamList>
>;

export type MainStackScreenProps<T extends keyof MainStackParamList> = NativeStackScreenProps<
  MainStackParamList,
  T
>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
