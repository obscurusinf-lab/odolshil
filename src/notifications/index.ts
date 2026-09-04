import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

import { listAllWithNotifications, setNotification } from '@/db/items';
import { Item } from '@/db/types';
import { ResolvedLanguage } from '@/i18n';
import { en, ru } from '@/i18n/translations';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export interface TimeOfDay {
  hour: number;
  minute: number;
}

export const DEFAULT_TIME_OF_DAY: TimeOfDay = { hour: 10, minute: 0 };

export async function hasNotificationPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

/** Момент уведомления: срок минус N дней, в выбранное время суток. Не раньше чем через 30 сек от сейчас. */
export function computeNotifyAt(dueAt: number, leadDays: number, time: TimeOfDay): number {
  const date = new Date(dueAt);
  date.setDate(date.getDate() - leadDays);
  date.setHours(time.hour, time.minute, 0, 0);
  const notifyAt = date.getTime();
  const floor = Date.now() + 30_000;
  return notifyAt < floor ? floor : notifyAt;
}

/**
 * Спрашивает разрешение только в момент, когда пользователь впервые ставит
 * срок — с коротким объяснением зачем, прежде чем показать системный диалог.
 */
export async function ensureNotificationPermission(
  t: (key: 'permission.notifications.title' | 'permission.notifications.body' | 'permission.notifications.allow' | 'permission.notifications.later') => string
): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;

  return new Promise((resolve) => {
    Alert.alert(t('permission.notifications.title'), t('permission.notifications.body'), [
      { text: t('permission.notifications.later'), style: 'cancel', onPress: () => resolve(false) },
      {
        text: t('permission.notifications.allow'),
        onPress: async () => {
          const result = await Notifications.requestPermissionsAsync();
          resolve(result.granted);
        },
      },
    ]);
  });
}

async function cancelScheduled(notificationId: string | null): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // уже отменено или не существует — не страшно
  }
}

/** Отменяет старое уведомление (если было) и планирует новое по due_at. Возвращает обновлённый item. */
export async function scheduleForItem(
  item: Item,
  leadDays: number,
  time: TimeOfDay,
  language: ResolvedLanguage
): Promise<Item> {
  await cancelScheduled(item.notificationId);

  if (!item.dueAt) {
    await setNotification(item.id, null, null);
    return { ...item, notifyAt: null, notificationId: null };
  }

  const granted = await hasNotificationPermission();
  if (!granted) {
    await setNotification(item.id, null, null);
    return { ...item, notifyAt: null, notificationId: null };
  }

  const notifyAt = computeNotifyAt(item.dueAt, leadDays, time);
  const dict = language === 'ru' ? ru : en;
  const titleKey = item.direction === 'out' ? 'notification.title.out' : 'notification.title.in';

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: dict[titleKey].replace('{title}', item.title),
      body: dict['notification.body'].replace('{person}', item.person),
      data: { itemId: item.id },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(notifyAt),
    },
  });

  await setNotification(item.id, notifyAt, notificationId);
  return { ...item, notifyAt, notificationId };
}

export async function cancelForItem(item: Item): Promise<void> {
  await cancelScheduled(item.notificationId);
  await setNotification(item.id, null, null);
}

/** При старте: отменяем висящие уведомления, за которыми больше не стоит активная запись. */
export async function reconcileNotificationsOnStartup(): Promise<void> {
  if (Platform.OS === 'web') return;

  const [scheduled, active] = await Promise.all([
    Notifications.getAllScheduledNotificationsAsync(),
    listAllWithNotifications(),
  ]);

  const activeNotificationIds = new Set(active.map((item) => item.notificationId));

  await Promise.all(
    scheduled
      .filter((notification) => !activeNotificationIds.has(notification.identifier))
      .map((notification) => cancelScheduled(notification.identifier))
  );
}
