import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent-500 active:bg-accent-600',
  secondary: 'bg-neutral-100 active:bg-neutral-200 border border-neutral-200',
  ghost: 'bg-transparent active:bg-neutral-100',
  danger: 'bg-score-alert active:opacity-90',
};

const textVariantClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-neutral-800',
  ghost: 'text-accent-600',
  danger: 'text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 rounded-md',
  md: 'px-6 py-3.5 rounded-lg',
  lg: 'px-8 py-4 rounded-lg',
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-body-sm',
  md: 'text-body',
  lg: 'text-body',
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  ...props
}: ButtonProps & { className?: string }) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={isDisabled}
      className={[
        'items-center justify-center flex-row',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-50' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' || variant === 'ghost' ? '#A8734F' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <Text
          className={[
            'font-semibold',
            textVariantClasses[variant],
            textSizeClasses[size],
          ].join(' ')}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
