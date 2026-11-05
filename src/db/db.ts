import * as SQLite from "expo-sqlite";
import { SCHEMA } from "./schema";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Caches the promise, not the result, so concurrent callers share one open.
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync("timetracker.db");
      await db.execAsync("PRAGMA foreign_keys = ON;");
      await db.execAsync(SCHEMA);
      return db;
    })().catch((err) => {
      dbPromise = null; // allow a retry if opening failed
      throw err;
    });
  }
  return dbPromise;
}
