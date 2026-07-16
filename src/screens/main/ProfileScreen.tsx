import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card, Badge } from '../../components/ui';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../store/useAppStore';

interface ProfileRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}

function ProfileRow({ icon, label, onPress }: ProfileRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="flex-row items-center py-4 border-b border-neutral-100"
    >
      <Ionicons name={icon} size={22} color="#A8734F" />
      <Text className="text-body text-neutral-800 flex-1 ml-3">{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#A89F92" />
    </Pressable>
  );
}

export function ProfileScreen() {
  const healthProfileDraft = useAppStore((state) => state.healthProfileDraft);
  const resetOnboarding = useAppStore((state) => state.resetOnboarding);

  return (
    <ScreenLayout title={strings.profile.title}>
      <Card variant="outlined" className="mb-4">
        <Text className="text-h3 text-neutral-800 mb-3">{strings.profile.healthProfile}</Text>
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
          Pattern: {healthProfileDraft.dietaryPattern}
        </Text>
      </Card>

      <Card variant="outlined" padding="none" className="px-4 mb-4">
        <ProfileRow icon="create-outline" label={strings.profile.editProfile} />
        <ProfileRow icon="settings-outline" label={strings.profile.settings} />
        <ProfileRow icon="document-text-outline" label={strings.profile.disclaimer} />
        <ProfileRow icon="lock-closed-outline" label={strings.profile.dataPrivacy} />
      </Card>

      <Pressable onPress={resetOnboarding} className="py-3">
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
