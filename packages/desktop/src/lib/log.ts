// packages/desktop/src/lib/log.ts

export type LogLevel = "debug" | "info" | "error";

export interface LogEntry {
  ts: number;
  level: LogLevel;
  source: string;
  message: string;
}

const MAX_ENTRIES = 500;
let entries: LogEntry[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function log(level: LogLevel, source: string, message: string) {
  entries = [...entries.slice(-(MAX_ENTRIES - 1)), { ts: Date.now(), level, source, message }];
  emit();
}

export function getLogs(): LogEntry[] {
  return entries;
}

export function clearLogs() {
  entries = [];
  emit();
}

export function subscribeLogs(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
