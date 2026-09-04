import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Item } from '@/db/types';
import { useI18n } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { dayDiff } from '@/utils/date';
import { OwlMascot, stageFromDaysOverdue } from './OwlMascot';

interface Props {
  item: Item;
  onPress: () => void;
  onReturn: () => void;
}

export function ItemCard({ item, onPress, onReturn }: Props) {
  const { colors, typography, radius, spacing } = useTheme();
  const { t } = useI18n();
  const swipeRef = useRef<SwipeableMethods>(null);

  const diff = item.dueAt === null ? null : dayDiff(Date.now(), item.dueAt);
  const overdue = diff !== null && diff < 0;
  const owlStage = overdue ? stageFromDaysOverdue(Math.abs(diff!)) : 0;

  const dueLabel =
    diff === null
      ? null
      : diff === 0
        ? t('list.due.today')
        : diff === 1
          ? t('list.due.tomorrow')
          : diff < 0
            ? t('list.due.overdueBy', { days: Math.abs(diff) })
            : t('list.due.in', { days: diff });

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

  const showAmount = item.kind === 'money' && item.amount !== null;

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
          <Text style={[typography.bodyStrong, { color: colors.ink, flex: 1, minWidth: 0 }]}>
            {item.title}
          </Text>
          {dueLabel !== null ? (
            <View style={styles.status}>
              <OwlMascot stage={owlStage} size={26} />
              <Text
                style={[
                  typography.caption,
                  styles.dueText,
                  { color: overdue ? colors.dangerText : colors.ink },
                ]}
              >
                {dueLabel}
              </Text>
            </View>
          ) : null}
        </View>
        <View style={[styles.row, { marginTop: spacing(0.75) }]}>
          <Text style={[typography.caption, { color: colors.inkMuted, flex: 1 }]} numberOfLines={1}>
            {item.person}
            {dueLabel === null ? ` · ${t('list.due.noDate')}` : ''}
          </Text>
          {showAmount ? (
            <Text style={[typography.numeric, { color: colors.ink }]}>
              {t('list.moneyAmount', { amount: item.amount!, currency: item.currency ?? '' })}
            </Text>
          ) : null}
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
    gap: 10,
  },
  status: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueText: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  action: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginLeft: 8,
  },
});
