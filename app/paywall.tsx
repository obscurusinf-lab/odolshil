import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { useI18n } from '@/i18n';
import { useIap } from '@/iap/useIap';
import { useTheme } from '@/theme/ThemeProvider';

export default function PaywallScreen() {
  const { colors, typography, spacing } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const iap = useIap();

  useEffect(() => {
    if (iap.state.purchased) router.back();
  }, [iap.state.purchased]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={{ paddingHorizontal: spacing(3) }}>
        <Text style={[typography.title, { color: colors.ink, marginBottom: spacing(2) }]}>
          {t('paywall.title')}
        </Text>
        <Text style={[typography.body, { color: colors.inkMuted, lineHeight: 24, marginBottom: spacing(4) }]}>
          {t('paywall.body')}
        </Text>

        <PrimaryButton
          label={t('paywall.buy', { price: iap.state.priceLabel ?? '' })}
          onPress={iap.buy}
          loading={iap.state.loading}
          disabled={iap.state.unavailable}
        />

        <Pressable onPress={iap.restore} style={{ marginTop: spacing(2), alignItems: 'center' }}>
          <Text style={[typography.caption, { color: colors.ink }]}>{t('paywall.restore')}</Text>
        </Pressable>

        <Pressable onPress={() => router.back()} style={{ marginTop: spacing(3), alignItems: 'center' }}>
          <Text style={[typography.caption, { color: colors.inkFaint }]}>{t('paywall.later')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
});
