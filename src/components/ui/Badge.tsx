import { View, Text } from 'react-native';
import type { ScoreLevel } from '../../constants/theme';

type BadgeVariant = 'default' | 'good' | 'moderate' | 'alert' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, { container: string; text: string }> = {
  default: { container: 'bg-neutral-100', text: 'text-neutral-700' },
  good: { container: 'bg-score-good-bg', text: 'text-score-good' },
  moderate: { container: 'bg-score-moderate-bg', text: 'text-score-moderate' },
  alert: { container: 'bg-score-alert-bg', text: 'text-score-alert' },
  info: { container: 'bg-accent-50', text: 'text-accent-700' },
};

export function Badge({ label, variant = 'default', icon }: BadgeProps) {
  const styles = variantClasses[variant];

  return (
    <View
      accessibilityRole="text"
      className={[
        'flex-row items-center self-start rounded-full px-3 py-1.5',
        styles.container,
      ].join(' ')}
    >
      {icon}
      <Text className={['text-caption font-medium', styles.text, icon ? 'ml-1.5' : ''].join(' ')}>
        {label}
      </Text>
    </View>
  );
}

export function scoreLevelToBadgeVariant(level: ScoreLevel): BadgeVariant {
  return level;
}
