import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/ScreenLayout';
import { ChipSection } from '../../components/SelectableChip';
import { Button } from '../../components/ui';
import { strings } from '../../constants/strings';
import { allergensForRegion } from '../../data/allergens';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'HealthProfileSetup'>;

export function HealthProfileSetupScreen({ navigation }: Props) {
  const healthProfileDraft = useAppStore((state) => state.healthProfileDraft);
  const toggleHealthProfileItem = useAppStore((state) => state.toggleHealthProfileItem);
  const toggleDietaryPattern = useAppStore((state) => state.toggleDietaryPattern);
  const region = useAppStore((state) => state.settings.region ?? 'US');
  const allergyOptions = allergensForRegion(region);

  return (
    <ScreenLayout
      title={strings.onboarding.healthProfile.title}
      subtitle={strings.onboarding.healthProfile.subtitle}
      footer={
        <Button
          label={strings.common.continue}
          fullWidth
          onPress={() => navigation.navigate('Permissions')}
        />
      }
    >
      <ChipSection
        title={strings.onboarding.healthProfile.allergies.title}
        subtitle={strings.onboarding.healthProfile.allergies.subtitle}
        options={allergyOptions}
        selected={healthProfileDraft.allergies}
        onToggle={(item) => toggleHealthProfileItem('allergies', item)}
      />

      <ChipSection
        title={strings.onboarding.healthProfile.conditions.title}
        subtitle={strings.onboarding.healthProfile.conditions.subtitle}
        options={strings.onboarding.healthProfile.conditions.options}
        selected={healthProfileDraft.medicalConditions}
        onToggle={(item) => toggleHealthProfileItem('medicalConditions', item)}
      />

      <ChipSection
        title={strings.onboarding.healthProfile.dietaryPattern.title}
        subtitle={strings.onboarding.healthProfile.dietaryPattern.subtitle}
        options={strings.onboarding.healthProfile.dietaryPattern.options}
        selected={healthProfileDraft.dietaryPatterns}
        onToggle={(item) => toggleDietaryPattern(item)}
      />

      <ChipSection
        title={strings.onboarding.healthProfile.goals.title}
        subtitle={strings.onboarding.healthProfile.goals.subtitle}
        options={strings.onboarding.healthProfile.goals.options}
        selected={healthProfileDraft.healthGoals}
        onToggle={(item) => toggleHealthProfileItem('healthGoals', item)}
      />
    </ScreenLayout>
  );
}
