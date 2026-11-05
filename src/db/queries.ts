import { getDb } from "./db";

export type DomainRow = {
  id: number;
  name: string;
  parent_id: number | null;
  color: string;
};

export type DayTotal = {
  rootId: number;
  name: string;
  color: string;
  seconds: number;
};

export type RangeRow = DayTotal & { entry_date: string };

export async function getDomains(): Promise<DomainRow[]> {
  const db = await getDb();
  return db.getAllAsync<DomainRow>(
    "SELECT id, name, parent_id, color FROM domains",
  );
}

export async function getEntryDates(): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ entry_date: string }>(
    "SELECT DISTINCT entry_date FROM entries",
  );
  return rows.map((r) => r.entry_date);
}

// Given a domain id, returns its top-level ancestor (itself if it's already top-level).
function makeRootResolver(domains: DomainRow[]) {
  const byId = new Map(domains.map((d) => [d.id, d]));
  return (id: number): DomainRow => {
    let cur = byId.get(id)!;
    while (cur.parent_id != null) cur = byId.get(cur.parent_id)!;
    return cur;
  };
}

// Totals per top-level domain for each day in [start, end], both inclusive.
export async function getRangeTotals(
  start: string,
  end: string,
): Promise<RangeRow[]> {
  const db = await getDb();
  const rootOf = makeRootResolver(await getDomains());

  const rows = await db.getAllAsync<{
    entry_date: string;
    topic_id: number;
    seconds: number;
  }>(
    `SELECT entry_date, topic_id, SUM(duration_seconds) AS seconds
     FROM entries WHERE entry_date BETWEEN ? AND ?
     GROUP BY entry_date, topic_id`,
    start,
    end,
  );

  const merged = new Map<string, RangeRow>();
  for (const r of rows) {
    const root = rootOf(r.topic_id);
    const key = `${r.entry_date}|${root.id}`;
    const existing = merged.get(key);
    if (existing) {
      existing.seconds += r.seconds;
    } else {
      merged.set(key, {
        entry_date: r.entry_date,
        rootId: root.id,
        name: root.name,
        color: root.color,
        seconds: r.seconds,
      });
    }
  }
  return [...merged.values()];
}

// Totals per top-level domain for one day, largest first.
export async function getDayTotals(date: string): Promise<DayTotal[]> {
  const rows = await getRangeTotals(date, date);
  return rows
    .map(({ rootId, name, color, seconds }) => ({
      rootId,
      name,
      color,
      seconds,
    }))
    .sort((a, b) => b.seconds - a.seconds);
}
