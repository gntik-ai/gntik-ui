import { Button } from '@gntik-ai/ui';
import { useEffect, useRef, useState } from 'react';
import { readTextParts } from '../readSSE';
import { fakeStreamResponse } from './fakeServer';

interface LogLine {
  level: 'info' | 'warn' | 'error';
  msg: string;
}

// NDJSON: one JSON document per line. The second line arrives split across two chunks.
const CHUNKS = [
  '{"level":"info","msg":"Build started"}\n',
  '{"level":"info","msg":"Insta',
  'lling dependencies"}\n{"level":"warn","msg":"Cache miss"}\n\n',
  '{"level":"info","msg":"Build finished"}\n',
];

const MAX_LINES = 6;

/** Tails an NDJSON log with readTextParts: one string per line, mapped with JSON.parse in the loop. */
export default function ReadTextPartsLogTail() {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [tailing, setTailing] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);

  async function tail() {
    const controller = new AbortController();
    controllerRef.current = controller;
    setLines([]);
    setTailing(true);
    try {
      const response = fakeStreamResponse(CHUNKS, { delayMs: 300 });
      for await (const part of readTextParts(response, { signal: controller.signal })) {
        const line = JSON.parse(part) as LogLine;
        setLines((current) => [...current, line].slice(-MAX_LINES));
      }
    } catch {
      // Aborted by the Stop button: the lines read so far stay on screen.
    }
    setTailing(false);
  }

  return (
    <div className="flex max-w-xl flex-col gap-3">
      <div className="flex gap-2">
        <Button onClick={tail} disabled={tailing}>
          Tail log
        </Button>
        <Button variant="secondary" onClick={() => controllerRef.current?.abort()} disabled={!tailing}>
          Stop
        </Button>
      </div>
      <div
        role="log"
        aria-label="Build log"
        className="min-h-24 rounded-md border border-border bg-card p-3 font-mono text-sm text-card-foreground"
      >
        {lines.map((line, index) => (
          <p key={index}>
            <span className="text-muted-foreground">[{line.level}]</span> {line.msg}
          </p>
        ))}
      </div>
    </div>
  );
}
