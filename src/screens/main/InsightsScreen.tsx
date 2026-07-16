import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card, ScoreRing, AlertBanner } from '../../components/ui';
import { strings } from '../../constants/strings';

export function InsightsScreen() {
  return (
    <ScreenLayout title={strings.insights.title} subtitle={strings.insights.subtitle}>
      <Card variant="outlined" className="items-center py-8 mb-4">
        <ScoreRing score={72} size={100} />
        <Text className="text-body-sm text-neutral-500 text-center mt-4 px-2">
          {strings.insights.empty}
        </Text>
      </Card>

      <AlertBanner
        tier="may_contain"
        title="Design system preview"
        message="Alert banners always pair icon + text — never color alone."
      />
    </ScreenLayout>
  );
}
