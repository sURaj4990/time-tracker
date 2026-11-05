import { getDb } from "./db";
import { getDomains } from "./queries";

export const PALETTE = [
  "#4F46E5",
  "#0EA5E9",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#8B5CF6",
  "#14B8A6",
];

// True if this domain, or any topic under it, has logged time.
export async function hasEntriesUnder(id: number): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>(
    `WITH RECURSIVE sub(id) AS (
       SELECT ?
       UNION ALL
       SELECT d.id FROM domains d JOIN sub ON d.parent_id = sub.id
     )
     SELECT COUNT(*) AS c FROM entries WHERE topic_id IN (SELECT id FROM sub)`,
    id,
  );
  return (row?.c ?? 0) > 0;
}

// True if time is logged directly to this domain.
export async function hasDirectEntries(id: number): Promise<boolean> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) AS c FROM entries WHERE topic_id = ?",
    id,
  );
  return (row?.c ?? 0) > 0;
}

export async function addDomain(
  name: string,
  parentId: number | null,
  color: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT INTO domains (name, parent_id, color) VALUES (?, ?, ?)",
    name.trim(),
    parentId,
    color,
  );
}

export async function renameDomain(id: number, name: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE domains SET name = ? WHERE id = ?",
    name.trim(),
    id,
  );
}

// Deletes the domain and its topics. Callers must check hasEntriesUnder first.
export async function deleteDomain(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM domains WHERE id = ?", id);
}

// Throws if a sibling with the same name already exists. Pass excludeId when renaming.
export async function assertUniqueName(
  parentId: number | null,
  name: string,
  excludeId?: number,
): Promise<void> {
  const trimmed = name.trim().toLowerCase();
  const clash = (await getDomains()).some(
    (d) =>
      d.parent_id === parentId &&
      d.id !== excludeId &&
      d.name.toLowerCase() === trimmed,
  );
  if (clash) throw new Error(`"${name.trim()}" already exists here.`);
}
