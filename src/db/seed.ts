import { getDb } from './db';

const DEFAULT_DOMAINS = [
  { name: 'Learning', color: '#4F46E5', children: ['Machine Learning', 'Data Science'] },
  { name: 'Work', color: '#0EA5E9', children: [] },
  { name: 'Fitness', color: '#22C55E', children: [] },
  { name: 'Reading', color: '#F59E0B', children: [] },
];

export async function seedDomains(): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM domains');
  if (row && row.c > 0) return; // already seeded

  for (const d of DEFAULT_DOMAINS) {
    const res = await db.runAsync(
      'INSERT INTO domains (name, parent_id, color) VALUES (?, NULL, ?)',
      d.name,
      d.color
    );
    for (const child of d.children) {
      await db.runAsync(
        'INSERT INTO domains (name, parent_id, color) VALUES (?, ?, ?)',
        child,
        res.lastInsertRowId,
        d.color
      );
    }
  }
}