import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/ui';
import { strings } from '../../constants/strings';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

const features = [
  { icon: 'scan-outline' as const, text: strings.onboarding.welcome.featureScan },
  { icon: 'person-outline' as const, text: strings.onboarding.welcome.featureProfile },
  { icon: 'chatbubble-ellipses-outline' as const, text: strings.onboarding.welcome.featureExplain },
];

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View className="flex-1 bg-neutral-50">
      <LinearGradient
        colors={['#F2E6D8', '#FAF8F5']}
        className="px-6 pt-16 pb-10"
      >
        <Text className="text-caption font-semibold text-accent-600 uppercase tracking-widest mb-3">
          {strings.app.name}
        </Text>
        <Text className="text-display text-neutral-800 mb-3">
          {strings.onboarding.welcome.title}
        </Text>
        <Text className="text-body text-neutral-600 leading-6">
          {strings.onboarding.welcome.subtitle}
        </Text>
      </LinearGradient>

      <View className="flex-1 px-6 pt-8">
        {features.map((feature) => (
          <View key={feature.text} className="flex-row items-center mb-5">
            <View className="w-10 h-10 rounded-full bg-accent-100 items-center justify-center mr-4">
              <Ionicons name={feature.icon} size={20} color="#A8734F" />
            </View>
            <Text className="text-body text-neutral-700 flex-1">{feature.text}</Text>
          </View>
        ))}
      </View>

      <View className="px-6 pb-8">
        <Button
          label={strings.common.getStarted}
          fullWidth
          onPress={() => navigation.navigate('HealthProfileSetup')}
        />
      </View>
    </View>
  );
}
