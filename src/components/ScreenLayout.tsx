import { View, Text, ScrollView, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenLayoutProps extends ViewProps {
  title?: string;
  subtitle?: string;
  scrollable?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function ScreenLayout({
  title,
  subtitle,
  scrollable = true,
  children,
  footer,
  className,
}: ScreenLayoutProps & { className?: string }) {
  const content = (
    <>
      {(title || subtitle) && (
        <View className="mb-6">
          {title && <Text className="text-h1 text-neutral-800 mb-2">{title}</Text>}
          {subtitle && <Text className="text-body text-neutral-600">{subtitle}</Text>}
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
