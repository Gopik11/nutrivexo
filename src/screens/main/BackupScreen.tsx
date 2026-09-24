import { useState } from 'react';
import { Alert, Share, Text, TextInput, View } from 'react-native';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Button, Card } from '../../components/ui';
import { useAppStore } from '../../store/useAppStore';
import type { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'Backup'>;

/**
 * "Cloud backup" without a Nutrivexo server: exports the user's profile(s) and scan
 * history as a JSON blob through the OS share sheet (so they can save it to email,
 * Drive, iCloud, Files, or wherever they like), and restores from a pasted-back copy.
 * This is intentionally manual rather than automatic sync — no account, no server,
 * nothing about the user ever leaves their control unless they choose a destination.
 */
export function BackupScreen({ navigation }: Props) {
  const exportBackup = useAppStore((state) => state.exportBackup);
  const restoreBackup = useAppStore((state) => state.restoreBackup);
  const savedScanCount = useAppStore((state) => state.savedScans.length);

  const [restoreText, setRestoreText] = useState('');
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const json = exportBackup();
      await Share.share({
        message: json,
        title: 'Nutrivexo backup',
      });
    } catch {
      Alert.alert('Couldn’t share backup', 'Something went wrong preparing the share sheet. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = () => {
    const trimmed = restoreText.trim();
    if (!trimmed) return;
    Alert.alert(
      'Restore from backup?',
      'This replaces your current health profile(s) and scan history on this device with the backup you pasted in. This can’t be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => {
            const result = restoreBackup(trimmed);
            if (result.success) {
              setRestoreText('');
              Alert.alert('Restored', 'Your backup has been restored to this device.');
              navigation.goBack();
            } else {
              Alert.alert('Couldn’t restore', result.error ?? 'Unknown error.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenLayout
      onBack={() => navigation.goBack()}
      title="Backup & restore"
      subtitle="Nutrivexo has no server of its own — a backup is a file you keep, on whatever cloud storage or app you already trust."
    >
      <Card variant="outlined" className="mb-4">
        <Text className="text-h3 text-neutral-800 mb-1">Export a backup</Text>
        <Text className="text-body-sm text-neutral-500 mb-4">
          Creates a text file with your health profile(s) and {savedScanCount} saved scan
          {savedScanCount === 1 ? '' : 's'}, then opens your device's share sheet so you can save it
          to email, Drive, iCloud, Files, or anywhere else you like.
        </Text>
        <Button label="Export backup" fullWidth onPress={handleExport} disabled={busy} />
      </Card>

      <Card variant="outlined" className="mb-4">
        <Text className="text-h3 text-neutral-800 mb-1">Restore from a backup</Text>
        <Text className="text-body-sm text-neutral-500 mb-3">
          Open your backup file, copy its contents, and paste them below.
        </Text>
        <TextInput
          value={restoreText}
          onChangeText={setRestoreText}
          placeholder="Paste backup text here…"
          placeholderTextColor="#A89F92"
          multiline
          textAlignVertical="top"
          accessibilityLabel="Backup text to restore"
          className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-3 text-body-sm text-neutral-800 mb-3"
          style={{ minHeight: 120 }}
        />
        <Button
          label="Restore"
          variant="danger"
          fullWidth
          onPress={handleRestore}
          disabled={!restoreText.trim()}
        />
      </Card>
    </ScreenLayout>
  );
}
