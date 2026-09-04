import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

export default function PrivacyScreen() {
  const { colors, typography, spacing } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: spacing(2) }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={[typography.body, { color: colors.inkMuted }]}>{t('form.cancel')}</Text>
        </Pressable>
        <Text style={[typography.heading, { color: colors.ink }]}>{t('privacy.title')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing(2) }}>
        <Text style={[typography.body, { color: colors.ink, lineHeight: 24 }]}>{t('privacy.body')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
});
