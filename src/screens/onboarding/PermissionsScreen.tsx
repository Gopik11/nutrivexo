import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Button, Card } from '../../components/ui';
import { strings } from '../../constants/strings';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Permissions'>;

interface PermissionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  granted: boolean;
  actionLabel: string;
  onEnable: () => void;
}

function PermissionCard({
  icon,
  title,
  description,
  granted,
  actionLabel,
  onEnable,
}: PermissionCardProps) {
  return (
    <Card variant="outlined" className="mb-4">
      <View className="flex-row items-start">
        <View className="w-11 h-11 rounded-full bg-accent-50 items-center justify-center mr-4">
          <Ionicons name={icon} size={22} color="#A8734F" />
        </View>
        <View className="flex-1">
          <Text className="text-h3 text-neutral-800 mb-1">{title}</Text>
          <Text className="text-body-sm text-neutral-600 mb-3">{description}</Text>
          {granted ? (
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={18} color="#6B8F71" />
              <Text className="text-body-sm text-score-good ml-1.5 font-medium">Enabled</Text>
            </View>
          ) : (
            <Button label={actionLabel} variant="secondary" size="sm" onPress={onEnable} />
          )}
        </View>
      </View>
    </Card>
  );
}

export function PermissionsScreen({ navigation }: Props) {
  const cameraPermissionGranted = useAppStore((state) => state.cameraPermissionGranted);
  const notificationsPermissionGranted = useAppStore(
    (state) => state.notificationsPermissionGranted
  );
  const setCameraPermissionGranted = useAppStore((state) => state.setCameraPermissionGranted);
  const setNotificationsPermissionGranted = useAppStore(
    (state) => state.setNotificationsPermissionGranted
  );

  return (
    <ScreenLayout
      title={strings.onboarding.permissions.title}
      subtitle={strings.onboarding.permissions.subtitle}
      footer={
        <Button
          label={strings.common.continue}
          fullWidth
          onPress={() => navigation.navigate('Disclaimer')}
        />
      }
    >
      <PermissionCard
        icon="camera-outline"
        title={strings.onboarding.permissions.camera.title}
        description={strings.onboarding.permissions.camera.description}
        granted={cameraPermissionGranted}
        actionLabel={strings.onboarding.permissions.enableCamera}
        onEnable={() => setCameraPermissionGranted(true)}
      />

      <PermissionCard
        icon="notifications-outline"
        title={strings.onboarding.permissions.notifications.title}
        description={strings.onboarding.permissions.notifications.description}
        granted={notificationsPermissionGranted}
        actionLabel={strings.onboarding.permissions.enableNotifications}
        onEnable={() => setNotificationsPermissionGranted(true)}
      />

      <Text className="text-body-sm text-neutral-500 text-center mt-2">
        {strings.common.skip} is available — tap Continue anytime.
      </Text>
    </ScreenLayout>
  );
}
