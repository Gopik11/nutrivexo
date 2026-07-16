import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AllergenTier } from '../../types';
import { strings } from '../../constants/strings';

interface AlertBannerProps {
  tier: AllergenTier;
  title: string;
  message: string;
}

const tierConfig: Record<
  AllergenTier,
  {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    containerClass: string;
    iconColor: string;
    titleClass: string;
    messageClass: string;
  }
> = {
  contains: {
    label: strings.components.alertBanner.contains,
    icon: 'warning',
    containerClass: 'bg-score-alert-bg border-score-alert',
    iconColor: '#C45C4A',
    titleClass: 'text-score-alert',
    messageClass: 'text-neutral-700',
  },
  may_contain: {
    label: strings.components.alertBanner.mayContain,
    icon: 'alert-circle',
    containerClass: 'bg-score-moderate-bg border-score-moderate',
    iconColor: '#D4A24C',
    titleClass: 'text-score-moderate',
    messageClass: 'text-neutral-700',
  },
  cross_reactive: {
    label: strings.components.alertBanner.crossReactive,
    icon: 'information-circle',
    containerClass: 'bg-accent-50 border-accent-300',
    iconColor: '#A8734F',
    titleClass: 'text-accent-700',
    messageClass: 'text-neutral-700',
  },
};

export function AlertBanner({ tier, title, message }: AlertBannerProps) {
  const config = tierConfig[tier];

  return (
    <View
      accessibilityRole="alert"
      accessibilityLabel={`${config.label}: ${title}. ${message}`}
      className={['rounded-lg border p-4 flex-row', config.containerClass].join(' ')}
    >
      <Ionicons name={config.icon} size={22} color={config.iconColor} style={{ marginTop: 2 }} />
      <View className="flex-1 ml-3">
        <View className="flex-row items-center mb-1">
          <Text className={['text-caption font-semibold uppercase tracking-wide', config.titleClass].join(' ')}>
            {config.label}
          </Text>
        </View>
        <Text className={['text-body font-semibold text-neutral-800 mb-1'].join(' ')}>{title}</Text>
        <Text className={['text-body-sm', config.messageClass].join(' ')}>{message}</Text>
      </View>
    </View>
  );
}
