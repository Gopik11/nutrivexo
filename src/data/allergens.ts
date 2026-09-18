/**
 * Canonical allergen list — matches the options offered in onboarding
 * (see src/constants/strings.ts -> onboarding.healthProfile.allergies.options).
 */
export const KNOWN_ALLERGENS = [
  'Peanuts',
  'Tree nuts',
  'Milk',
  'Eggs',
  'Wheat',
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame',
] as const;

export type KnownAllergen = (typeof KNOWN_ALLERGENS)[number];

/**
 * Ingredients whose source is scientifically related to a known allergen but
 * isn't the allergen itself — e.g. someone allergic to tree nuts is sometimes
 * advised to be cautious with coconut, or someone allergic to shellfish may
 * react to glucosamine supplements sourced from shellfish shells.
 *
 * This is general consumer-education guidance, not medical fact for every
 * individual — Nutrivexo always frames these as "cross-reactive, ask your
 * doctor" rather than "contains".
 */
export const CROSS_REACTIVITY_MAP: Record<KnownAllergen, string[]> = {
  'Tree nuts': ['Coconut'],
  'Shellfish': ['Mollusks', 'Glucosamine'],
  Milk: ['Goat milk', 'Sheep milk'],
  Peanuts: ['Lupin'],
  Fish: [],
  Eggs: [],
  Wheat: [],
  Soy: [],
  Sesame: [],
};

export function isKnownAllergen(value: string): value is KnownAllergen {
  return (KNOWN_ALLERGENS as readonly string[]).includes(value);
}
