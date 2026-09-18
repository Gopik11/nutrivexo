import { View, Text, ScrollView, Pressable, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface ScreenLayoutProps extends ViewProps {
  title?: string;
  subtitle?: string;
  scrollable?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
  headerRight?: React.ReactNode;
}

export function ScreenLayout({
  title,
  subtitle,
  scrollable = true,
  children,
  footer,
  onBack,
  headerRight,
  className,
}: ScreenLayoutProps & { className?: string }) {
  const content = (
    <>
      {onBack && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
          className="flex-row items-center mb-4 -ml-2 self-start px-2 py-1"
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={22} color="#A8734F" />
          <Text className="text-body text-accent-600 font-medium ml-0.5">Back</Text>
        </Pressable>
      )}
      {(title || subtitle || headerRight) && (
        <View className="mb-6 flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            {title && <Text className="text-h1 text-neutral-800 mb-2">{title}</Text>}
            {subtitle && <Text className="text-body text-neutral-600">{subtitle}</Text>}
          </View>
          {headerRight}
        </View>
      )}
      {children}
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <View className={['flex-1', className ?? ''].join(' ')}>
        {scrollable ? (
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pt-4 pb-8"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          <View className="flex-1 px-5 pt-4">{content}</View>
        )}
        {footer && <View className="px-5 pb-6 pt-2 bg-neutral-50">{footer}</View>}
      </View>
    </SafeAreaView>
  );
}
