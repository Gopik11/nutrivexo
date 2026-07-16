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

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
