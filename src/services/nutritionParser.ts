import type { NutritionFacts } from '../types';

/**
 * Lightweight regex-based extraction of a Nutrition Facts panel from OCR or
 * typed text. US labels are fairly consistent in wording, so we match a
 * handful of known field patterns rather than attempting full layout
 * parsing. Any field we can't find is simply left undefined.
 */
export function parseNutritionFacts(rawText: string): NutritionFacts | undefined {
  const text = rawText.replace(/\r/g, '\n');
  const facts: NutritionFacts = {};

  const servingMatch = text.match(/serving size\s*[:\-]?\s*([^\n]+)/i);
  if (servingMatch) {
    facts.servingSize = servingMatch[1].trim().slice(0, 40);
  }

  const numberAfter = (pattern: RegExp): number | undefined => {
    const match = text.match(pattern);
    if (!match) return undefined;
    const value = parseFloat(match[1]);
    return Number.isFinite(value) ? value : undefined;
  };

  facts.calories = numberAfter(/calories\s*[:\-]?\s*(\d+(?:\.\d+)?)/i);
  facts.totalFat = numberAfter(/total fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i);
  facts.saturatedFat = numberAfter(/saturated fat\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i);
  facts.sodium = numberAfter(/sodium\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*mg/i);
  facts.totalCarbohydrates = numberAfter(
    /total carbohydrate[s]?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i
  );
  // Match "added sugars" first, then only look for a standalone "sugars" line
  // that isn't part of the "added sugars" line, to avoid double-counting.
  // (Avoids lookbehind regex, which isn't reliably supported across RN JS engines.)
  facts.addedSugars = numberAfter(/added sugars?\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i);
  const sugarsLine = text
    .split('\n')
    .find((line) => /sugars\s*[:\-]?\s*\d/i.test(line) && !/added/i.test(line));
  if (sugarsLine) {
    const match = sugarsLine.match(/sugars\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i);
    if (match) {
      const value = parseFloat(match[1]);
      if (Number.isFinite(value)) facts.sugars = value;
    }
  }
  facts.protein = numberAfter(/protein\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i);
  facts.fiber = numberAfter(/(?:dietary )?fiber\s*[:\-]?\s*(\d+(?:\.\d+)?)\s*g/i);

  const hasAnyValue = Object.values(facts).some((value) => value !== undefined);
  return hasAnyValue ? facts : undefined;
}
