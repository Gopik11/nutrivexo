import { matchIngredients } from './ingredientMatcher';
import { analyzeScan } from './scoring';
import { searchProductsByCategory } from './openFoodFacts';
import type { AnalysisResult, OnboardingHealthProfileDraft } from '../types';

export interface SwapCandidate {
  barcode: string;
  productName: string;
  brand?: string;
  score: number;
  scoreLevel: 'good' | 'moderate' | 'alert';
}

const MAX_CANDIDATES_TO_SCORE = 20;
const MAX_RESULTS = 3;

/**
 * For a barcode-scanned product that scored poorly or triggered an allergen
 * alert, searches Open Food Facts for other products in the same category and
 * scores each one through Nutrivexo's own on-device engine (same ingredient
 * matching + scoring logic as any other scan), returning the best-scoring
 * alternatives that don't themselves trigger a "contains" allergen alert.
 *
 * This is the one place the swap catalog reaches the network — like barcode
 * lookup itself, everything about scoring a candidate still runs on-device.
 */
export async function findSwapCandidates(
  analysis: Pick<AnalysisResult, 'product' | 'score'>,
  healthProfile: OnboardingHealthProfileDraft,
  mutedAmbiguousAllergens: string[] = []
): Promise<SwapCandidate[]> {
  const { product } = analysis;
  if (product.source !== 'barcode' || !product.category) return [];

  const candidates = await searchProductsByCategory(product.category, product.barcode);
  const scored: SwapCandidate[] = [];

  for (const candidate of candidates.slice(0, MAX_CANDIDATES_TO_SCORE)) {
    const { matched } = matchIngredients(candidate.ingredientsText);
    if (matched.length === 0) continue;

    const result = analyzeScan({
      matchedIngredients: matched,
      nutritionFacts: candidate.nutritionFacts,
      healthProfile,
      mutedAmbiguousAllergens,
    });

    // Never suggest a "swap" that itself contains a flagged allergen.
    if (result.alerts.some((a) => a.tier === 'contains')) continue;

    scored.push({
      barcode: candidate.barcode,
      productName: candidate.productName,
      brand: candidate.brand,
      score: result.score,
      scoreLevel: result.scoreLevel,
    });
  }

  return scored
    .filter((c) => c.score > analysis.score)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS);
}
