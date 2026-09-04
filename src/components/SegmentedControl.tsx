import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

interface Segment<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ segments, value, onChange }: Props<T>) {
  const { colors, typography, radius, spacing } = useTheme();

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: colors.surface, borderRadius: radius.md, borderColor: colors.border },
      ]}
    >
      {segments.map((segment) => {
        const active = segment.value === value;
        return (
          <Pressable
            key={segment.value}
            onPress={() => onChange(segment.value)}
            style={[
              styles.segment,
              {
                paddingVertical: spacing(1),
                borderRadius: radius.sm,
                backgroundColor: active ? colors.surfaceRaised : 'transparent',
              },
            ]}
          >
            <Text
              style={[
                typography.bodyStrong,
                { color: active ? colors.ink : colors.inkMuted, textAlign: 'center' },
              ]}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
  },
  segment: {
    flex: 1,
  },
});
