import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, getScoreColor, getScoreLevel, type ScoreLevel } from '../../constants/theme';
import { strings } from '../../constants/strings';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export function ScoreRing({
  score,
  size = 120,
  strokeWidth = 10,
  showLabel = true,
}: ScoreRingProps) {
  const level: ScoreLevel = getScoreLevel(score);
  const ringColor = getScoreColor(level);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <View
      accessibilityRole="text"
      accessibilityLabel={`${strings.components.scoreRing.label}: ${score} ${strings.components.scoreRing.outOf}`}
      className="items-center"
    >
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.neutral[200]}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${center}, ${center}`}
          />
        </Svg>
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ width: size, height: size }}
        >
          <Text className="text-h1 text-neutral-800">{score}</Text>
          {showLabel && (
            <Text className="text-caption text-neutral-500 mt-0.5">
              {strings.components.scoreRing.outOf}
            </Text>
          )}
        </View>
      </View>
      {showLabel && (
        <Text className="text-body-sm text-neutral-600 mt-2">
          {strings.components.scoreRing.label}
        </Text>
      )}
    </View>
  );
}
