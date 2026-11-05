import { getDb } from "./db";

type Source = "timer" | "pomodoro" | "manual";

export async function insertEntry(params: {
  topicId: number;
  durationSeconds: number;
  startedAt: Date;
  source: Source;
  note?: string;
}): Promise<void> {
  const db = await getDb();
  const d = params.startedAt;
  const pad = (n: number) => String(n).padStart(2, "0");
  // Local date, not UTC, so days match what the user sees on their phone
  const entryDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  await db.runAsync(
    `INSERT INTO entries (topic_id, duration_seconds, started_at, entry_date, source, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    params.topicId,
    params.durationSeconds,
    d.toISOString(),
    entryDate,
    params.source,
    params.note ?? null,
  );
}

export async function clearDay(date: string): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM entries WHERE entry_date = ?", date);
}
