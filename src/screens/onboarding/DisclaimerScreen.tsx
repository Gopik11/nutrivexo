import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Button, Card } from '../../components/ui';
import { strings } from '../../constants/strings';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Disclaimer'>;

export function DisclaimerScreen(_props: Props) {
  const disclaimerAccepted = useAppStore((state) => state.disclaimerAccepted);
  const setDisclaimerAccepted = useAppStore((state) => state.setDisclaimerAccepted);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const handleStart = () => {
    completeOnboarding();
  };

  return (
    <ScreenLayout
      title={strings.onboarding.disclaimer.title}
      subtitle={strings.onboarding.disclaimer.subtitle}
      footer={
        <Button
          label={strings.onboarding.disclaimer.startUsing}
          fullWidth
          disabled={!disclaimerAccepted}
          onPress={handleStart}
        />
      }
    >
      <Card variant="outlined" className="mb-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="medical-outline" size={20} color="#A8734F" />
          <Text className="text-h3 text-neutral-800 ml-2">
            {strings.onboarding.disclaimer.notMedical.title}
          </Text>
        </View>
        <Text className="text-body-sm text-neutral-600 leading-5">
          {strings.onboarding.disclaimer.notMedical.body}
        </Text>
      </Card>

      <Card variant="outlined" className="mb-6">
        <View className="flex-row items-center mb-2">
          <Ionicons name="shield-checkmark-outline" size={20} color="#A8734F" />
          <Text className="text-h3 text-neutral-800 ml-2">
            {strings.onboarding.disclaimer.dataPrivacy.title}
          </Text>
        </View>
        <Text className="text-body-sm text-neutral-600 leading-5">
          {strings.onboarding.disclaimer.dataPrivacy.body}
        </Text>
      </Card>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: disclaimerAccepted }}
        onPress={() => setDisclaimerAccepted(!disclaimerAccepted)}
        className="flex-row items-start"
      >
        <View
          className={[
            'w-6 h-6 rounded-md border items-center justify-center mr-3 mt-0.5',
            disclaimerAccepted ? 'bg-accent-500 border-accent-500' : 'border-neutral-300 bg-white',
          ].join(' ')}
        >
          {disclaimerAccepted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
        <Text className="text-body-sm text-neutral-700 flex-1 leading-5">
          {strings.onboarding.disclaimer.consent}
        </Text>
      </Pressable>
    </ScreenLayout>
  );
}
