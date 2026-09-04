export type Direction = 'out' | 'in';
export type Kind = 'thing' | 'money';

export interface Item {
  id: string;
  title: string;
  person: string;
  direction: Direction;
  kind: Kind;
  amount: number | null;
  currency: string | null;
  photoUri: string | null;
  note: string | null;
  createdAt: number;
  dueAt: number | null;
  returnedAt: number | null;
  notifyAt: number | null;
  notificationId: string | null;
}

export interface ItemRow {
  id: string;
  title: string;
  person: string;
  direction: string;
  kind: string;
  amount: number | null;
  currency: string | null;
  photo_uri: string | null;
  note: string | null;
  created_at: number;
  due_at: number | null;
  returned_at: number | null;
  notify_at: number | null;
  notification_id: string | null;
}

export function rowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    title: row.title,
    person: row.person,
    direction: row.direction as Direction,
    kind: row.kind as Kind,
    amount: row.amount,
    currency: row.currency,
    photoUri: row.photo_uri,
    note: row.note,
    createdAt: row.created_at,
    dueAt: row.due_at,
    returnedAt: row.returned_at,
    notifyAt: row.notify_at,
    notificationId: row.notification_id,
  };
}

export interface NewItemInput {
  title: string;
  person: string;
  direction: Direction;
  kind: Kind;
  amount: number | null;
  currency: string | null;
  photoUri: string | null;
  note: string | null;
  dueAt: number | null;
}
