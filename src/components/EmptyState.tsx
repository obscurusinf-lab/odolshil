import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  title: string;
  actionLabel: string;
  onAction: () => void;
}

export function EmptyState({ title, actionLabel, onAction }: Props) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[typography.heading, { color: colors.ink, textAlign: 'center', marginBottom: spacing(3) }]}>
        {title}
      </Text>
      <PrimaryButton label={actionLabel} onPress={onAction} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
});
