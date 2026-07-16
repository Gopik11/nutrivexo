import { Pressable, Text, View } from 'react-native';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function SelectableChip({ label, selected, onPress }: SelectableChipProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      className={[
        'rounded-full px-4 py-2.5 mr-2 mb-2 border',
        selected ? 'bg-accent-100 border-accent-400' : 'bg-white border-neutral-200',
      ].join(' ')}
    >
      <Text
        className={[
          'text-body-sm font-medium',
          selected ? 'text-accent-800' : 'text-neutral-700',
        ].join(' ')}
      >
        {label}
      </Text>
    </Pressable>
  );
}

interface ChipSectionProps {
  title: string;
  subtitle?: string;
  options: readonly string[];
  selected: string[];
  onToggle: (item: string) => void;
  singleSelect?: boolean;
}

export function ChipSection({
  title,
  subtitle,
  options,
  selected,
  onToggle,
  singleSelect = false,
}: ChipSectionProps) {
  const handlePress = (item: string) => {
    if (singleSelect && selected.includes(item)) {
      return;
    }
    onToggle(item);
  };

  return (
    <View className="mb-6">
      <Text className="text-h3 text-neutral-800 mb-1">{title}</Text>
      {subtitle && <Text className="text-body-sm text-neutral-500 mb-3">{subtitle}</Text>}
      <View className="flex-row flex-wrap">
        {options.map((option) => (
          <SelectableChip
            key={option}
            label={option}
            selected={selected.includes(option)}
            onPress={() => handlePress(option)}
          />
        ))}
      </View>
    </View>
  );
}
