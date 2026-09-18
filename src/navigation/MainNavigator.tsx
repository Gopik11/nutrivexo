import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MainStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import { ResultsScreen } from '../screens/main/ResultsScreen';
import { EditProfileScreen } from '../screens/main/EditProfileScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { DisclaimerViewScreen } from '../screens/main/DisclaimerViewScreen';
import { DataPrivacyScreen } from '../screens/main/DataPrivacyScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#FAF8F5' },
      }}
    >
      <Stack.Screen name="Tabs" component={MainTabNavigator} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="DisclaimerView" component={DisclaimerViewScreen} />
      <Stack.Screen name="DataPrivacy" component={DataPrivacyScreen} />
    </Stack.Navigator>
  );
}
