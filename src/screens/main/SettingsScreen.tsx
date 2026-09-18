import { useState } from 'react';
import { Alert, Switch, Text, View } from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/ui';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../store/useAppStore';
import {
  cancelWeeklyDigest,
  requestNotificationPermission,
  scheduleWeeklyDigest,
} from '../../services/notifications';
import type { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'Settings'>;

interface SettingRowProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

function SettingRow({ title, description, value, onValueChange, disabled }: SettingRowProps) {
  return (
    <View className="flex-row items-center py-4 border-b border-neutral-100">
      <View className="flex-1 pr-3">
        <Text className="text-body text-neutral-800 font-medium">{title}</Text>
        <Text className="text-caption text-neutral-500 mt-0.5">{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#E8E2D9', true: '#C08F6A' }}
        thumbColor="#FFFFFF"
        accessibilityLabel={title}
      />
    </View>
  );
}

export function SettingsScreen({ navigation }: Props) {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const notificationsPermissionGranted = useAppStore(
    (state) => state.notificationsPermissionGranted
  );
  const setNotificationsPermissionGranted = useAppStore(
    (state) => state.setNotificationsPermissionGranted
  );
  const [busy, setBusy] = useState(false);

  const handleToggleNotifications = async (value: boolean) => {
    if (!value) {
      updateSettings({ notificationsEnabled: false });
      await cancelWeeklyDigest();
      return;
    }
    setBusy(true);
    try {
      const granted = await requestNotificationPermission();
      setNotificationsPermissionGranted(granted);
      updateSettings({ notificationsEnabled: granted });
      if (!granted) {
        Alert.alert(
          'Notifications disabled',
          'Enable notifications for Nutrivexo in your device settings to use this feature.'
        );
      } else if (settings.weeklyDigestEnabled) {
        await scheduleWeeklyDigest();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleToggleWeeklyDigest = async (value: boolean) => {
    updateSettings({ weeklyDigestEnabled: value });
    if (value && settings.notificationsEnabled) {
      await scheduleWeeklyDigest();
    } else {
      await cancelWeeklyDigest();
    }
  };

  return (
    <ScreenLayout onBack={() => navigation.goBack()} title={strings.settings.title}>
      <Card variant="outlined" padding="none" className="px-4 mb-4">
        <SettingRow
          title={strings.settings.notifications}
          description={
            notificationsPermissionGranted
              ? strings.settings.notificationsEnabledDesc
              : strings.settings.notificationsDisabledDesc
          }
          value={settings.notificationsEnabled}
          onValueChange={handleToggleNotifications}
          disabled={busy}
        />
        <SettingRow
          title={strings.settings.weeklyDigest}
          description={strings.settings.weeklyDigestDesc}
          value={settings.weeklyDigestEnabled}
          onValueChange={handleToggleWeeklyDigest}
          disabled={busy || !settings.notificationsEnabled}
        />
        <SettingRow
          title={strings.settings.highConcernAlerts}
          description={strings.settings.highConcernAlertsDesc}
          value={settings.highConcernAlertsEnabled}
          onValueChange={(value) => updateSettings({ highConcernAlertsEnabled: value })}
          disabled={busy || !settings.notificationsEnabled}
        />
      </Card>
    </ScreenLayout>
  );
}
