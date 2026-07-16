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

export type ProductSource = 'scanned' | 'lookup';

export type RecommendationType = 'swap' | 'portion' | 'education';

export type AllergenTier = 'contains' | 'may_contain' | 'cross_reactive';

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
  commonAllergenSource?: string;
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
  dietaryPattern: string;
  healthGoals: string[];
}
