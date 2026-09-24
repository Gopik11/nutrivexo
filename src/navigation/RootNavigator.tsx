import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from './types';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainNavigator } from './MainNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);
  const hasHydrated = useAppStore((state) => state.hasHydrated);

  if (!hasHydrated) {
    // Hold here instead of rendering a screen: hasCompletedOnboarding is still the in-code default
    // at this point, not the persisted value, so rendering either branch could briefly show the
    // wrong one for a returning user. Same background as the native splash screen for a seamless
    // handoff, so this doesn't read as an extra loading screen.
    return (
      <View className="flex-1 items-center justify-center bg-[#FAF8F5]">
        <ActivityIndicator color="#A8734F" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {hasCompletedOnboarding ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
