export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogLine {
  id: string;
  /** Display timestamp, e.g. "12:04:31.118". */
  timestamp: string;
  level: LogLevel;
  message: string;
  /** Emitting component, e.g. "worker-2". */
  source?: string;
}

const MESSAGES: Array<[LogLevel, string, string]> = [
  ['info', 'api', 'GET /v1/projects 200 in 42ms'],
  ['debug', 'worker-1', 'job 8f2c picked from queue "default"'],
  ['info', 'worker-1', 'job 8f2c completed in 1.2s'],
  ['warn', 'api', 'slow query on deployments (812ms)'],
  ['info', 'scheduler', 'next run of nightly-export at 02:00 UTC'],
  ['error', 'worker-2', 'job 91ab failed: connection reset by peer'],
  ['info', 'api', 'POST /v1/deployments 201 in 118ms'],
  ['debug', 'cache', 'evicted 128 entries (lru)'],
  ['warn', 'worker-2', 'retrying job 91ab (attempt 2 of 3)'],
  ['info', 'worker-2', 'job 91ab completed in 3.4s'],
];

function pad(n: number, width = 2) {
  return String(n).padStart(width, '0');
}

/** Deterministic sample stream of `count` lines (neutral service logs). */
export function makeLogLines(count = 480, startSecond = 12 * 3600): LogLine[] {
  return Array.from({ length: count }, (_, i) => {
    const entry = MESSAGES[i % MESSAGES.length] ?? MESSAGES[0]!;
    const t = startSecond + i * 0.37;
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    const ms = Math.floor((t % 1) * 1000);
    return {
      id: `log-${i}`,
      timestamp: `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`,
      level: entry[0],
      source: entry[1],
      message: entry[2],
    };
  });
}

export const logLines: LogLine[] = makeLogLines();
