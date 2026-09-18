import { INGREDIENT_DATABASE } from '../data/ingredients';
import type { Ingredient, MatchedIngredient } from '../types';
import { isFuzzyMatch, normalize, tokenizeIngredientList } from './textMatch';

interface LookupEntry {
  ingredient: Ingredient;
  normalizedName: string;
  normalizedAliases: string[];
}

const LOOKUP_TABLE: LookupEntry[] = INGREDIENT_DATABASE.map((ingredient) => ({
  ingredient,
  normalizedName: normalize(ingredient.name),
  normalizedAliases: ingredient.aliases.map(normalize),
}));

export interface MatchOutcome {
  matched: MatchedIngredient[];
  unmatchedTerms: string[];
}

function matchToken(token: string): MatchedIngredient | null {
  // 1. Exact name/alias match.
  for (const entry of LOOKUP_TABLE) {
    if (entry.normalizedName === token) {
      return { ingredient: entry.ingredient, matchedText: token, confidence: 'exact' };
    }
    if (entry.normalizedAliases.includes(token)) {
      return { ingredient: entry.ingredient, matchedText: token, confidence: 'alias' };
    }
  }

  // 2. Substring containment either direction (handles "enriched wheat flour"
  //    containing "wheat flour", or a short DB name inside a longer token).
  for (const entry of LOOKUP_TABLE) {
    if (token.includes(entry.normalizedName) || entry.normalizedName.includes(token)) {
      if (entry.normalizedName.length >= 4) {
        return { ingredient: entry.ingredient, matchedText: token, confidence: 'alias' };
      }
    }
    for (const alias of entry.normalizedAliases) {
      if (alias.length >= 4 && (token.includes(alias) || alias.includes(token))) {
        return { ingredient: entry.ingredient, matchedText: token, confidence: 'alias' };
      }
    }
  }

  // 3. Fuzzy match to tolerate OCR typos.
  for (const entry of LOOKUP_TABLE) {
    if (isFuzzyMatch(token, entry.normalizedName)) {
      return { ingredient: entry.ingredient, matchedText: token, confidence: 'fuzzy' };
    }
    for (const alias of entry.normalizedAliases) {
      if (isFuzzyMatch(token, alias)) {
        return { ingredient: entry.ingredient, matchedText: token, confidence: 'fuzzy' };
      }
    }
  }

  return null;
}

/**
 * Parses raw ingredient-label text (from OCR or typed manually) into matched
 * ingredients from the on-device database, plus any terms that couldn't be
 * matched (shown to the user rather than silently dropped).
 */
export function matchIngredients(rawText: string): MatchOutcome {
  const tokens = tokenizeIngredientList(rawText);
  const matched: MatchedIngredient[] = [];
  const unmatchedTerms: string[] = [];
  const seenIngredientIds = new Set<string>();

  for (const token of tokens) {
    const result = matchToken(token);
    if (result) {
      if (!seenIngredientIds.has(result.ingredient.id)) {
        seenIngredientIds.add(result.ingredient.id);
        matched.push(result);
      }
    } else {
      unmatchedTerms.push(token);
    }
  }

  return { matched, unmatchedTerms };
}
