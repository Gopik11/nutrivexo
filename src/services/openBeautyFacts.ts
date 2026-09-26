// Kept in sync with openFoodFacts.ts's timeout — see the comment there.
const REQUEST_TIMEOUT_MS = 15000;

// Same courtesy header convention as the Open Food Facts client — Open Beauty
// Facts is run by the same nonprofit (openfoodfacts.org) on the same
// "Product Opener" platform, just a different database of products, so it
// asks for the same kind of identification.
const USER_AGENT = 'Nutrivexo/1.0 (Android; +https://github.com/Gopik11/nutrivexo)';

export interface ObfLookupResult {
  found: boolean;
  productName?: string;
  brand?: string;
  category?: string;
  ingredientsText?: string;
  /** True when the network call itself failed — distinct from `found: false`
   * (barcode not in the database). The caller shows a different message for each. */
  networkError?: boolean;
}

interface ObfProduct {
  product_name?: string;
  brands?: string;
  categories?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
}

interface ObfResponse {
  code: string;
  status: 0 | 1;
  status_verbose?: string;
  product?: ObfProduct;
}

/**
 * Looks up a scanned barcode against the Open Beauty Facts public database
 * (https://world.openbeautyfacts.org — no API key required, same
 * Product Opener API shape as Open Food Facts minus the nutrition table:
 * https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/scanning-cosmetics-pet-food-and-other-products/).
 * Ingredient matching and scoring still run entirely on-device afterward.
 */
export async function lookupCosmeticByBarcode(barcode: string): Promise<ObfLookupResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://world.openbeautyfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
      {
        headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
        signal: controller.signal,
      }
    );

    // Same Product Opener API behavior as Open Food Facts: a barcode that isn't in the
    // database returns a plain HTTP 404, not a service failure — treat that as a
    // legitimate "not found" rather than a network error. Other non-2xx is a real problem.
    if (response.status === 404) {
      return { found: false };
    }
    if (!response.ok) {
      return { found: false, networkError: true };
    }

    const data = (await response.json()) as ObfResponse;
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
    };
  } catch (error) {
    // Timeout (AbortError), offline, DNS failure, malformed JSON, etc — logged so a genuine
    // network problem is visible via `adb logcat` instead of only showing up as an
    // unexplained user-facing error.
    console.warn('[openBeautyFacts] lookupCosmeticByBarcode failed:', error);
    return { found: false, networkError: true };
  } finally {
    clearTimeout(timeout);
  }
}
