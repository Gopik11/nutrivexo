import { CROSS_REACTIVITY_MAP, isKnownAllergen, type KnownAllergen } from '../data/allergens';
import { getScoreLevel } from '../constants/theme';
import type {
  AllergenAlert,
  ConcernLevel,
  MatchedIngredient,
  NutritionFacts,
  OnboardingHealthProfileDraft,
  Recommendation,
  ScoreFactor,
} from '../types';

const CONCERN_PENALTY: Record<ConcernLevel, number> = {
  none: 0,
  low: -3,
  moderate: -8,
  high: -18,
};

const POSITIVE_TAGS = new Set(['whole grain', 'fiber', 'legume', 'prebiotic', 'omega-3']);
const PROCESSED_TAGS = new Set(['ultra-processed marker', 'artificial color', 'artificial sweetener']);

export interface ScoringInput {
  matchedIngredients: MatchedIngredient[];
  nutritionFacts?: NutritionFacts;
  healthProfile: OnboardingHealthProfileDraft;
}

export interface ScoringOutput {
  score: number;
  scoreLevel: ReturnType<typeof getScoreLevel>;
  scoreFactors: ScoreFactor[];
  alerts: AllergenAlert[];
  recommendations: Omit<Recommendation, 'scanId'>[];
}

function buildAllergenAlerts(
  matchedIngredients: MatchedIngredient[],
  allergies: string[]
): AllergenAlert[] {
  const alerts: AllergenAlert[] = [];
  const userAllergens = allergies.filter(isKnownAllergen) as KnownAllergen[];
  if (userAllergens.length === 0) return alerts;

  const seen = new Set<string>();
  let hasAmbiguousIngredient = false;

  for (const match of matchedIngredients) {
    const { ingredient } = match;
    if (ingredient.ambiguousAllergenRisk) {
      hasAmbiguousIngredient = true;
    }

    const source = ingredient.commonAllergenSource;
    if (!source) continue;

    if (isKnownAllergen(source) && userAllergens.includes(source)) {
      const key = `contains:${source}`;
      if (!seen.has(key)) {
        seen.add(key);
        alerts.push({
          tier: 'contains',
          allergen: source,
          ingredientName: ingredient.name,
          message: `Contains ${source.toLowerCase()} (from ${ingredient.name}) — you've flagged ${source.toLowerCase()} as an allergy.`,
        });
      }
      continue;
    }

    for (const allergen of userAllergens) {
      const relatedSources = CROSS_REACTIVITY_MAP[allergen] ?? [];
      if (relatedSources.includes(source)) {
        const key = `cross:${allergen}:${source}`;
        if (!seen.has(key)) {
          seen.add(key);
          alerts.push({
            tier: 'cross_reactive',
            allergen,
            ingredientName: ingredient.name,
            message: `${ingredient.name} is sometimes cross-reactive with ${allergen.toLowerCase()} — worth checking with your doctor if you're highly sensitive.`,
          });
        }
      }
    }
  }

  if (hasAmbiguousIngredient) {
    alerts.push({
      tier: 'may_contain',
      allergen: userAllergens.join(', '),
      ingredientName: 'Natural/artificial flavors or spices',
      message:
        'This label lists unspecified flavors or spices, which occasionally hide allergen sources. Consider contacting the manufacturer if you react strongly.',
    });
  }

  // "contains" alerts are most urgent — surface them first.
  const tierOrder: Record<AllergenAlert['tier'], number> = {
    contains: 0,
    cross_reactive: 1,
    may_contain: 2,
  };
  return alerts.sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
}

function buildNutritionFactors(
  facts: NutritionFacts | undefined,
  goals: string[]
): ScoreFactor[] {
  if (!facts) return [];
  const factors: ScoreFactor[] = [];
  const wantsLessSugar = goals.includes('Reduce added sugar');
  const wantsLessSodium = goals.includes('Lower sodium');

  const addedSugars = facts.addedSugars ?? facts.sugars;
  if (addedSugars !== undefined) {
    if (addedSugars > 15) {
      factors.push({
        label: 'High in sugar',
        detail: `${addedSugars}g sugar per serving is high — more than half a typical daily budget.`,
        impact: 'negative',
        points: wantsLessSugar ? -20 : -15,
      });
    } else if (addedSugars > 8) {
      factors.push({
        label: 'Moderate sugar',
        detail: `${addedSugars}g sugar per serving.`,
        impact: 'negative',
        points: wantsLessSugar ? -12 : -8,
      });
    }
  }

  if (facts.sodium !== undefined) {
    if (facts.sodium > 600) {
      factors.push({
        label: 'High in sodium',
        detail: `${facts.sodium}mg sodium per serving — roughly a quarter of a full day's guidance in one serving.`,
        impact: 'negative',
        points: wantsLessSodium ? -18 : -12,
      });
    } else if (facts.sodium > 300) {
      factors.push({
        label: 'Moderate sodium',
        detail: `${facts.sodium}mg sodium per serving.`,
        impact: 'negative',
        points: wantsLessSodium ? -10 : -6,
      });
    }
  }

  if (facts.saturatedFat !== undefined) {
    if (facts.saturatedFat > 5) {
      factors.push({
        label: 'High in saturated fat',
        detail: `${facts.saturatedFat}g saturated fat per serving.`,
        impact: 'negative',
        points: -8,
      });
    } else if (facts.saturatedFat > 3) {
      factors.push({
        label: 'Some saturated fat',
        detail: `${facts.saturatedFat}g saturated fat per serving.`,
        impact: 'negative',
        points: -4,
      });
    }
  }

  if (facts.fiber !== undefined && facts.fiber >= 3) {
    factors.push({
      label: 'Good source of fiber',
      detail: `${facts.fiber}g fiber per serving.`,
      impact: 'positive',
      points: 5,
    });
  }

  if (facts.protein !== undefined && facts.protein >= 10) {
    factors.push({
      label: 'High in protein',
      detail: `${facts.protein}g protein per serving.`,
      impact: 'positive',
      points: 3,
    });
  }

  return factors;
}

function buildIngredientFactors(matchedIngredients: MatchedIngredient[]): ScoreFactor[] {
  const byLevel: Record<Exclude<ConcernLevel, 'none'>, MatchedIngredient[]> = {
    high: [],
    moderate: [],
    low: [],
  };

  for (const match of matchedIngredients) {
    const level = match.ingredient.concernLevel;
    if (level === 'none') continue;
    byLevel[level].push(match);
  }

  const factors: ScoreFactor[] = [];
  (['high', 'moderate', 'low'] as const).forEach((level) => {
    const items = byLevel[level];
    if (items.length === 0) return;
    const names = items.slice(0, 3).map((m) => m.ingredient.name);
    const suffix = items.length > 3 ? `, +${items.length - 3} more` : '';
    factors.push({
      label:
        level === 'high'
          ? `${items.length} higher-concern ingredient${items.length > 1 ? 's' : ''}`
          : level === 'moderate'
            ? `${items.length} moderate-concern ingredient${items.length > 1 ? 's' : ''}`
            : `${items.length} lower-concern ingredient${items.length > 1 ? 's' : ''}`,
      detail: `${names.join(', ')}${suffix}`,
      impact: 'negative',
      points: CONCERN_PENALTY[level] * items.length,
    });
  });

  const wholefoodCount = matchedIngredients.filter((m) =>
    m.ingredient.functionTags.some((tag) => POSITIVE_TAGS.has(tag))
  ).length;
  if (wholefoodCount >= 2) {
    factors.push({
      label: 'Built on whole-food ingredients',
      detail: `${wholefoodCount} whole-food ingredients recognized, like whole grains, legumes, or seeds.`,
      impact: 'positive',
      points: Math.min(10, wholefoodCount * 3),
    });
  }

  const processedCount = matchedIngredients.filter((m) =>
    m.ingredient.functionTags.some((tag) => PROCESSED_TAGS.has(tag))
  ).length;
  if (processedCount >= 3) {
    factors.push({
      label: 'Several ultra-processed markers',
      detail: `${processedCount} ingredients associated with heavy processing (artificial colors, sweeteners, or processing aids).`,
      impact: 'negative',
      points: -6,
    });
  }

  return factors;
}

function buildAllergyScoreFactors(alerts: AllergenAlert[]): ScoreFactor[] {
  const factors: ScoreFactor[] = [];
  const containsCount = alerts.filter((a) => a.tier === 'contains').length;
  const crossCount = alerts.filter((a) => a.tier === 'cross_reactive').length;
  const mayContainCount = alerts.filter((a) => a.tier === 'may_contain').length;

  if (containsCount > 0) {
    factors.push({
      label: 'Contains a flagged allergen',
      detail: `${containsCount} ingredient${containsCount > 1 ? 's' : ''} match an allergy on your profile.`,
      impact: 'negative',
      points: -25 * containsCount,
    });
  }
  if (crossCount > 0) {
    factors.push({
      label: 'Possible cross-reactivity',
      detail: `${crossCount} ingredient${crossCount > 1 ? 's are' : ' is'} sometimes cross-reactive with an allergy on your profile.`,
      impact: 'negative',
      points: -8 * crossCount,
    });
  }
  if (mayContainCount > 0) {
    factors.push({
      label: 'Ambiguous flavor sourcing',
      detail: 'Unspecified flavors or spices could hide an allergen.',
      impact: 'negative',
      points: -5,
    });
  }
  return factors;
}

function buildRecommendations(
  matchedIngredients: MatchedIngredient[],
  nutritionFacts: NutritionFacts | undefined,
  healthProfile: OnboardingHealthProfileDraft,
  score: number,
  alerts: AllergenAlert[]
): Omit<Recommendation, 'scanId'>[] {
  const recommendations: Omit<Recommendation, 'scanId'>[] = [];

  const highConcern = matchedIngredients
    .filter((m) => m.ingredient.concernLevel === 'high')
    .slice(0, 2);
  if (highConcern.length > 0) {
    recommendations.push({
      type: 'swap',
      content: `Look for an alternative without ${highConcern.map((m) => m.ingredient.name).join(' or ')} — these are this product's highest-impact ingredients.`,
    });
  }

  const addedSugars = nutritionFacts?.addedSugars ?? nutritionFacts?.sugars;
  if (addedSugars !== undefined && addedSugars > 15) {
    recommendations.push({
      type: 'portion',
      content: `At ${addedSugars}g of sugar per serving, this fits best as an occasional treat rather than an everyday choice.`,
    });
  } else if (
    nutritionFacts?.sodium !== undefined &&
    nutritionFacts.sodium > 500 &&
    healthProfile.healthGoals.includes('Lower sodium')
  ) {
    recommendations.push({
      type: 'portion',
      content: `This is high in sodium relative to your goal to lower sodium — consider pairing it with low-sodium sides today.`,
    });
  }

  if (alerts.some((a) => a.tier === 'contains')) {
    recommendations.push({
      type: 'education',
      content: 'Always double-check packaging yourself before eating — formulations change and this scan is a helper, not a guarantee.',
    });
  } else if (score >= 75) {
    recommendations.push({
      type: 'education',
      content: 'This product lines up well with your health profile — a solid everyday choice.',
    });
  }

  return recommendations.slice(0, 3);
}

export function analyzeScan(input: ScoringInput): ScoringOutput {
  const { matchedIngredients, nutritionFacts, healthProfile } = input;

  const alerts = buildAllergenAlerts(matchedIngredients, healthProfile.allergies);
  const ingredientFactors = buildIngredientFactors(matchedIngredients);
  const nutritionFactors = buildNutritionFactors(nutritionFacts, healthProfile.healthGoals);
  const allergyFactors = buildAllergyScoreFactors(alerts);

  const scoreFactors = [...allergyFactors, ...ingredientFactors, ...nutritionFactors];
  const totalPoints = scoreFactors.reduce((sum, factor) => sum + factor.points, 0);
  const score = Math.max(0, Math.min(100, Math.round(100 + totalPoints)));

  const recommendations = buildRecommendations(
    matchedIngredients,
    nutritionFacts,
    healthProfile,
    score,
    alerts
  );

  return {
    score,
    scoreLevel: getScoreLevel(score),
    scoreFactors,
    alerts,
    recommendations,
  };
}
