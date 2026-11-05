export const SCHEMA = `
CREATE TABLE IF NOT EXISTS domains (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    parent_id   INTEGER REFERENCES domains(id) ON DELETE CASCADE,
    color       TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS entries (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id         INTEGER REFERENCES domains(id) ON DELETE CASCADE,
    duration_seconds INTEGER NOT NULL CHECK (duration_seconds > 0),
    started_at       TEXT NOT NULL,           -- ISO 8601, local time
    entry_date       TEXT NOT NULL,           -- YYYY-MM-DD, local date, for fast daily queries    
    source           TEXT NOT NULL CHECK (source IN ('timer', 'pomodoro', 'manual')),
    note             TEXT
);

CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_entries_topic ON entries(topic_id);
`;
