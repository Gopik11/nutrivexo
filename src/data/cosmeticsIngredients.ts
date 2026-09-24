import type { Ingredient } from '../types';

/**
 * Curated, on-device ingredient database for personal care / cosmetics
 * products — the same matching/scoring engine used for food, pointed at a
 * different database (see roadmap: "the underlying architecture generalizes
 * directly"). Coverage is intentionally focused on ingredients that consumer
 * safety apps (Yuka, EWG Skin Deep) and regulators commonly flag, not an
 * exhaustive INCI database. Concern levels reflect general consumer-education
 * guidance, not a medical or regulatory determination — see the in-app
 * disclaimer.
 *
 * `id` values are stable and referenced by saved scans, so don't rename them.
 *
 * Sources for `bannedInEU` / `euRestrictionNote`: EU Cosmetics Regulation (EC)
 * 1223/2009 and its amendments, cross-checked against a September 2026 survey
 * of ingredients banned or restricted in the EU but still permitted in US
 * cosmetics (theweek.com, "6 beauty ingredients banned in the EU but legal in
 * the US"). Regulatory status can change — this is a snapshot, not legal advice.
 */
export const COSMETICS_INGREDIENT_DATABASE: Ingredient[] = [
  // ---- Preservatives --------------------------------------------------
  {
    id: 'cos-dmdm-hydantoin',
    name: 'DMDM Hydantoin',
    aliases: [],
    functionTags: ['preservative', 'formaldehyde-releaser'],
    concernLevel: 'high',
    concernReason:
      'A formaldehyde-releasing preservative — works by slowly releasing small amounts of formaldehyde, a known human carcinogen, to keep the product from growing bacteria.',
    bannedInEU: true,
    euRestrictionNote: 'Formaldehyde-releasing preservatives are banned in EU cosmetics.',
  },
  {
    id: 'cos-quaternium-15',
    name: 'Quaternium-15',
    aliases: [],
    functionTags: ['preservative', 'formaldehyde-releaser'],
    concernLevel: 'high',
    concernReason: 'A formaldehyde-releasing preservative, common in US hair gels and dyes.',
    bannedInEU: true,
    euRestrictionNote: 'Formaldehyde-releasing preservatives are banned in EU cosmetics.',
  },
  {
    id: 'cos-imidazolidinyl-urea',
    name: 'Imidazolidinyl urea',
    aliases: ['imidazolidinyl-urea'],
    functionTags: ['preservative', 'formaldehyde-releaser'],
    concernLevel: 'high',
    concernReason: 'A formaldehyde-releasing preservative used in nail polish, hair straighteners, and baby soaps.',
    bannedInEU: true,
    euRestrictionNote: 'Formaldehyde-releasing preservatives are banned in EU cosmetics.',
  },
  {
    id: 'cos-diazolidinyl-urea',
    name: 'Diazolidinyl urea',
    aliases: ['diazolidinyl-urea'],
    functionTags: ['preservative', 'formaldehyde-releaser'],
    concernLevel: 'high',
    concernReason: 'A formaldehyde-releasing preservative used in nail polish, hair straighteners, and baby soaps.',
    bannedInEU: true,
    euRestrictionNote: 'Formaldehyde-releasing preservatives are banned in EU cosmetics.',
  },
  {
    id: 'cos-methylparaben',
    name: 'Methylparaben',
    aliases: [],
    functionTags: ['preservative', 'paraben'],
    concernLevel: 'low',
    concernReason: 'A widely used, well-studied preservative — the least-restricted paraben in both the US and EU.',
  },
  {
    id: 'cos-ethylparaben',
    name: 'Ethylparaben',
    aliases: [],
    functionTags: ['preservative', 'paraben'],
    concernLevel: 'low',
    concernReason: 'A widely used, well-studied preservative, permitted in both the US and EU.',
  },
  {
    id: 'cos-propylparaben',
    name: 'Propylparaben',
    aliases: [],
    functionTags: ['preservative', 'paraben'],
    concernLevel: 'moderate',
    concernReason: 'A preservative with some evidence of hormone-mimicking activity; the EU caps its concentration more tightly than the US does.',
  },
  {
    id: 'cos-butylparaben',
    name: 'Butylparaben',
    aliases: [],
    functionTags: ['preservative', 'paraben'],
    concernLevel: 'moderate',
    concernReason: 'A preservative with some evidence of hormone-mimicking activity; the EU caps its concentration more tightly than the US does.',
  },
  {
    id: 'cos-long-chain-parabens',
    name: 'Isopropylparaben / Isobutylparaben / Benzylparaben',
    aliases: ['isopropylparaben', 'isobutylparaben', 'phenylparaben', 'benzylparaben', 'pentylparaben'],
    functionTags: ['preservative', 'paraben'],
    concernLevel: 'high',
    concernReason: 'A longer-chain paraben with less safety data than methyl/ethylparaben.',
    bannedInEU: true,
    euRestrictionNote: 'This group of parabens (isopropyl-, isobutyl-, phenyl-, benzyl-, pentylparaben) is banned in EU cosmetics.',
  },

  // ---- Colorants --------------------------------------------------------
  {
    id: 'cos-coal-tar-dyes',
    name: 'Coal tar dyes',
    aliases: ['ci 19140', 'ci 42090', 'fd&c yellow 5', 'fd&c blue 1', 'fd&c red 40', 'p-phenylenediamine'],
    functionTags: ['colorant'],
    concernLevel: 'high',
    concernReason: 'Petroleum-derived colorants studied for links to increased cancer risk; common in US hair dyes, which are exempt from FDA color-additive approval.',
    bannedInEU: true,
    euRestrictionNote: 'Coal tar dyes are banned in EU cosmetics.',
  },

  // ---- Skin-lightening ---------------------------------------------------
  {
    id: 'cos-hydroquinone',
    name: 'Hydroquinone',
    aliases: [],
    functionTags: ['skin-lightening'],
    concernLevel: 'high',
    concernReason: 'A skin-lightening agent that works by suppressing melanin production; associated with increased skin-cancer risk with prolonged use.',
    bannedInEU: true,
    euRestrictionNote: 'Banned in EU cosmetics; available only by prescription in the US since 2021.',
  },

  // ---- Plasticizers -------------------------------------------------------
  {
    id: 'cos-dbp',
    name: 'Dibutyl phthalate',
    aliases: ['dbp'],
    functionTags: ['plasticizer', 'phthalate'],
    concernLevel: 'high',
    concernReason: 'A plasticizer (used in some nail polishes) suspected of disrupting hormone function and reproductive development.',
    bannedInEU: true,
    euRestrictionNote: 'Banned in EU cosmetics; still found in some US nail products.',
  },
  {
    id: 'cos-dehp',
    name: 'Diethylhexyl phthalate',
    aliases: ['dehp'],
    functionTags: ['plasticizer', 'phthalate'],
    concernLevel: 'high',
    concernReason: 'A plasticizer suspected of disrupting hormone function and reproductive development.',
    bannedInEU: true,
    euRestrictionNote: 'Banned in EU cosmetics; still found in some US scented products.',
  },

  // ---- Antimicrobials -----------------------------------------------------
  {
    id: 'cos-triclosan',
    name: 'Triclosan',
    aliases: [],
    functionTags: ['antimicrobial'],
    concernLevel: 'high',
    concernReason: 'An antimicrobial agent with evidence of endocrine disruption; still used in some US toothpastes and cosmetics.',
    bannedInEU: true,
    euRestrictionNote: 'Banned in EU cosmetics as of 2025.',
  },

  // ---- UV filters ---------------------------------------------------------
  {
    id: 'cos-oxybenzone',
    name: 'Oxybenzone',
    aliases: ['benzophenone-3', 'benzophenone-4'],
    functionTags: ['uv-filter'],
    concernLevel: 'moderate',
    concernReason: 'A chemical UV filter studied for hormone-disruption potential and coral-reef toxicity; the EU caps its concentration more tightly than the US does.',
  },

  // ---- Surfactants ----------------------------------------------------------
  {
    id: 'cos-sodium-lauryl-sulfate',
    name: 'Sodium Lauryl Sulfate',
    aliases: ['sls'],
    functionTags: ['surfactant'],
    concernLevel: 'low',
    concernReason: 'A strong cleansing agent that can irritate skin and eyes with frequent use, especially on sensitive skin — not a systemic safety concern.',
  },
  {
    id: 'cos-sodium-laureth-sulfate',
    name: 'Sodium Laureth Sulfate',
    aliases: ['sles'],
    functionTags: ['surfactant'],
    concernLevel: 'low',
    concernReason: 'A milder relative of SLS; manufacturing can leave trace 1,4-dioxane, a byproduct regulators recommend minimizing.',
  },

  // ---- Emulsifiers / texture --------------------------------------------
  {
    id: 'cos-peg-compounds',
    name: 'PEG compounds',
    aliases: ['peg-100 stearate', 'peg-40 hydrogenated castor oil', 'polyethylene glycol'],
    functionTags: ['emulsifier'],
    concernLevel: 'low',
    concernReason: 'Manufacturing can leave trace ethylene oxide or 1,4-dioxane, byproducts regulators recommend minimizing — not a concern from the PEG compound itself.',
  },
  {
    id: 'cos-cyclotetrasiloxane',
    name: 'Cyclotetrasiloxane',
    aliases: ['d4'],
    functionTags: ['silicone', 'emollient'],
    concernLevel: 'moderate',
    concernReason: 'A silicone that persists in the environment and has shown hormone-disruption effects in lab studies.',
    bannedInEU: true,
    euRestrictionNote: 'Restricted above 0.1% in rinse-off cosmetic products in the EU since 2020, over environmental persistence.',
  },
  {
    id: 'cos-cyclopentasiloxane',
    name: 'Cyclopentasiloxane',
    aliases: ['d5'],
    functionTags: ['silicone', 'emollient'],
    concernLevel: 'moderate',
    concernReason: 'A silicone that persists in the environment; under review for the same reasons as D4.',
    bannedInEU: true,
    euRestrictionNote: 'Restricted above 0.1% in rinse-off cosmetic products in the EU since 2020, over environmental persistence.',
  },

  // ---- Other -----------------------------------------------------------
  {
    id: 'cos-talc',
    name: 'Talc',
    aliases: [],
    functionTags: ['filler', 'absorbent'],
    concernLevel: 'moderate',
    concernReason: 'A mineral that, if not properly purified, can carry trace asbestos contamination — the subject of ongoing litigation and regulatory scrutiny.',
  },
  {
    id: 'cos-aluminum-compounds',
    name: 'Aluminum chlorohydrate',
    aliases: ['aluminum zirconium', 'aluminum chloride'],
    functionTags: ['antiperspirant-active'],
    concernLevel: 'low',
    concernReason: 'The active ingredient in antiperspirants; major health bodies (FDA, ACS) currently find the evidence for a breast-cancer link inconclusive.',
  },
  {
    id: 'cos-fragrance',
    name: 'Fragrance',
    aliases: ['parfum'],
    functionTags: ['fragrance'],
    concernLevel: 'low',
    concernReason:
      '"Fragrance"/"Parfum" can be a blend of dozens of undisclosed compounds under trade-secret protection — individually regulated allergens above a threshold must still be named separately (see the ingredients below).',
  },

  // ---- EU-mandated fragrance allergens (Reg. 1223/2009 Annex III, the
  // original 26 — a 2023 amendment, 2023/1545, expanded EU labeling to 82
  // substances with an August 2026 compliance deadline; this starter set
  // covers the original, most-recognized 26 rather than the full new list).
  // These are common, often naturally-derived fragrance components — being
  // on this list means "must be individually named on an EU label above a
  // concentration threshold", not "unsafe". concernLevel is 'none'.
  ...([
    'Amyl cinnamal',
    'Benzyl alcohol',
    'Cinnamyl alcohol',
    'Citral',
    'Eugenol',
    'Hydroxycitronellal',
    'Isoeugenol',
    'Amylcinnamyl alcohol',
    'Benzyl salicylate',
    'Cinnamal',
    'Coumarin',
    'Geraniol',
    'Anisyl alcohol',
    'Benzyl cinnamate',
    'Farnesol',
    'Linalool',
    'Benzyl benzoate',
    'Citronellol',
    'Hexyl cinnamal',
    'Limonene',
    'Methyl 2-octynoate',
    'Alpha-Isomethyl Ionone',
    'Evernia prunastri extract',
    'Evernia furfuracea extract',
    'Hydroxyisohexyl 3-cyclohexene carboxaldehyde',
    'Butylphenyl methylpropional',
  ] as const).map(
    (name): Ingredient => ({
      id: `cos-fragrance-allergen-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
      name,
      aliases: name === 'Evernia prunastri extract' ? ['oakmoss extract', 'oakmoss'] :
               name === 'Evernia furfuracea extract' ? ['treemoss extract', 'treemoss'] :
               name === 'Hydroxyisohexyl 3-cyclohexene carboxaldehyde' ? ['hicc', 'lyral'] :
               name === 'Butylphenyl methylpropional' ? ['lilial', 'bmhca'] :
               [],
      functionTags: ['fragrance', 'fragrance-allergen'],
      concernLevel: 'none',
      fragranceAllergen: true,
    })
  ),
];
