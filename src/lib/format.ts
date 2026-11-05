const pad = (n: number) => String(n).padStart(2, "0");

// Timer display, mm:ss, from milliseconds
export function fmtClock(ms: number): string {
  const total = Math.ceil(ms / 1000);
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

// Summary display, e.g. "2h 5m" or "45m", from seconds
export function fmtDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// "Learning › Machine Learning" for subtopics, or just the name for domains
export function topicLabel(t: {
  name: string;
  parentName?: string | null;
}): string {
  return t.parentName ? `${t.parentName} › ${t.name}` : t.name;
}
