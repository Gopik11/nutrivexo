import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AlertBanner, Badge, Card, ScoreRing } from '../../components/ui';
import { useAppStore } from '../../store/useAppStore';
import type { MainStackScreenProps } from '../../navigation/types';
import type { SavedScan } from '../../types';

type Props = MainStackScreenProps<'Compare'>;

interface NutritionRow {
  label: string;
  unit: string;
  get: (scan: SavedScan) => number | undefined;
  /** Lower is better for all the facts we show here (sugar, sodium, saturated fat, calories). */
  lowerIsBetter: true;
}

const NUTRITION_ROWS: NutritionRow[] = [
  { label: 'Calories', unit: '', get: (s) => s.product.nutritionFacts?.calories, lowerIsBetter: true },
  { label: 'Sugar', unit: 'g', get: (s) => s.product.nutritionFacts?.sugars, lowerIsBetter: true },
  { label: 'Sodium', unit: 'mg', get: (s) => s.product.nutritionFacts?.sodium, lowerIsBetter: true },
  {
    label: 'Saturated fat',
    unit: 'g',
    get: (s) => s.product.nutritionFacts?.saturatedFat,
    lowerIsBetter: true,
  },
];

export function CompareScreen({ route, navigation }: Props) {
  const { scanIds } = route.params;
  const savedScans = useAppStore((state) => state.savedScans);
  const scans = scanIds
    .map((id) => savedScans.find((s) => s.id === id))
    .filter((s): s is SavedScan => Boolean(s));

  if (scans.length < 2) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center px-6">
        <Ionicons name="help-circle-outline" size={40} color="#A89F92" />
        <Text className="text-body text-neutral-500 text-center mt-4">
          These scans are no longer available to compare.
        </Text>
      </SafeAreaView>
    );
  }

  const bestScore = Math.max(...scans.map((s) => s.score));

  return (
    <SafeAreaView className="flex-1 bg-neutral-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-2 pb-10"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => navigation.goBack()}
            className="text-body text-accent-600 font-medium"
          >
            {'‹ Back'}
          </Text>
        </View>

        <Text className="text-h1 text-neutral-800 mb-1">Compare</Text>
        <Text className="text-body-sm text-neutral-500 mb-6">
          {scans.length} products side by side, for the same health profile.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5 mb-4">
          <View className="flex-row" style={{ gap: 12 }}>
            {scans.map((scan) => (
              <Card key={scan.id} variant="outlined" className="items-center py-5" style={{ width: 150 }}>
                {scan.score === bestScore && (
                  <View className="mb-1">
                    <Badge label="Best pick" variant="good" />
                  </View>
                )}
                <ScoreRing score={scan.score} size={72} strokeWidth={6} showLabel={false} />
                <Text
                  className="text-body-sm font-semibold text-neutral-800 text-center mt-3"
                  numberOfLines={2}
                >
                  {scan.product.name}
                </Text>
                {scan.alerts.some((a) => a.tier === 'contains') && (
                  <View className="mt-2">
                    <Badge label="Allergen" variant="alert" />
                  </View>
                )}
              </Card>
            ))}
          </View>
        </ScrollView>

        <Card variant="outlined" className="mb-4">
          <Text className="text-h3 text-neutral-800 mb-3">Nutrition, per serving</Text>
          {NUTRITION_ROWS.map((row) => {
            const values = scans.map((s) => row.get(s));
            const defined = values.filter((v): v is number => v !== undefined);
            const best = defined.length > 0 ? Math.min(...defined) : undefined;
            return (
              <View key={row.label} className="py-2 border-b border-neutral-100 last:border-b-0">
                <Text className="text-caption text-neutral-500 mb-1.5">{row.label}</Text>
                <View className="flex-row" style={{ gap: 12 }}>
                  {scans.map((scan, index) => {
                    const value = values[index];
                    const isBest = value !== undefined && best !== undefined && value === best && defined.length > 1;
                    return (
                      <Text
                        key={scan.id}
                        className={[
                          'text-body-sm flex-1',
                          isBest ? 'text-score-good font-semibold' : 'text-neutral-700',
                        ].join(' ')}
                      >
                        {value !== undefined ? `${value}${row.unit}` : '—'}
                      </Text>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </Card>

        {scans.map(
          (scan) =>
            scan.alerts.length > 0 && (
              <Card key={scan.id} variant="outlined" className="mb-4">
                <Text className="text-h3 text-neutral-800 mb-3" numberOfLines={1}>
                  {scan.product.name} — alerts
                </Text>
                <View style={{ gap: 8 }}>
                  {scan.alerts.map((alert, i) => (
                    <AlertBanner
                      key={`${alert.tier}-${i}`}
                      tier={alert.tier}
                      title={alert.allergen}
                      message={alert.message}
                    />
                  ))}
                </View>
              </Card>
            )
        )}

        <Text className="text-caption text-neutral-400 text-center mt-2">
          Lower sugar, sodium, and saturated fat are highlighted as better where products differ.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
