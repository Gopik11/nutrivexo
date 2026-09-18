import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AlertBanner, Badge, Button, Card, ScoreRing } from '../../components/ui';
import { strings } from '../../constants/strings';
import { useAppStore } from '../../store/useAppStore';
import { sendHighConcernAlert } from '../../services/notifications';
import type { MainStackScreenProps } from '../../navigation/types';
import type { AllergenAlert, Recommendation, ScoreFactor, SavedScan } from '../../types';

type Props = MainStackScreenProps<'Results'>;

const recommendationIcon: Record<Recommendation['type'], keyof typeof Ionicons.glyphMap> = {
  swap: 'swap-horizontal',
  portion: 'resize',
  education: 'book-outline',
};

function ScoreFactorRow({ factor }: { factor: ScoreFactor }) {
  const color =
    factor.impact === 'positive' ? '#6B8F71' : factor.impact === 'negative' ? '#C45C4A' : '#7A7268';
  const icon = factor.impact === 'positive' ? 'add-circle' : factor.impact === 'negative' ? 'remove-circle' : 'ellipse';

  return (
    <View className="flex-row items-start py-2.5 border-b border-neutral-100 last:border-b-0">
      <Ionicons name={icon} size={18} color={color} style={{ marginTop: 2 }} />
      <View className="flex-1 ml-2.5">
        <Text className="text-body-sm font-semibold text-neutral-800">{factor.label}</Text>
        <Text className="text-caption text-neutral-500 mt-0.5">{factor.detail}</Text>
      </View>
    </View>
  );
}

export function ResultsScreen({ route, navigation }: Props) {
  const params = route.params;
  const savedScans = useAppStore((state) => state.savedScans);
  const saveScan = useAppStore((state) => state.saveScan);
  const deleteScan = useAppStore((state) => state.deleteScan);
  const settings = useAppStore((state) => state.settings);

  const isFromHistory = 'scanId' in params;
  const historyScan = isFromHistory
    ? savedScans.find((scan) => scan.id === params.scanId)
    : undefined;

  const [justSaved, setJustSaved] = useState<SavedScan | null>(null);

  const view = useMemo(() => {
    if (isFromHistory && historyScan) {
      return {
        productName: historyScan.product.name,
        score: historyScan.score,
        alerts: historyScan.alerts,
        recommendations: historyScan.recommendations,
        scoreFactors: historyScan.scoreFactors,
        ingredientNames: historyScan.matchedIngredientNames,
        unmatchedTerms: historyScan.unmatchedTerms,
        nutritionFacts: historyScan.product.nutritionFacts,
      };
    }
    if ('analysis' in params) {
      const { analysis } = params;
      return {
        productName: analysis.product.name,
        score: analysis.score,
        alerts: analysis.alerts,
        recommendations: analysis.recommendations,
        scoreFactors: analysis.scoreFactors,
        ingredientNames: analysis.matchedIngredients.map((m) => m.ingredient.name),
        unmatchedTerms: analysis.unmatchedTerms,
        nutritionFacts: analysis.product.nutritionFacts,
      };
    }
    return null;
  }, [isFromHistory, historyScan, params]);

  if (!view) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 items-center justify-center px-6">
        <Ionicons name="help-circle-outline" size={40} color="#A89F92" />
        <Text className="text-body text-neutral-500 text-center mt-4 mb-5">
          {strings.results.notFound}
        </Text>
        <Button
          label={strings.results.backToScan}
          onPress={() => navigation.navigate('Tabs', { screen: 'Scan' })}
        />
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    if (!('analysis' in params) || justSaved) return;
    const saved = saveScan(params.analysis);
    setJustSaved(saved);

    const containsAlert = saved.alerts.find((a: AllergenAlert) => a.tier === 'contains');
    if (containsAlert && settings.notificationsEnabled && settings.highConcernAlertsEnabled) {
      sendHighConcernAlert(saved.product.name, containsAlert.message).catch(() => {});
    }
  };

  const handleDelete = () => {
    if (isFromHistory && historyScan) {
      deleteScan(historyScan.id);
      navigation.goBack();
    }
  };

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
          {isFromHistory && (
            <Text
              accessibilityRole="button"
              accessibilityLabel="Delete scan"
              onPress={handleDelete}
              className="text-body-sm text-score-alert font-medium"
            >
              {strings.results.delete}
            </Text>
          )}
        </View>

        <Text className="text-h1 text-neutral-800 mb-1">{view.productName}</Text>
        <Text className="text-body-sm text-neutral-500 mb-6">
          {view.ingredientNames.length} ingredient{view.ingredientNames.length === 1 ? '' : 's'} recognized
          {view.unmatchedTerms.length > 0
            ? `, ${view.unmatchedTerms.length} not in our database`
            : ''}
        </Text>

        <Card variant="outlined" className="items-center py-8 mb-4">
          <ScoreRing score={view.score} size={128} />
        </Card>

        {view.alerts.length > 0 && (
          <View className="mb-4" style={{ gap: 10 }}>
            {view.alerts.map((alert: AllergenAlert, index: number) => (
              <AlertBanner
                key={`${alert.tier}-${alert.allergen}-${index}`}
                tier={alert.tier}
                title={`${alert.allergen}`}
                message={alert.message}
              />
            ))}
          </View>
        )}

        {view.recommendations.length > 0 && (
          <Card variant="outlined" className="mb-4">
            <Text className="text-h3 text-neutral-800 mb-3">{strings.results.recommendations}</Text>
            {view.recommendations.map((rec: Recommendation, index: number) => (
              <View
                key={index}
                className="flex-row items-start py-2.5 border-b border-neutral-100 last:border-b-0"
              >
                <Ionicons name={recommendationIcon[rec.type]} size={18} color="#A8734F" style={{ marginTop: 2 }} />
                <Text className="text-body-sm text-neutral-700 flex-1 ml-2.5">{rec.content}</Text>
              </View>
            ))}
          </Card>
        )}

        {view.scoreFactors.length > 0 && (
          <Card variant="outlined" className="mb-4">
            <Text className="text-h3 text-neutral-800 mb-1">{strings.results.whyThisScore}</Text>
            {view.scoreFactors.map((factor: ScoreFactor, index: number) => (
              <ScoreFactorRow key={index} factor={factor} />
            ))}
          </Card>
        )}

        {view.ingredientNames.length > 0 && (
          <Card variant="outlined" className="mb-4">
            <Text className="text-h3 text-neutral-800 mb-3">
              {strings.results.ingredientsRecognized}
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {view.ingredientNames.map((name: string) => (
                <Badge key={name} label={name} variant="default" />
              ))}
            </View>
          </Card>
        )}

        {view.unmatchedTerms.length > 0 && (
          <Card variant="outlined" className="mb-4">
            <Text className="text-h3 text-neutral-800 mb-2">{strings.results.notInDatabase}</Text>
            <Text className="text-body-sm text-neutral-500 mb-3">
              {strings.results.notInDatabaseBody}
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {view.unmatchedTerms.map((term: string) => (
                <Badge key={term} label={term} variant="info" />
              ))}
            </View>
          </Card>
        )}

        <Text className="text-caption text-neutral-400 text-center mt-2">
          {strings.results.disclaimer}
        </Text>
      </ScrollView>

      {!isFromHistory && (
        <View className="px-5 pb-6 pt-2 bg-neutral-50">
          <Button
            label={justSaved ? strings.results.savedToHistory : strings.results.saveToHistory}
            fullWidth
            disabled={!!justSaved}
            onPress={handleSave}
          />
        </View>
      )}
    </SafeAreaView>
  );
}
