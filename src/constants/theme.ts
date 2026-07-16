export const colors = {
  accent: {
    50: '#FAF4EE',
    100: '#F2E6D8',
    200: '#E5CCB5',
    300: '#D4AD8A',
    400: '#C08F6A',
    500: '#A8734F',
    600: '#8F5E3F',
    700: '#734A33',
    800: '#5C3B29',
    900: '#4A3022',
  },
  neutral: {
    50: '#FAF8F5',
    100: '#F3EFE9',
    200: '#E8E2D9',
    300: '#D4CCC0',
    400: '#A89F92',
    500: '#7A7268',
    600: '#5C564E',
    700: '#45403A',
    800: '#3D3832',
    900: '#2A2622',
  },
  score: {
    good: '#6B8F71',
    goodBg: '#EEF4EF',
    moderate: '#D4A24C',
    moderateBg: '#FBF4E6',
    alert: '#C45C4A',
    alertBg: '#F9EEEC',
  },
  white: '#FFFFFF',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

export const typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '600' as const },
  h1: { fontSize: 28, lineHeight: 36, fontWeight: '600' as const },
  h2: { fontSize: 22, lineHeight: 30, fontWeight: '600' as const },
  h3: { fontSize: 18, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodySm: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
} as const;

export type ScoreLevel = 'good' | 'moderate' | 'alert';

export function getScoreColor(level: ScoreLevel) {
  switch (level) {
    case 'good':
      return colors.score.good;
    case 'moderate':
      return colors.score.moderate;
    case 'alert':
      return colors.score.alert;
  }
}

export function getScoreBgColor(level: ScoreLevel) {
  switch (level) {
    case 'good':
      return colors.score.goodBg;
    case 'moderate':
      return colors.score.moderateBg;
    case 'alert':
      return colors.score.alertBg;
  }
}

export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 70) return 'good';
  if (score >= 40) return 'moderate';
  return 'alert';
}
