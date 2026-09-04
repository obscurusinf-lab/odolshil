import { SQLiteDatabase } from 'expo-sqlite';

type Migration = (db: SQLiteDatabase) => Promise<void>;

/**
 * Каждая миграция применяется ровно один раз, по номеру в массиве
 * (индекс 0 → версия 1, и так далее). Ничего не переписывать задним
 * числом — новые изменения схемы добавляются новой миграцией в конец.
 */
const migrations: Migration[] = [
  async (db) => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        person TEXT NOT NULL,
        direction TEXT NOT NULL,
        kind TEXT NOT NULL,
        amount REAL,
        currency TEXT,
        photo_uri TEXT,
        note TEXT,
        created_at INTEGER NOT NULL,
        due_at INTEGER,
        returned_at INTEGER,
        notify_at INTEGER,
        notification_id TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_items_direction ON items(direction);
      CREATE INDEX IF NOT EXISTS idx_items_returned_at ON items(returned_at);
      CREATE INDEX IF NOT EXISTS idx_items_due_at ON items(due_at);

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT
      );
    `);
  },
];

export async function migrate(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_version (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      version INTEGER NOT NULL
    );
  `);

  const row = await db.getFirstAsync<{ version: number }>(
    'SELECT version FROM schema_version WHERE id = 1'
  );
  let currentVersion = row?.version ?? 0;

  for (let i = currentVersion; i < migrations.length; i++) {
    await db.withTransactionAsync(async () => {
      await migrations[i](db);
      currentVersion = i + 1;
      await db.runAsync(
        'INSERT INTO schema_version (id, version) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET version = excluded.version',
        currentVersion
      );
    });
  }
}
