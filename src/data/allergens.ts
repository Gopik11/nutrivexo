import type { Region } from '../types';

/**
 * The FDA's 9 major food allergens (FASTER Act, 2021) — matches the options
 * offered in onboarding when the device's region is set to US.
 */
export const US_ALLERGENS = [
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

/**
 * The 14 allergens required by EU Regulation 1169/2011 Annex II — offered
 * instead of the US list when the device's region is set to EU. Two EU
 * categories split what the US treats as a single category (Crustaceans /
 * Molluscs vs "Shellfish"; "Cereals containing gluten" is broader than
 * "Wheat", also covering rye, barley, and oats); five categories (Celery,
 * Mustard, Sulphites, Lupin, Molluscs) have no US equivalent at all.
 */
export const EU_ALLERGENS = [
  'Celery',
  'Crustaceans',
  'Eggs',
  'Fish',
  'Cereals containing gluten',
  'Lupin',
  'Milk',
  'Molluscs',
  'Mustard',
  'Peanuts',
  'Sesame',
  'Soybeans',
  'Sulphites',
  'Tree nuts',
] as const;

export const REGION_ALLERGENS: Record<Region, readonly string[]> = {
  US: US_ALLERGENS,
  EU: EU_ALLERGENS,
};

export type KnownAllergen = (typeof US_ALLERGENS)[number] | (typeof EU_ALLERGENS)[number];

/** All allergy options a user could have on file, regardless of which region is active —
 * so switching region doesn't silently drop an allergy someone already selected. */
const ALL_KNOWN_ALLERGENS: readonly string[] = Array.from(
  new Set([...US_ALLERGENS, ...EU_ALLERGENS])
);

export function allergensForRegion(region: Region): readonly string[] {
  return REGION_ALLERGENS[region];
}

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
  Shellfish: ['Mollusks', 'Glucosamine'],
  Milk: ['Goat milk', 'Sheep milk'],
  Peanuts: ['Lupin'],
  Fish: [],
  Eggs: [],
  Wheat: [],
  Soy: [],
  Sesame: [],
  Celery: [],
  Crustaceans: ['Molluscs', 'Glucosamine'],
  'Cereals containing gluten': [],
  Lupin: ['Peanuts'],
  Molluscs: ['Crustaceans'],
  Mustard: [],
  Soybeans: [],
  Sulphites: [],
};

export function isKnownAllergen(value: string): value is KnownAllergen {
  return ALL_KNOWN_ALLERGENS.includes(value);
}

/**
 * Categories that mean essentially the same thing across regions but are named
 * differently — used to carry a person's existing allergy selections over when
 * they switch region, instead of silently leaving a stale/renamed entry behind.
 */
const REGION_EQUIVALENTS: Record<Region, Record<string, string>> = {
  EU: { Wheat: 'Cereals containing gluten', Shellfish: 'Crustaceans', Soy: 'Soybeans' },
  US: { 'Cereals containing gluten': 'Wheat', Crustaceans: 'Shellfish', Soybeans: 'Soy' },
};

export function remapAllergiesForRegion(allergies: string[], toRegion: Region): string[] {
  const map = REGION_EQUIVALENTS[toRegion];
  return allergies.map((allergy) => map[allergy] ?? allergy);
}
