import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/Chip';
import { PrimaryButton } from '@/components/PrimaryButton';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useI18n } from '@/i18n';
import { useIap } from '@/iap/useIap';
import { useTheme } from '@/theme/ThemeProvider';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ marginBottom: spacing(3) }}>
      <Text style={[typography.label, { color: colors.inkMuted, marginBottom: spacing(1) }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function SettingsScreen() {
  const { colors, typography, spacing } = useTheme();
  const { t, language, languageSetting, setLanguageSetting } = useI18n();
  const { settings, setLeadDays, setTime } = useAppSettings();
  const iap = useIap();
  const insets = useSafeAreaInsets();
  const [showTimePicker, setShowTimePicker] = useState(false);

  const timeDate = new Date();
  timeDate.setHours(settings.time.hour, settings.time.minute, 0, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: spacing(2) }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={[typography.body, { color: colors.inkMuted }]}>{t('form.cancel')}</Text>
        </Pressable>
        <Text style={[typography.heading, { color: colors.ink }]}>{t('settings.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing(2) }}>
        <Section title={t('settings.language')}>
          <View style={styles.row}>
            {(['system', 'ru', 'en'] as const).map((option) => (
              <View key={option} style={{ marginRight: spacing(1) }}>
                <Chip
                  label={t(`settings.language.${option}` as const)}
                  active={languageSetting === option}
                  onPress={() => setLanguageSetting(option)}
                />
              </View>
            ))}
          </View>
        </Section>

        <Section title={t('settings.notifyTime')}>
          <Chip
            label={timeDate.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
            active
            onPress={() => setShowTimePicker(true)}
          />
          {showTimePicker ? (
            <DateTimePicker
              value={timeDate}
              mode="time"
              onChange={(_, date) => {
                setShowTimePicker(false);
                if (date) setTime({ hour: date.getHours(), minute: date.getMinutes() });
              }}
            />
          ) : null}
        </Section>

        <Section title={t('settings.leadDays')}>
          <View style={styles.row}>
            {([0, 1, 3] as const).map((days) => (
              <View key={days} style={{ marginRight: spacing(1) }}>
                <Chip
                  label={t(`settings.leadDays.${days}` as const)}
                  active={settings.leadDays === days}
                  onPress={() => setLeadDays(days)}
                />
              </View>
            ))}
          </View>
        </Section>

        <Section title={t('settings.purchase.title')}>
          {iap.state.purchased ? (
            <Text style={[typography.body, { color: colors.ink }]}>{t('settings.purchase.active')}</Text>
          ) : (
            <View>
              <PrimaryButton
                label={t('settings.purchase.buy', { price: iap.state.priceLabel ?? '' })}
                onPress={iap.buy}
                loading={iap.state.loading}
                disabled={iap.state.unavailable}
              />
              <Pressable onPress={iap.restore} style={{ marginTop: spacing(1.5) }}>
                <Text style={[typography.caption, { color: colors.accent }]}>{t('settings.purchase.restore')}</Text>
              </Pressable>
            </View>
          )}
        </Section>

        <Section title={t('settings.about')}>
          <Pressable onPress={() => router.push('/privacy')}>
            <Text style={[typography.body, { color: colors.accent }]}>{t('settings.privacy')}</Text>
          </Pressable>
        </Section>
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
  row: { flexDirection: 'row', flexWrap: 'wrap' },
});
