import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Badge, Card, ScoreRing } from '../../components/ui';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../store/useAppStore';
import type { MainTabScreenProps } from '../../navigation/types';
import type { SavedScan } from '../../types';

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function HistoryRow({ scan, onPress }: { scan: SavedScan; onPress: () => void }) {
  const hasContainsAlert = scan.alerts.some((a) => a.tier === 'contains');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${scan.product.name}, score ${scan.score}`}
      onPress={onPress}
    >
      <Card variant="outlined" className="mb-3 flex-row items-center">
        <View className="mr-3">
          <ScoreRing score={scan.score} size={52} strokeWidth={5} showLabel={false} />
        </View>
        <View className="flex-1">
          <Text className="text-body font-semibold text-neutral-800" numberOfLines={1}>
            {scan.product.name}
          </Text>
          <Text className="text-caption text-neutral-500 mt-0.5">{timeAgo(scan.scannedAt)}</Text>
          {hasContainsAlert && (
            <View className="mt-1.5 self-start">
              <Badge label="Allergen flagged" variant="alert" />
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color="#A89F92" />
      </Card>
    </Pressable>
  );
}

export function HistoryScreen({ navigation }: MainTabScreenProps<'History'>) {
  const savedScans = useAppStore((state) => state.savedScans);

  if (savedScans.length === 0) {
    return (
      <ScreenLayout title={strings.history.title} subtitle={strings.history.subtitle}>
        <Card variant="outlined" className="items-center py-10">
          <Ionicons name="time-outline" size={40} color="#D4CCC0" />
          <Text className="text-body text-neutral-500 text-center mt-4 px-4">
            {strings.history.empty}
          </Text>
        </Card>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout title={strings.history.title} subtitle={strings.history.subtitle} scrollable={false}>
      <FlatList
        data={savedScans}
        keyExtractor={(scan) => scan.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <HistoryRow
            scan={item}
            onPress={() => navigation.navigate('Results', { scanId: item.id })}
          />
        )}
      />
    </ScreenLayout>
  );
}
