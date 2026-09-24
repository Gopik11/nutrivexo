export type DietaryPattern =
  | 'no_specific_pattern'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'gluten_free'
  | 'low_sodium'
  | 'low_sugar'
  | 'keto';

export type HealthGoal =
  | 'reduce_added_sugar'
  | 'lower_sodium'
  | 'more_whole_foods'
  | 'manage_weight'
  | 'support_heart_health'
  | 'support_gut_health';

export type ConcernLevel = 'none' | 'low' | 'moderate' | 'high';

export type ProductSource = 'scanned' | 'lookup' | 'barcode';

export type RecommendationType = 'swap' | 'portion' | 'education';

export type AllergenTier = 'contains' | 'may_contain' | 'cross_reactive' | 'dietary_conflict';

/**
 * Which regional allergen-labeling list and nutrition-threshold framing to use.
 * US: the FDA's 9 major food allergens, %DV-style thresholds. EU: the 14
 * allergens required by EU Regulation 1169/2011 Annex II, EU nutrient
 * reference-intake-style thresholds.
 */
export type Region = 'US' | 'EU';

/**
 * Dietary-pattern conflict markers, independent of the 9-allergen alert system.
 * An ingredient can carry several — e.g. gelatin is not-vegan, not-vegetarian,
 * not-halal, and not-kosher all at once. Left off an ingredient when the real
 * answer is genuinely ambiguous (e.g. sourcing-dependent) rather than guessed.
 */
export type DietaryFlag =
  | 'not-vegan'
  | 'not-vegetarian'
  | 'contains-gluten'
  | 'contains-lactose'
  | 'high-fodmap'
  | 'not-halal'
  | 'not-kosher';

export interface DailyTargets {
  calories?: number;
  sugar?: number;
  sodium?: number;
  saturatedFat?: number;
  fiber?: number;
}

export interface User {
  id: string;
  email?: string;
  createdAt: string;
}

export interface HealthProfile {
  userId: string;
  allergies: string[];
  medicalConditions: string[];
  dietaryPattern: DietaryPattern;
  healthGoals: HealthGoal[];
  dailyTargets: DailyTargets;
}

export interface Ingredient {
  id: string;
  name: string;
  aliases: string[];
  functionTags: string[];
  concernLevel: ConcernLevel;
  concernReason?: string;
  /**
   * Every allergen-label category this ingredient is a source of, across
   * regions — e.g. wheat flour carries both the US "Wheat" category and the
   * EU "Cereals containing gluten" category. A single ingredient can list
   * several; region-aware matching just checks membership.
   */
  allergenSources?: string[];
  /**
   * Ingredients like "natural flavors" or "spices" can hide allergens without
   * naming them. When true, any user allergy triggers a low-confidence
   * "may contain" caution rather than a "may contain <this allergen>" alert.
   */
  ambiguousAllergenRisk?: boolean;
  /** Dietary-pattern conflicts this ingredient carries (vegan, halal, gluten, etc). */
  dietaryFlags?: DietaryFlag[];
}

export interface NutritionFacts {
  servingSize?: string;
  calories?: number;
  totalFat?: number;
  saturatedFat?: number;
  sodium?: number;
  totalCarbohydrates?: number;
  sugars?: number;
  addedSugars?: number;
  protein?: number;
  fiber?: number;
}

export interface Product {
  id: string;
  barcode?: string;
  name: string;
  brand?: string;
  category?: string;
  rawOcrText?: string;
  parsedIngredientIds: string[];
  nutritionFacts?: NutritionFacts;
  source: ProductSource;
}

export interface ScanHistory {
  id: string;
  userId: string;
  productId: string;
  scannedAt: string;
  healthScore: number;
  alertsShown: AllergenAlert[];
}

export interface AllergenAlert {
  tier: AllergenTier;
  allergen: string;
  ingredientName: string;
  message: string;
}

export interface Recommendation {
  scanId: string;
  type: RecommendationType;
  content: string;
}

export interface OnboardingHealthProfileDraft {
  allergies: string[];
  medicalConditions: string[];
  /** Multi-select: a person can be e.g. both vegetarian and low-sodium at once. */
  dietaryPatterns: string[];
  healthGoals: string[];
}

/** A single ingredient matched from OCR/typed text, with its position in the source text. */
export interface MatchedIngredient {
  ingredient: Ingredient;
  matchedText: string;
  confidence: 'exact' | 'alias' | 'fuzzy';
}

/** Full output of running a scan's text + nutrition facts through the analysis engine. */
export interface AnalysisResult {
  product: Product;
  score: number;
  scoreLevel: 'good' | 'moderate' | 'alert';
  alerts: AllergenAlert[];
  recommendations: Recommendation[];
  matchedIngredients: MatchedIngredient[];
  unmatchedTerms: string[];
  scoreFactors: ScoreFactor[];
  /**
   * True when too little of the label could be matched/parsed to trust the score
   * (e.g. mostly unmatched terms, no nutrition facts found). The UI should show an
   * explicit "not enough data" state instead of presenting the score as reliable.
   */
  lowConfidence?: boolean;
}

export interface ScoreFactor {
  label: string;
  detail: string;
  impact: 'positive' | 'negative' | 'neutral';
  points: number;
}

/** A saved, persisted scan — the AnalysisResult plus identity/timestamp for history. */
export interface SavedScan {
  id: string;
  scannedAt: string;
  product: Product;
  score: number;
  scoreLevel: 'good' | 'moderate' | 'alert';
  alerts: AllergenAlert[];
  recommendations: Recommendation[];
  matchedIngredientNames: string[];
  unmatchedTerms: string[];
  scoreFactors: ScoreFactor[];
  lowConfidence?: boolean;
  /** Name of the household member this was scored for, when more than one member exists. */
  scoredForMemberName?: string;
}

/**
 * A household/family member profile. Nutrivexo keeps one shared device and
 * one shared scan history — switching the active member swaps which health
 * profile (allergies, dietary patterns, goals) scoring uses, and each saved
 * scan records which member it was scored for.
 */
export interface HouseholdMember {
  id: string;
  name: string;
  profile: OnboardingHealthProfileDraft;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  weeklyDigestEnabled: boolean;
  highConcernAlertsEnabled: boolean;
  /**
   * Allergen names for which the user has opted out of "may contain" caution
   * alerts driven by `ambiguousAllergenRisk` ingredients (e.g. "natural flavors").
   * Direct "contains" alerts and dietary-conflict alerts are never muted.
   */
  mutedAmbiguousAllergens?: string[];
  /** Which regional allergen list + nutrition thresholds to use. Defaults to 'US'. */
  region?: Region;
}
