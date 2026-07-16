import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { MainTabParamList } from './types';
import { strings } from '../constants/strings';
import { ScanScreen } from '../screens/main/ScanScreen';
import { HistoryScreen } from '../screens/main/HistoryScreen';
import { InsightsScreen } from '../screens/main/InsightsScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabIconName = keyof typeof Ionicons.glyphMap;

const tabIcons: Record<keyof MainTabParamList, { active: TabIconName; inactive: TabIconName }> = {
  Scan: { active: 'scan', inactive: 'scan-outline' },
  History: { active: 'time', inactive: 'time-outline' },
  Insights: { active: 'analytics', inactive: 'analytics-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Scan"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#A8734F',
        tabBarInactiveTintColor: '#A89F92',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E8E2D9',
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 6,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = tabIcons[route.name];
          return (
            <Ionicons name={focused ? icons.active : icons.inactive} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Scan" component={ScanScreen} options={{ title: strings.tabs.scan }} />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ title: strings.tabs.history }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ title: strings.tabs.insights }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: strings.tabs.profile }}
      />
    </Tab.Navigator>
  );
}
