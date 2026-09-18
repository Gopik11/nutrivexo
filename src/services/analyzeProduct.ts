import { generateId } from './id';
import { matchIngredients } from './ingredientMatcher';
import { parseNutritionFacts } from './nutritionParser';
import { analyzeScan } from './scoring';
import type { AnalysisResult, OnboardingHealthProfileDraft, Product, Recommendation } from '../types';

export interface AnalyzeProductInput {
  rawText: string;
  productName?: string;
  healthProfile: OnboardingHealthProfileDraft;
  source?: Product['source'];
}

/**
 * The single entry point that turns raw label text (from OCR or manual
 * entry) into a full AnalysisResult: matched ingredients, a health score,
 * allergen alerts, and recommendations, tailored to the given health
 * profile. Runs entirely on-device — no network calls.
 */
export function analyzeProduct(input: AnalyzeProductInput): AnalysisResult {
  const { rawText, productName, healthProfile, source = 'scanned' } = input;

  const { matched, unmatchedTerms } = matchIngredients(rawText);
  const nutritionFacts = parseNutritionFacts(rawText);

  const { score, scoreLevel, scoreFactors, alerts, recommendations } = analyzeScan({
    matchedIngredients: matched,
    nutritionFacts,
    healthProfile,
  });

  const product: Product = {
    id: generateId('product'),
    name: productName?.trim() || 'Scanned product',
    rawOcrText: rawText,
    parsedIngredientIds: matched.map((m) => m.ingredient.id),
    nutritionFacts,
    source,
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
  };
}
