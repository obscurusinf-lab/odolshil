import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'accent' | 'neutral' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({ label, onPress, variant = 'accent', disabled, loading }: Props) {
  const { colors, typography, radius, spacing } = useTheme();

  const background =
    variant === 'accent' ? colors.accent : variant === 'neutral' ? colors.surfaceRaised : 'transparent';
  const textColor = variant === 'accent' ? colors.accentInk : colors.ink;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: background,
          borderRadius: radius.md,
          paddingVertical: spacing(1.5),
          paddingHorizontal: spacing(2.5),
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          borderWidth: variant === 'neutral' ? StyleSheet.hairlineWidth : 0,
          borderColor: colors.border,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[typography.bodyStrong, { color: textColor, textAlign: 'center' }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
