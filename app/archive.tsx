import { router } from 'expo-router';
import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { restoreItem } from '@/db/items';
import { Item } from '@/db/types';
import { useArchiveItems } from '@/hooks/useItemsList';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { formatShortDate } from '@/utils/date';

export default function ArchiveScreen() {
  const { colors, typography, radius, spacing } = useTheme();
  const { t, language } = useI18n();
  const insets = useSafeAreaInsets();
  const { items, refresh } = useArchiveItems();

  const handleRestore = useCallback(
    async (item: Item) => {
      await restoreItem(item.id);
      refresh();
    },
    [refresh]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { paddingHorizontal: spacing(2) }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={[typography.body, { color: colors.inkMuted }]}>{t('form.cancel')}</Text>
        </Pressable>
        <Text style={[typography.heading, { color: colors.ink }]}>{t('archive.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[typography.body, { color: colors.inkMuted, textAlign: 'center' }]}>
            {t('archive.empty')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing(2) }}
          renderItem={({ item }) => (
            <View
              style={[
                styles.row,
                { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, padding: spacing(2) },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyStrong, { color: colors.ink }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[typography.caption, { color: colors.inkMuted }]} numberOfLines={1}>
                  {item.person}
                </Text>
                {item.returnedAt ? (
                  <Text style={[typography.caption, { color: colors.inkFaint, marginTop: 2 }]}>
                    {t('archive.returnedOn', { date: formatShortDate(item.returnedAt, language) })}
                  </Text>
                ) : null}
              </View>
              <Pressable onPress={() => handleRestore(item)} hitSlop={8}>
                <Text style={[typography.caption, { color: colors.ink }]}>{t('archive.restore')}</Text>
              </Pressable>
            </View>
          )}
        />
      )}
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
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
});
