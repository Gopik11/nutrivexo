import { generateId } from './id';
import { matchIngredients } from './ingredientMatcher';
import { parseNutritionFacts } from './nutritionParser';
import { analyzeScan } from './scoring';
import type {
  AnalysisResult,
  NutritionFacts,
  OnboardingHealthProfileDraft,
  Product,
  ProductDomain,
  Recommendation,
  Region,
} from '../types';

export interface AnalyzeProductInput {
  rawText: string;
  productName?: string;
  healthProfile: OnboardingHealthProfileDraft;
  source?: Product['source'];
  mutedAmbiguousAllergens?: string[];
  /** Which region's allergen list + nutrition thresholds to score against. Defaults to 'US'. */
  region?: Region;
  /** Which curated ingredient database to match against. Defaults to 'food'. */
  domain?: ProductDomain;
  barcode?: string;
  brand?: string;
  category?: string;
  /**
   * Already-structured nutrition facts (e.g. from an Open Food Facts barcode
   * lookup). When provided, these are used as-is instead of re-parsing them
   * out of `rawText` with the OCR-label regexes in nutritionParser.ts.
   */
  nutritionFacts?: NutritionFacts;
}

/**
 * Below this fraction of recognized-vs-total terms (and fewer than 3 ingredients
 * matched outright), we don't trust the score enough to present it as reliable.
 */
const LOW_CONFIDENCE_MATCH_RATIO = 0.34;
const LOW_CONFIDENCE_MIN_MATCHES = 3;

/**
 * The single entry point that turns raw label text (from OCR, manual entry, or
 * a barcode lookup) into a full AnalysisResult: matched ingredients, a health
 * score, allergen alerts, and recommendations, tailored to the given health
 * profile. Ingredient matching and scoring run entirely on-device — no network
 * calls happen here (a barcode lookup's network call, if any, happens before
 * this function is called).
 */
export function analyzeProduct(input: AnalyzeProductInput): AnalysisResult {
  const {
    rawText,
    productName,
    healthProfile,
    source = 'scanned',
    mutedAmbiguousAllergens,
    region,
    domain = 'food',
    barcode,
    brand,
    category,
  } = input;

  const { matched, unmatchedTerms } = matchIngredients(rawText, domain);
  // Cosmetics labels don't carry nutrition facts — skip the OCR nutrition-line
  // parser entirely rather than risk a false-positive match on stray numbers.
  const nutritionFacts =
    domain === 'cosmetics' ? undefined : input.nutritionFacts ?? parseNutritionFacts(rawText);

  const { score, scoreLevel, scoreFactors, alerts, recommendations } = analyzeScan({
    matchedIngredients: matched,
    nutritionFacts,
    healthProfile,
    mutedAmbiguousAllergens,
    region,
  });

  const totalTerms = matched.length + unmatchedTerms.length;
  const lowConfidence =
    matched.length === 0 ||
    (matched.length < LOW_CONFIDENCE_MIN_MATCHES &&
      totalTerms > 0 &&
      matched.length / totalTerms < LOW_CONFIDENCE_MATCH_RATIO);

  const product: Product = {
    id: generateId('product'),
    barcode,
    name: productName?.trim() || 'Scanned product',
    brand,
    category,
    rawOcrText: rawText,
    parsedIngredientIds: matched.map((m) => m.ingredient.id),
    nutritionFacts,
    source,
    domain,
  };

  const scanId = generateId('scan');
  const finalRecommendations: Recommendation[] = recommendations.map((rec) => ({
    ...rec,
    scanId,
  }));

  return {
    product,
    score,
    scoreLevel,
    alerts,
    recommendations: finalRecommendations,
    matchedIngredients: matched,
    unmatchedTerms,
    scoreFactors,
    lowConfidence,
  };
}
