import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/ui';
import { strings } from '../../constants/strings';

export function HistoryScreen() {
  return (
    <ScreenLayout title={strings.history.title} subtitle={strings.history.subtitle}>
      <Card variant="outlined" className="items-center py-10">
        <Ionicons name="time-outline" size={40} color="#D4CCC0" />
        <Text className="text-body text-neutral-500 text-center mt-4 px-4">
          {strings.history.empty}
        </Text>
      </Card>
    </ScreenLayout>
  );
}
