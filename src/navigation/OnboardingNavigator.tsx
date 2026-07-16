import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from './types';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { HealthProfileSetupScreen } from '../screens/onboarding/HealthProfileSetupScreen';
import { PermissionsScreen } from '../screens/onboarding/PermissionsScreen';
import { DisclaimerScreen } from '../screens/onboarding/DisclaimerScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#FAF8F5' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="HealthProfileSetup" component={HealthProfileSetupScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="Disclaimer" component={DisclaimerScreen} />
    </Stack.Navigator>
  );
}
