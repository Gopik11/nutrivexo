/** Small text-matching utilities shared by the ingredient matcher. No external deps. */

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9\s%-]/g, ' ') // drop punctuation except % and -
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Manually-entered or photographed label text often includes both the
 * ingredient list and the Nutrition Facts panel in one block. Nutrition
 * Facts lines ("Calories 180", "Sodium 210mg", ...) aren't comma-separated,
 * so left un-trimmed they'd show up as junk "unmatched ingredient" tokens.
 * This trims the text to just the ingredients portion, when a Nutrition
 * Facts heading is present.
 */
export function extractIngredientsSection(rawText: string): string {
  const boundary = rawText.search(/nutrition\s*facts|nutrition\s*information|amount per serving/i);
  return boundary === -1 ? rawText : rawText.slice(0, boundary);
}

/**
 * Splits raw ingredient-label text into candidate tokens. Handles the two
 * common label shapes: comma-separated lists, and lists with nested
 * parenthetical sub-ingredients (e.g. "Enriched flour (wheat flour, niacin)").
 */
export function tokenizeIngredientList(rawText: string): string[] {
  const ingredientsOnly = extractIngredientsSection(rawText);
  const withoutHeader = ingredientsOnly.replace(/ingredients\s*:?/i, '');
  const flattened = withoutHeader.replace(/[()]/g, ',');
  const tokens = flattened
    .split(/[,;\n]|\bcontains\b/i)
    .map((token) => normalize(token))
    .map((token) => token.replace(/^\d+(\.\d+)?%\s*/, '').trim()) // leading "2% "
    .filter((token) => token.length > 1);

  return Array.from(new Set(tokens));
}

/** Classic Levenshtein edit distance, used for small OCR-typo tolerance. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prevRow = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i += 1) {
    const currentRow = [i];
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currentRow.push(
        Math.min(
          currentRow[j - 1] + 1, // insertion
          prevRow[j] + 1, // deletion
          prevRow[j - 1] + cost // substitution
        )
      );
    }
    prevRow = currentRow;
  }
  return prevRow[n];
}

/** True when two normalized strings are close enough to count as an OCR-typo match. */
export function isFuzzyMatch(a: string, b: string): boolean {
  if (a === b) return true;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen < 4) return false; // too short to safely fuzzy-match
  const distance = levenshtein(a, b);
  const threshold = maxLen <= 6 ? 1 : maxLen <= 12 ? 2 : 3;
  return distance <= threshold;
}
