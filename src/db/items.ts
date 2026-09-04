import * as Crypto from 'expo-crypto';

import { getDb } from './index';
import { Direction, Item, ItemRow, NewItemInput, rowToItem } from './types';

const activeOrderClause = `
  ORDER BY
    CASE
      WHEN due_at IS NOT NULL AND due_at < ? THEN 0
      WHEN due_at IS NOT NULL THEN 1
      ELSE 2
    END,
    due_at ASC,
    created_at DESC
`;

export async function listActive(direction: Direction): Promise<Item[]> {
  const db = await getDb();
  const now = Date.now();
  const rows = await db.getAllAsync<ItemRow>(
    `SELECT * FROM items WHERE direction = ? AND returned_at IS NULL ${activeOrderClause}`,
    direction,
    now
  );
  return rows.map(rowToItem);
}

export async function listArchive(): Promise<Item[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ItemRow>(
    'SELECT * FROM items WHERE returned_at IS NOT NULL ORDER BY returned_at DESC'
  );
  return rows.map(rowToItem);
}

export async function countActive(): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM items WHERE returned_at IS NULL'
  );
  return row?.count ?? 0;
}

export async function getItem(id: string): Promise<Item | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ItemRow>('SELECT * FROM items WHERE id = ?', id);
  return row ? rowToItem(row) : null;
}

export async function createItem(input: NewItemInput): Promise<Item> {
  const db = await getDb();
  const id = Crypto.randomUUID();
  const createdAt = Date.now();
  await db.runAsync(
    `INSERT INTO items (id, title, person, direction, kind, amount, currency, photo_uri, note, created_at, due_at, returned_at, notify_at, notification_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL)`,
    id,
    input.title,
    input.person,
    input.direction,
    input.kind,
    input.amount,
    input.currency,
    input.photoUri,
    input.note,
    createdAt,
    input.dueAt
  );
  return {
    id,
    title: input.title,
    person: input.person,
    direction: input.direction,
    kind: input.kind,
    amount: input.amount,
    currency: input.currency,
    photoUri: input.photoUri,
    note: input.note,
    createdAt,
    dueAt: input.dueAt,
    returnedAt: null,
    notifyAt: null,
    notificationId: null,
  };
}

export async function updateItem(id: string, input: NewItemInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE items SET title = ?, person = ?, direction = ?, kind = ?, amount = ?, currency = ?, photo_uri = ?, note = ?, due_at = ?
     WHERE id = ?`,
    input.title,
    input.person,
    input.direction,
    input.kind,
    input.amount,
    input.currency,
    input.photoUri,
    input.note,
    input.dueAt,
    id
  );
}

export async function setNotification(
  id: string,
  notifyAt: number | null,
  notificationId: string | null
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE items SET notify_at = ?, notification_id = ? WHERE id = ?',
    notifyAt,
    notificationId,
    id
  );
}

export async function markReturned(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE items SET returned_at = ? WHERE id = ?', Date.now(), id);
}

export async function restoreItem(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE items SET returned_at = NULL WHERE id = ?', id);
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM items WHERE id = ?', id);
}

export async function listAllWithNotifications(): Promise<Item[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ItemRow>(
    'SELECT * FROM items WHERE notification_id IS NOT NULL AND returned_at IS NULL'
  );
  return rows.map(rowToItem);
}
