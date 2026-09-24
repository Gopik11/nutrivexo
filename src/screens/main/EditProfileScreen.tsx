import { ScreenLayout } from '../../components/ScreenLayout';
import { ChipSection } from '../../components/SelectableChip';
import { Button } from '../../components/ui';
import { strings } from '../../constants/strings';
import { allergensForRegion } from '../../data/allergens';
import { useAppStore } from '../../store/useAppStore';
import type { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const healthProfileDraft = useAppStore((state) => state.healthProfileDraft);
  const toggleHealthProfileItem = useAppStore((state) => state.toggleHealthProfileItem);
  const toggleDietaryPattern = useAppStore((state) => state.toggleDietaryPattern);
  const region = useAppStore((state) => state.settings.region ?? 'US');
  const allergyOptions = allergensForRegion(region);

  return (
    <ScreenLayout
      onBack={() => navigation.goBack()}
      title={strings.profile.editProfile}
      subtitle="Changes save automatically and apply to your next scan."
      footer={<Button label={strings.common.done} fullWidth onPress={() => navigation.goBack()} />}
    >
      <ChipSection
        title={strings.onboarding.healthProfile.allergies.title}
        subtitle={
          region === 'EU'
            ? `${strings.onboarding.healthProfile.allergies.subtitle} Using the EU's 14-allergen list — change this in Settings.`
            : `${strings.onboarding.healthProfile.allergies.subtitle} Using the US's 9-allergen list — change this in Settings.`
        }
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
