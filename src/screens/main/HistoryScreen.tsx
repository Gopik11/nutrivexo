import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Badge, Button, Card, ScoreRing } from '../../components/ui';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../store/useAppStore';
import type { MainTabScreenProps } from '../../navigation/types';
import type { SavedScan } from '../../types';

const MAX_COMPARE = 3;

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

function HistoryRow({
  scan,
  onPress,
  selectMode,
  selected,
}: {
  scan: SavedScan;
  onPress: () => void;
  selectMode: boolean;
  selected: boolean;
}) {
  const hasContainsAlert = scan.alerts.some((a) => a.tier === 'contains');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${scan.product.name}, score ${scan.score}`}
      accessibilityState={selectMode ? { selected } : undefined}
      onPress={onPress}
    >
      <Card
        variant="outlined"
        className={['mb-3 flex-row items-center', selected ? 'border-accent-400 bg-accent-50' : ''].join(' ')}
      >
        {selectMode && (
          <Ionicons
            name={selected ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={selected ? '#A8734F' : '#A89F92'}
            style={{ marginRight: 10 }}
          />
        )}
        <View className="mr-3">
          <ScoreRing score={scan.score} size={52} strokeWidth={5} showLabel={false} />
        </View>
        <View className="flex-1">
          <Text className="text-body font-semibold text-neutral-800" numberOfLines={1}>
            {scan.product.name}
          </Text>
          <Text className="text-caption text-neutral-500 mt-0.5">
            {timeAgo(scan.scannedAt)}
            {scan.scoredForMemberName ? ` · ${scan.scoredForMemberName}` : ''}
          </Text>
          {hasContainsAlert && (
            <View className="mt-1.5 self-start">
              <Badge label="Allergen flagged" variant="alert" />
            </View>
          )}
        </View>
        {!selectMode && <Ionicons name="chevron-forward" size={18} color="#A89F92" />}
      </Card>
    </Pressable>
  );
}

export function HistoryScreen({ navigation }: MainTabScreenProps<'History'>) {
  const savedScans = useAppStore((state) => state.savedScans);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev);
    setSelectedIds([]);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      return [...prev, id];
    });
  };

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
    <ScreenLayout
      title={strings.history.title}
      subtitle={
        selectMode ? `Select up to ${MAX_COMPARE} scans to compare side by side.` : strings.history.subtitle
      }
      scrollable={false}
      headerRight={
        savedScans.length >= 2 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={selectMode ? 'Cancel compare' : 'Compare scans'}
            onPress={toggleSelectMode}
            className="px-3 py-1.5"
          >
            <Text className="text-body-sm text-accent-600 font-medium">
              {selectMode ? 'Cancel' : 'Compare'}
            </Text>
          </Pressable>
        ) : undefined
      }
      footer={
        selectMode && selectedIds.length >= 2 ? (
          <Button
            label={`Compare ${selectedIds.length}`}
            fullWidth
            onPress={() => {
              navigation.navigate('Compare', { scanIds: selectedIds });
              setSelectMode(false);
              setSelectedIds([]);
            }}
          />
        ) : undefined
      }
    >
      <FlatList
        data={savedScans}
        keyExtractor={(scan) => scan.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <HistoryRow
            scan={item}
            selectMode={selectMode}
            selected={selectedIds.includes(item.id)}
            onPress={() =>
              selectMode
                ? toggleSelected(item.id)
                : navigation.navigate('Results', { scanId: item.id })
            }
          />
        )}
      />
    </ScreenLayout>
  );
}
