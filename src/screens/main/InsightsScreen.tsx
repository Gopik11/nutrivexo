import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card, ScoreRing } from '../../components/ui';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../store/useAppStore';
import { colors, getScoreColor, getScoreLevel } from '../../constants/theme';
import type { SavedScan } from '../../types';

const TREND_WINDOW = 8;

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);
}

function ScoreTrend({ scans }: { scans: SavedScan[] }) {
  // Oldest -> newest, left to right, most recent TREND_WINDOW scans.
  const ordered = [...scans].reverse().slice(-TREND_WINDOW);
  const maxBarHeight = 64;

  return (
    <Card variant="outlined" className="mb-4">
      <Text className="text-h3 text-neutral-800 mb-1">Score trend</Text>
      <Text className="text-caption text-neutral-500 mb-4">Your last {ordered.length} scans, oldest to newest</Text>
      <View className="flex-row items-end" style={{ gap: 8, height: maxBarHeight + 24 }}>
        {ordered.map((scan, index) => {
          const barHeight = Math.max(6, (scan.score / 100) * maxBarHeight);
          return (
            <View key={scan.id + index} className="items-center flex-1">
              <View
                accessibilityLabel={`Scan ${index + 1}: score ${scan.score}`}
                style={{
                  height: barHeight,
                  width: '100%',
                  maxWidth: 28,
                  borderRadius: 6,
                  backgroundColor: getScoreColor(getScoreLevel(scan.score)),
                }}
              />
              <Text className="text-caption text-neutral-500 mt-1.5">{scan.score}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function TopConcernIngredients({ scans }: { scans: SavedScan[] }) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const scan of scans) {
      for (const name of scan.matchedIngredientNames) {
        map.set(name, (map.get(name) ?? 0) + 1);
      }
    }
    return Array.from(map.entries())
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [scans]);

  if (counts.length === 0) return null;
  const maxCount = counts[0][1];

  return (
    <Card variant="outlined" className="mb-4">
      <Text className="text-h3 text-neutral-800 mb-1">Ingredients you see most</Text>
      <Text className="text-caption text-neutral-500 mb-4">
        Recurring across your scan history
      </Text>
      <View style={{ gap: 10 }}>
        {counts.map(([name, count]) => (
          <View key={name}>
            <View className="flex-row justify-between mb-1">
              <Text className="text-body-sm text-neutral-700">{name}</Text>
              <Text className="text-caption text-neutral-500">{count}x</Text>
            </View>
            <View className="h-2 rounded-full bg-neutral-100">
              <View
                style={{
                  width: `${Math.max(8, (count / maxCount) * 100)}%`,
                  backgroundColor: colors.accent[400],
                }}
                className="h-2 rounded-full"
              />
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function InsightsScreen() {
  const savedScans = useAppStore((state) => state.savedScans);

  const allergenAlertCount = useMemo(
    () => savedScans.filter((scan) => scan.alerts.some((a) => a.tier === 'contains')).length,
    [savedScans]
  );

  if (savedScans.length === 0) {
    return (
      <ScreenLayout title={strings.insights.title} subtitle={strings.insights.subtitle}>
        <Card variant="outlined" className="items-center py-8 mb-4">
          <ScoreRing score={0} size={100} />
          <Text className="text-body-sm text-neutral-500 text-center mt-4 px-2">
            {strings.insights.empty}
          </Text>
        </Card>
      </ScreenLayout>
    );
  }

  const avgScore = average(savedScans.map((s) => s.score));

  return (
    <ScreenLayout title={strings.insights.title} subtitle={strings.insights.subtitle}>
      <View className="flex-row mb-4" style={{ gap: 12 }}>
        <Card variant="outlined" className="flex-1 items-center py-5">
          <Text className="text-h1 text-neutral-800">{savedScans.length}</Text>
          <Text className="text-caption text-neutral-500 mt-1 text-center">Total scans</Text>
        </Card>
        <Card variant="outlined" className="flex-1 items-center py-5">
          <Text className="text-h1" style={{ color: getScoreColor(getScoreLevel(avgScore)) }}>
            {avgScore}
          </Text>
          <Text className="text-caption text-neutral-500 mt-1 text-center">Average score</Text>
        </Card>
        <Card variant="outlined" className="flex-1 items-center py-5">
          <View className="flex-row items-center">
            {allergenAlertCount > 0 && (
              <Ionicons name="warning" size={16} color="#C45C4A" style={{ marginRight: 4 }} />
            )}
            <Text
              className="text-h1"
              style={{ color: allergenAlertCount > 0 ? colors.score.alert : colors.neutral[800] }}
            >
              {allergenAlertCount}
            </Text>
          </View>
          <Text className="text-caption text-neutral-500 mt-1 text-center">Allergen flags</Text>
        </Card>
      </View>

      <ScoreTrend scans={savedScans} />
      <TopConcernIngredients scans={savedScans} />
    </ScreenLayout>
  );
}
