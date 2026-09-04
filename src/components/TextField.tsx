import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

interface Props extends TextInputProps {
  label: string;
  error?: string | null;
}

export function TextField({ label, error, style, ...rest }: Props) {
  const { colors, typography, radius, spacing } = useTheme();

  return (
    <View style={{ marginBottom: spacing(2) }}>
      <Text style={[typography.label, { color: colors.inkMuted, marginBottom: spacing(0.75) }]}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.inkFaint}
        style={[
          typography.body,
          styles.input,
          {
            color: colors.ink,
            backgroundColor: colors.surface,
            borderColor: error ? colors.accent : colors.border,
            borderRadius: radius.sm,
            paddingHorizontal: spacing(1.5),
            paddingVertical: spacing(1.25),
          },
          style,
        ]}
        {...rest}
      />
      {error ? (
        <Text style={[typography.caption, { color: colors.accent, marginTop: spacing(0.5) }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
