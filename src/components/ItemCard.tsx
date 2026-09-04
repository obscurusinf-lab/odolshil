import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Item } from '@/db/types';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { dayDiff } from '@/utils/date';

interface Props {
  item: Item;
  onPress: () => void;
  onReturn: () => void;
}

export function ItemCard({ item, onPress, onReturn }: Props) {
  const { colors, typography, radius, spacing } = useTheme();
  const { t, language } = useI18n();
  const swipeRef = useRef<SwipeableMethods>(null);

  const overdue = item.dueAt !== null && dayDiff(Date.now(), item.dueAt) < 0;

  const dueLabel = (() => {
    if (item.dueAt === null) return t('list.due.noDate');
    const diff = dayDiff(Date.now(), item.dueAt);
    if (diff === 0) return t('list.due.today');
    if (diff === 1) return t('list.due.tomorrow');
    if (diff < 0) return t('list.due.overdueBy', { days: Math.abs(diff) });
    return t('list.due.in', { days: diff });
  })();

  const renderRightActions = () => (
    <Pressable
      onPress={() => {
        swipeRef.current?.close();
        onReturn();
      }}
      style={[styles.action, { backgroundColor: colors.ink, borderRadius: radius.md }]}
    >
      <Text style={[typography.bodyStrong, { color: colors.background }]}>
        {t('list.swipe.returned')}
      </Text>
    </Pressable>
  );

  return (
    <Swipeable ref={swipeRef} renderRightActions={renderRightActions} overshootRight={false} friction={2}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing(2),
          },
        ]}
      >
        <View style={styles.row}>
          <Text style={[typography.bodyStrong, { color: colors.ink, flex: 1 }]} numberOfLines={1}>
            {item.title}
          </Text>
          {item.kind === 'money' && item.amount !== null ? (
            <Text style={[typography.numeric, { color: colors.ink }]}>
              {t('list.moneyAmount', { amount: item.amount, currency: item.currency ?? '' })}
            </Text>
          ) : null}
        </View>
        <View style={[styles.row, { marginTop: spacing(0.5) }]}>
          <Text style={[typography.caption, { color: colors.inkMuted, flex: 1 }]} numberOfLines={1}>
            {item.person}
          </Text>
          <Text
            style={[
              typography.caption,
              { color: overdue ? colors.accent : colors.inkFaint, fontWeight: overdue ? '700' : '400' },
            ]}
          >
            {dueLabel}
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginLeft: 8,
  },
});
