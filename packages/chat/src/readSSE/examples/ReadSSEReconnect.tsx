import { Button } from '@gntik-ai/ui';
import { useEffect, useRef, useState } from 'react';
import { readSSE } from '../readSSE';

// Stands in for fetch(url) so the example runs without a backend; in an app, pass the real response.
const encoder = new TextEncoder();

/** Resolves after `ms`, or rejects with the signal's reason when it aborts first. */
function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Stands in for `fetch(url)` in the docs, so the examples need no backend: a streamed Response that
 * sends one chunk every `delayMs`, then closes, or fails with a network error when `failAfter` is set.
 */
function fakeStreamResponse(
  chunks: string[],
  { delayMs = 200, failAfter }: { delayMs?: number; failAfter?: number } = {},
) {
  let index = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      return new Promise<void>((resolve) => {
        timer = setTimeout(() => {
          if (index === failAfter) controller.error(new TypeError('network error'));
          else if (index < chunks.length) controller.enqueue(encoder.encode(chunks[index++]));
          else controller.close();
          resolve();
        }, delayMs);
      });
    },
    cancel() {
      clearTimeout(timer);
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
}

const event = (id: number) => `id: ${id}\nevent: tick\ndata: update ${id}\n\n`;

/** A server whose first connection drops after two events; it resumes from Last-Event-ID. */
function connect(lastEventId: string, attempt: number) {
  const next = lastEventId === '' ? 1 : Number(lastEventId) + 1;
  const events = [event(next), event(next + 1)];
  return fakeStreamResponse(attempt === 1 ? ['retry: 300\n\n', ...events] : events, {
    failAfter: attempt === 1 ? 3 : undefined,
  });
}

/** readSSE reports id and retry; the reconnect loop is the caller's, so it can add backoff and auth. */
export default function ReadSSEReconnect() {
  const [received, setReceived] = useState<string[]>([]);
  const [connections, setConnections] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);

  async function start() {
    const controller = new AbortController();
    controllerRef.current = controller;
    const { signal } = controller;
    setReceived([]);
    setConnections([]);
    setRunning(true);
    let lastEventId = '';
    let retryMs = 1000;
    try {
      for (let attempt = 1; ; attempt++) {
        setConnections((current) => [
          ...current,
          lastEventId === '' ? 'Connect' : `Reconnect with Last-Event-ID: ${lastEventId}`,
        ]);
        try {
          // In an app: fetch(url, { signal, headers: lastEventId ? { 'Last-Event-ID': lastEventId } : {} })
          for await (const message of readSSE(connect(lastEventId, attempt), { signal })) {
            lastEventId = message.id;
            if (message.retry !== undefined) retryMs = message.retry;
            setReceived((current) => [...current, message.data]);
          }
          break; // The server closed the stream cleanly: done.
        } catch (error) {
          if (signal.aborted) throw error;
          await wait(retryMs, signal);
        }
      }
    } catch {
      // Aborted by the Stop button.
    }
    setRunning(false);
  }

  return (
    <div className="flex max-w-xl flex-col gap-3">
      <div className="flex gap-2">
        <Button onClick={start} disabled={running}>
          Start
        </Button>
        <Button variant="secondary" onClick={() => controllerRef.current?.abort()} disabled={!running}>
          Stop
        </Button>
      </div>
      <ol className="list-decimal ps-5 text-sm" aria-label="Connections">
        {connections.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ol>
      <ul className="list-disc ps-5 text-sm" aria-label="Received messages">
        {received.map((entry, index) => (
          <li key={index}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}
