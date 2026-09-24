import { Alert, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Button, Card } from '../../components/ui';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../store/useAppStore';
import type { MainStackScreenProps } from '../../navigation/types';

type Props = MainStackScreenProps<'DataPrivacy'>;

const dataPoints = [
  {
    icon: 'body-outline' as const,
    title: 'Health profile(s)',
    body: 'Allergies, conditions, dietary patterns, and goals you chose during setup — one profile per household member, if you’ve added more than one.',
  },
  {
    icon: 'time-outline' as const,
    title: 'Scan history',
    body: 'Every product you’ve saved: its ingredients, score, and any alerts shown.',
  },
  {
    icon: 'camera-outline' as const,
    title: 'Label photos',
    body: 'Processed on-device to read text, then discarded — photos are never saved or uploaded.',
  },
  {
    icon: 'barcode-outline' as const,
    title: 'Barcode lookups',
    body: 'Scanning a barcode sends only that number to Open Food Facts (or, in Cosmetics mode, Open Beauty Facts) — independent open databases — to fetch the product’s name and ingredients. Nothing else about you is sent.',
  },
];

export function DataPrivacyScreen({ navigation }: Props) {
  const clearAllData = useAppStore((state) => state.clearAllData);
  const savedScanCount = useAppStore((state) => state.savedScans.length);

  const confirmClear = () => {
    Alert.alert(
      'Delete all your data?',
      `This permanently deletes your health profile and ${savedScanCount} saved scan${savedScanCount === 1 ? '' : 's'} from this device. This can’t be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete everything', style: 'destructive', onPress: clearAllData },
      ]
    );
  };

  return (
    <ScreenLayout onBack={() => navigation.goBack()} title={strings.dataPrivacy.title}>
      <Card variant="outlined" className="mb-4">
        <Text className="text-body-sm text-neutral-600 leading-5">{strings.dataPrivacy.intro}</Text>
      </Card>

      <Text className="text-h3 text-neutral-800 mb-3">{strings.dataPrivacy.storedHeading}</Text>
      {dataPoints.map((point) => (
        <Card key={point.title} variant="outlined" className="mb-3 flex-row items-start">
          <View className="w-9 h-9 rounded-full bg-accent-50 items-center justify-center mr-3">
            <Ionicons name={point.icon} size={18} color="#A8734F" />
          </View>
          <View className="flex-1">
            <Text className="text-body font-semibold text-neutral-800 mb-0.5">{point.title}</Text>
            <Text className="text-body-sm text-neutral-600">{point.body}</Text>
          </View>
        </Card>
      ))}

      <Card variant="outlined" className="mt-2 mb-4">
        <Text className="text-h3 text-neutral-800 mb-2">{strings.dataPrivacy.deleteHeading}</Text>
        <Text className="text-body-sm text-neutral-600 mb-4">{strings.dataPrivacy.deleteBody}</Text>
        <Button
          label={strings.dataPrivacy.deleteButton}
          variant="danger"
          onPress={confirmClear}
        />
      </Card>
    </ScreenLayout>
  );
}
