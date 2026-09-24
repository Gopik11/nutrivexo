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

/**
 * Whole-word/whole-phrase containment: true when `needle` appears in `haystack` on word
 * boundaries (space-padding both sides), not merely as a raw character substring. Both inputs
 * are already `normalize()`d, so words are separated by single spaces. This is what stops, e.g.,
 * "unsalted butter" from matching "salt" (embedded inside "un-salt-ed", not a separate word) or
 * "buckwheat flour" from matching the "wheat" alias (embedded inside "buck-wheat").
 */
function containsWholeWord(haystack: string, needle: string): boolean {
  if (needle.length === 0) return false;
  return ` ${haystack} `.includes(` ${needle} `);
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

  // 2. Whole-word containment either direction (handles "enriched wheat flour"
  //    containing "wheat flour", or a short DB name as a standalone word inside a longer
  //    token) — word-boundary-aware so a DB name embedded inside a *different* word
  //    (e.g. "salt" inside "unsalted") doesn't count.
  for (const entry of LOOKUP_TABLE) {
    if (entry.normalizedName.length >= 4) {
      if (
        containsWholeWord(token, entry.normalizedName) ||
        containsWholeWord(entry.normalizedName, token)
      ) {
        return { ingredient: entry.ingredient, matchedText: token, confidence: 'alias' };
      }
    }
    for (const alias of entry.normalizedAliases) {
      if (alias.length >= 4 && (containsWholeWord(token, alias) || containsWholeWord(alias, token))) {
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
