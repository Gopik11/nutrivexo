import { useState } from 'react';
import { Alert, Pressable, Switch, Text, View } from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/ui';
import { ChipSection } from '../../components/SelectableChip';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../store/useAppStore';
import type { Region } from '../../types';
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
  const healthProfileDraft = useAppStore((state) => state.healthProfileDraft);
  const toggleMutedAmbiguousAllergen = useAppStore((state) => state.toggleMutedAmbiguousAllergen);
  const region = useAppStore((state) => state.settings.region ?? 'US');
  const setRegion = useAppStore((state) => state.setRegion);
  const [busy, setBusy] = useState(false);

  const handleChangeRegion = (next: Region) => {
    if (next === region) return;
    Alert.alert(
      next === 'EU' ? 'Switch to the EU’s 14 allergens?' : 'Switch to the US’s 9 allergens?',
      'Your existing allergy selections carry over where the categories match (e.g. Wheat ↔ Cereals containing gluten). Nutrition guidance also switches to match.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Switch', onPress: () => setRegion(next) },
      ]
    );
  };

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

      <Card variant="outlined" className="mb-4">
        <Text className="text-body text-neutral-800 font-medium mb-1">Region</Text>
        <Text className="text-caption text-neutral-500 mb-3">
          Which allergen list and nutrition guidance Nutrivexo uses — the US's 9 major
          allergens and %DV-style thresholds, or the EU's 14 (Regulation 1169/2011) with
          EU reference-intake-style thresholds.
        </Text>
        <View className="flex-row bg-neutral-100 rounded-full p-1 self-start">
          {(['US', 'EU'] as const).map((option) => (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ checked: region === option }}
              accessibilityLabel={`${option} region`}
              onPress={() => handleChangeRegion(option)}
              className={['px-4 py-1.5 rounded-full', region === option ? 'bg-accent-500' : ''].join(' ')}
            >
              <Text className={region === option ? 'text-white font-semibold' : 'text-neutral-600'}>
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {healthProfileDraft.allergies.length > 0 && (
        <Card variant="outlined" className="mb-4">
          <ChipSection
            title={strings.settings.ambiguousAlerts}
            subtitle={strings.settings.ambiguousAlertsDesc}
            options={healthProfileDraft.allergies}
            selected={settings.mutedAmbiguousAllergens ?? []}
            onToggle={toggleMutedAmbiguousAllergen}
          />
        </Card>
      )}
    </ScreenLayout>
  );
}
