/** "840 ms" below a second, "2.4 s" below a minute, "1 m 05 s" above. */
export function formatDuration(ms: number) {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
  const m = Math.floor(ms / 60_000);
  const s = Math.round((ms % 60_000) / 1000);
  return `${m} m ${String(s).padStart(2, '0')} s`;
}

/** "12 KB", "3.4 MB". */
export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Short local time ("14:05") for a message timestamp. */
export function formatTime(date: Date) {
  return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/** Pretty-prints any value as JSON; falls back to String() for cyclic or exotic values. */
export function toJson(value: unknown) {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}
