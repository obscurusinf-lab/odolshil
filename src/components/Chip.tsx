import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
}

export function Chip({ label, active, onPress }: Props) {
  const { colors, typography, radius, spacing } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          borderRadius: radius.lg,
          borderColor: active ? colors.ink : colors.border,
          backgroundColor: active ? colors.ink : 'transparent',
          paddingHorizontal: spacing(1.5),
          paddingVertical: spacing(0.75),
        },
      ]}
    >
      <Text style={[typography.caption, { color: active ? colors.background : colors.inkMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
