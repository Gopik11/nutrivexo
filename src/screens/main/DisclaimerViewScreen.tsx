import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/ui';
import { strings } from '../../constants/strings';
import type { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'DisclaimerView'>;

export function DisclaimerViewScreen({ navigation }: Props) {
  return (
    <ScreenLayout onBack={() => navigation.goBack()} title={strings.profile.disclaimer}>
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

      <Card variant="outlined" className="mb-4">
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

      <Card variant="outlined" className="mb-4">
        <View className="flex-row items-center mb-2">
          <Ionicons name="library-outline" size={20} color="#A8734F" />
          <Text className="text-h3 text-neutral-800 ml-2">Where our data comes from</Text>
        </View>
        <Text className="text-body-sm text-neutral-600 leading-5">
          Ingredient and allergen guidance comes from a curated, on-device reference list
          maintained for Nutrivexo. It reflects general consumer-education patterns, not a
          medical or regulatory database, and formulations change — always check the physical
          package yourself.
        </Text>
      </Card>
    </ScreenLayout>
  );
}
