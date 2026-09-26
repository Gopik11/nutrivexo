import type { NutritionFacts } from '../types';

const REQUEST_TIMEOUT_MS = 8000;

// Open Food Facts asks integrators to identify their app in the User-Agent so they can
// reach out about API changes/abuse rather than silently rate-limiting us.
const USER_AGENT = 'Nutrivexo/1.0 (Android; +https://github.com/Gopik11/nutrivexo)';

export interface OffLookupResult {
  found: boolean;
  productName?: string;
  brand?: string;
  category?: string;
  ingredientsText?: string;
  nutritionFacts?: NutritionFacts;
  /** True when the network call itself failed (timeout, offline, server error) — distinct
   * from `found: false`, which means the barcode simply isn't in the database. The caller
   * should show a different message for each case. */
  networkError?: boolean;
}

interface OffNutriments {
  // Open Food Facts stores nutriments per-100g and, when the manufacturer's per-serving
  // values were entered, per-serving too. We prefer per-serving (matches how Nutrivexo's
  // own OCR-parsed NutritionFacts are scoped) and fall back to per-100g.
  'energy-kcal_serving'?: number;
  'energy-kcal_100g'?: number;
  fat_serving?: number;
  fat_100g?: number;
  'saturated-fat_serving'?: number;
  'saturated-fat_100g'?: number;
  sodium_serving?: number;
  sodium_100g?: number;
  salt_serving?: number;
  salt_100g?: number;
  carbohydrates_serving?: number;
  carbohydrates_100g?: number;
  sugars_serving?: number;
  sugars_100g?: number;
  'added-sugars_serving'?: number;
  'added-sugars_100g'?: number;
  proteins_serving?: number;
  proteins_100g?: number;
  fiber_serving?: number;
  fiber_100g?: number;
}

interface OffProduct {
  product_name?: string;
  brands?: string;
  categories?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  serving_size?: string;
  nutriments?: OffNutriments;
}

interface OffResponse {
  code: string;
  status: 0 | 1;
  status_verbose?: string;
  product?: OffProduct;
}

function pick(serving: number | undefined, per100g: number | undefined): number | undefined {
  return serving ?? per100g;
}

/**
 * Open Food Facts stores sodium in grams (not milligrams, unlike Nutrivexo's own
 * NutritionFacts.sodium). If only "salt" is available (also grams), sodium is
 * roughly 40% of salt by weight (salt = NaCl; Na is ~39.3% of NaCl's mass).
 */
function resolveSodiumMg(nutriments: OffNutriments | undefined): number | undefined {
  if (!nutriments) return undefined;
  const sodiumG = pick(nutriments.sodium_serving, nutriments.sodium_100g);
  if (sodiumG !== undefined) return Math.round(sodiumG * 1000);
  const saltG = pick(nutriments.salt_serving, nutriments.salt_100g);
  if (saltG !== undefined) return Math.round(saltG * 1000 * 0.4);
  return undefined;
}

function mapNutriments(nutriments: OffNutriments | undefined): NutritionFacts | undefined {
  if (!nutriments) return undefined;

  const facts: NutritionFacts = {
    calories: pick(nutriments['energy-kcal_serving'], nutriments['energy-kcal_100g']),
    totalFat: pick(nutriments.fat_serving, nutriments.fat_100g),
    saturatedFat: pick(nutriments['saturated-fat_serving'], nutriments['saturated-fat_100g']),
    sodium: resolveSodiumMg(nutriments),
    totalCarbohydrates: pick(nutriments.carbohydrates_serving, nutriments.carbohydrates_100g),
    sugars: pick(nutriments.sugars_serving, nutriments.sugars_100g),
    addedSugars: pick(nutriments['added-sugars_serving'], nutriments['added-sugars_100g']),
    protein: pick(nutriments.proteins_serving, nutriments.proteins_100g),
    fiber: pick(nutriments.fiber_serving, nutriments.fiber_100g),
  };

  // If every field came back undefined, treat it as "no nutrition data" rather than an
  // object full of undefineds — keeps downstream low-confidence detection meaningful.
  const hasAnyValue = Object.values(facts).some((value) => value !== undefined);
  return hasAnyValue ? facts : undefined;
}

export interface OffSearchCandidate {
  barcode: string;
  productName: string;
  brand?: string;
  ingredientsText: string;
  nutritionFacts?: NutritionFacts;
}

interface OffSearchProduct extends OffProduct {
  code?: string;
}

interface OffSearchResponse {
  products?: OffSearchProduct[];
}

/**
 * Searches Open Food Facts for other products in the same category — used to
 * power "better alternatives" swap suggestions for a barcode-scanned product.
 * Uses the legacy `cgi/search.pl` endpoint, which (unlike v2) supports
 * category-tag search with a compact JSON response.
 */
export async function searchProductsByCategory(
  category: string,
  excludeBarcode?: string
): Promise<OffSearchCandidate[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const params = new URLSearchParams({
      search_terms: '',
      tagtype_0: 'categories',
      tag_contains_0: 'contains',
      tag_0: category,
      sort_by: 'unique_scans_n',
      page_size: '20',
      json: '1',
      fields: 'code,product_name,brands,ingredients_text,ingredients_text_en,nutriments',
    });
    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?${params.toString()}`, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) return [];

    const data = (await response.json()) as OffSearchResponse;
    const products = data.products ?? [];

    return products
      .filter((p): p is OffSearchProduct & { code: string } => Boolean(p.code))
      .filter((p) => p.code !== excludeBarcode)
      .map((p) => ({
        barcode: p.code,
        productName: p.product_name?.trim() || '',
        brand: p.brands?.split(',')[0]?.trim() || undefined,
        ingredientsText: (p.ingredients_text_en || p.ingredients_text)?.trim() || '',
        nutritionFacts: mapNutriments(p.nutriments),
      }))
      .filter((p) => p.productName && p.ingredientsText.length >= 3);
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Looks up a scanned barcode against the Open Food Facts public database
 * (https://world.openfoodfacts.org — no API key required). This is the only
 * network call anywhere in Nutrivexo's scan pipeline; ingredient matching and
 * scoring themselves always run on-device.
 */
export async function lookupProductByBarcode(barcode: string): Promise<OffLookupResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
      {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: controller.signal,
      }
    );

    // Open Food Facts returns a plain HTTP 404 for a barcode that simply isn't in the
    // database (not a service failure) — that's a legitimate "not found", not a network
    // error. Any other non-2xx (5xx, etc.) is a genuine problem reaching the service.
    if (response.status === 404) {
      return { found: false };
    }
    if (!response.ok) {
      return { found: false, networkError: true };
    }

    const data = (await response.json()) as OffResponse;
    if (data.status !== 1 || !data.product) {
      return { found: false };
    }

    const { product } = data;
    return {
      found: true,
      productName: product.product_name?.trim() || undefined,
      brand: product.brands?.split(',')[0]?.trim() || undefined,
      category: product.categories?.split(',')[0]?.trim() || undefined,
      ingredientsText: (product.ingredients_text_en || product.ingredients_text)?.trim() || undefined,
      nutritionFacts: mapNutriments(product.nutriments),
    };
  } catch (error) {
    // Timeout (AbortError), offline, DNS failure, malformed JSON, etc — all surfaced the
    // same way to the caller, which shows a "couldn't reach the database" message. Logged
    // (not just swallowed) so a genuine network problem is visible via `adb logcat` instead
    // of only ever showing up as an unexplained user-facing error.
    console.warn('[openFoodFacts] lookupProductByBarcode failed:', error);
    return { found: false, networkError: true };
  } finally {
    clearTimeout(timeout);
  }
}
