import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card, Badge } from '../../components/ui';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../store/useAppStore';
import type { MainTabScreenProps } from '../../navigation/types';

interface ProfileRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}

function ProfileRow({ icon, label, onPress }: ProfileRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="flex-row items-center py-4 border-b border-neutral-100"
    >
      <Ionicons name={icon} size={22} color="#A8734F" />
      <Text className="text-body text-neutral-800 flex-1 ml-3">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#A89F92" />
    </Pressable>
  );
}

export function ProfileScreen({ navigation }: MainTabScreenProps<'Profile'>) {
  const healthProfileDraft = useAppStore((state) => state.healthProfileDraft);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);
  const savedScans = useAppStore((state) => state.savedScans);

  const confirmResetOnboarding = () => {
    Alert.alert(
      'Reset onboarding?',
      'This replays the welcome flow. Your scan history and health profile stay put.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: resetOnboarding },
      ]
    );
  };

  return (
    <ScreenLayout title={strings.profile.title}>
      <Card variant="outlined" className="mb-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-h3 text-neutral-800">{strings.profile.healthProfile}</Text>
          <Text className="text-caption text-neutral-500">{savedScans.length} scans saved</Text>
        </View>
        <View className="flex-row flex-wrap gap-2">
          {healthProfileDraft.allergies.length > 0 ? (
            healthProfileDraft.allergies.map((allergy) => (
              <Badge key={allergy} label={allergy} variant="alert" />
            ))
          ) : (
            <Text className="text-body-sm text-neutral-500">No allergies selected</Text>
          )}
        </View>
        <Text className="text-body-sm text-neutral-500 mt-3">
          Pattern: {healthProfileDraft.dietaryPatterns.join(', ') || 'No specific pattern'}
        </Text>
        {healthProfileDraft.healthGoals.length > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-3">
            {healthProfileDraft.healthGoals.map((goal) => (
              <Badge key={goal} label={goal} variant="info" />
            ))}
          </View>
        )}
      </Card>

      <Card variant="outlined" padding="none" className="px-4 mb-4">
        <ProfileRow
          icon="create-outline"
          label={strings.profile.editProfile}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <ProfileRow
          icon="settings-outline"
          label={strings.profile.settings}
          onPress={() => navigation.navigate('Settings')}
        />
        <ProfileRow
          icon="document-text-outline"
          label={strings.profile.disclaimer}
          onPress={() => navigation.navigate('DisclaimerView')}
        />
        <ProfileRow
          icon="lock-closed-outline"
          label={strings.profile.dataPrivacy}
          onPress={() => navigation.navigate('DataPrivacy')}
        />
      </Card>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reset onboarding"
        onPress={confirmResetOnboarding}
        className="py-3"
      >
        <Text className="text-body-sm text-neutral-400 text-center">
          Reset onboarding (dev)
        </Text>
      </Pressable>

      <Text className="text-caption text-neutral-400 text-center mt-2">
        {strings.profile.version} 1.0.0
      </Text>
    </ScreenLayout>
  );
}
