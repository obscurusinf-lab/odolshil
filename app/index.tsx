import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { ItemCard } from '@/components/ItemCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import { countActive, markReturned } from '@/db/items';
import { Direction, Item } from '@/db/types';
import { useActiveItems } from '@/hooks/useItemsList';
import { useI18n } from '@/i18n';
import { isPurchased } from '@/iap/purchaseFlag';
import { FREE_ACTIVE_LIMIT } from '@/constants';
import { cancelForItem } from '@/notifications';
import { useTheme } from '@/theme/ThemeProvider';
import { dayDiff } from '@/utils/date';

export default function ListScreen() {
  const { colors, typography, spacing } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const [direction, setDirection] = useState<Direction>('out');
  const { items, refresh } = useActiveItems(direction);

  const overdueCount = useMemo(
    () => items.filter((i) => i.dueAt !== null && dayDiff(Date.now(), i.dueAt) < 0).length,
    [items]
  );

  const handleReturn = useCallback(
    async (item: Item) => {
      await cancelForItem(item);
      await markReturned(item.id);
      refresh();
    },
    [refresh]
  );

  const handleAdd = useCallback(async () => {
    const [count, purchased] = await Promise.all([countActive(), isPurchased()]);
    if (!purchased && count >= FREE_ACTIVE_LIMIT) {
      router.push('/paywall');
      return;
    }
    router.push({ pathname: '/item/[id]', params: { id: 'new', direction } });
  }, [direction]);

  const emptyTitle = direction === 'out' ? t('list.empty.out.title') : t('list.empty.in.title');

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: spacing(2), paddingTop: spacing(1) }}>
        <View style={styles.headerRow}>
          <Text style={[typography.title, { color: colors.ink }]}>{t('app.name')}</Text>
          <View style={styles.headerLinks}>
            <Pressable onPress={() => router.push('/archive')} hitSlop={8}>
              <Text style={[typography.label, { color: colors.inkMuted }]}>{t('list.archiveLink')}</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/settings')} hitSlop={8} style={{ marginLeft: spacing(2.5) }}>
              <Text style={[typography.label, { color: colors.inkMuted }]}>{t('list.settingsLink')}</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ marginTop: spacing(2) }}>
          <SegmentedControl
            value={direction}
            onChange={setDirection}
            segments={[
              { value: 'out', label: t('tab.out') },
              { value: 'in', label: t('tab.in') },
            ]}
          />
        </View>
      </View>

      {items.length === 0 ? (
        <EmptyState title={emptyTitle} actionLabel={t('list.empty.action')} onAction={handleAdd} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing(2), paddingBottom: spacing(12) }}
          ListHeaderComponent={
            overdueCount > 0 ? (
              <Text
                style={[
                  typography.label,
                  { color: colors.accent, marginBottom: spacing(1) },
                ]}
              >
                {t('list.overdue')}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <ItemCard
              item={item}
              onPress={() => router.push(`/item/${item.id}`)}
              onReturn={() => handleReturn(item)}
            />
          )}
        />
      )}

      <Pressable
        onPress={handleAdd}
        style={[
          styles.fab,
          { backgroundColor: colors.accent, bottom: spacing(3) + insets.bottom, right: spacing(3) },
        ]}
      >
        <Text style={[typography.heading, { color: colors.accentInk }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
