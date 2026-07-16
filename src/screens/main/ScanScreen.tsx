import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { strings } from '../../constants/strings';

export function ScanScreen() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <View className="flex-1 px-5 justify-between">
        <View className="pt-4">
          <Text className="text-h2 text-white mb-1">{strings.scan.title}</Text>
          <Text className="text-body-sm text-neutral-300">{strings.scan.subtitle}</Text>
        </View>

        <View className="flex-1 items-center justify-center my-6">
          <View className="w-full aspect-[3/4] max-h-[420px] border-2 border-dashed border-neutral-600 rounded-xl items-center justify-center px-6">
            <Ionicons name="scan-outline" size={48} color="#A89F92" />
            <Text className="text-body text-neutral-400 text-center mt-4">
              {strings.scan.placeholder}
            </Text>
          </View>
        </View>

        <View className="items-center pb-6">
          <View
            accessibilityRole="button"
            accessibilityLabel="Capture label photo"
            className="w-16 h-16 rounded-full bg-accent-500 items-center justify-center"
          >
            <Ionicons name="camera" size={28} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
