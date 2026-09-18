import { ScreenLayout } from '../../components/ScreenLayout';
import { ChipSection } from '../../components/SelectableChip';
import { Button } from '../../components/ui';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../store/useAppStore';
import type { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const healthProfileDraft = useAppStore((state) => state.healthProfileDraft);
  const toggleHealthProfileItem = useAppStore((state) => state.toggleHealthProfileItem);
  const setDietaryPattern = useAppStore((state) => state.setDietaryPattern);

  return (
    <ScreenLayout
      onBack={() => navigation.goBack()}
      title={strings.profile.editProfile}
      subtitle="Changes save automatically and apply to your next scan."
      footer={<Button label={strings.common.done} fullWidth onPress={() => navigation.goBack()} />}
    >
      <ChipSection
        title={strings.onboarding.healthProfile.allergies.title}
        subtitle={strings.onboarding.healthProfile.allergies.subtitle}
        options={strings.onboarding.healthProfile.allergies.options}
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
        selected={[healthProfileDraft.dietaryPattern]}
        onToggle={(item) => setDietaryPattern(item)}
        singleSelect
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
