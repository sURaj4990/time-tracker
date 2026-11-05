import { getDb } from "./db";

export type Topic = {
  id: number;
  name: string;
  parentName: string | null;
  color: string;
};

// Every domain and subtopic, grouped by domain, with domains listed before their subtopics.
export async function getTopics(): Promise<Topic[]> {
  const db = await getDb();
  return db.getAllAsync<Topic>(`
    SELECT d.id, d.name, p.name AS parentName, d.color
    FROM domains d
    LEFT JOIN domains p ON p.id = d.parent_id
    ORDER BY COALESCE(p.name, d.name), d.parent_id IS NOT NULL, d.name
  `);
}
