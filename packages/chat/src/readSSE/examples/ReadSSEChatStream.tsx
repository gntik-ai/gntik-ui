import { Button } from '@gntik-ai/ui';
import { useEffect, useRef, useState } from 'react';
import { readSSE } from '../readSSE';

// Stands in for fetch(url) so the example runs without a backend; in an app, pass the real response.
const encoder = new TextEncoder();

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

// What an OpenAI-style endpoint sends: JSON deltas, then a plain [DONE] the caller stops on.
const REPLY = ['The ', 'deployment ', 'finished ', 'without ', 'errors.'].map(
  (delta) => `data: ${JSON.stringify({ delta })}\n\n`,
);
const BODY = [': keep-alive\n\n', ...REPLY, 'data: [DONE]\n\n'];

const STATUS = {
  idle: 'Ready.',
  streaming: 'Streaming…',
  done: 'Done.',
  stopped: 'Stopped.',
  error: 'The stream failed.',
} as const;

/** Reads a chat reply token by token, with a Stop button wired to the same AbortController. */
export default function ReadSSEChatStream() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<keyof typeof STATUS>('idle');
  const controllerRef = useRef<AbortController | null>(null);
  useEffect(() => () => controllerRef.current?.abort(), []);

  async function send() {
    const controller = new AbortController();
    controllerRef.current = controller;
    setText('');
    setStatus('streaming');
    try {
      // In an app: const response = await fetch('/api/chat', { method: 'POST', body, signal: controller.signal });
      const response = fakeStreamResponse(BODY);
      for await (const message of readSSE(response, { signal: controller.signal })) {
        if (message.data === '[DONE]') break;
        const { delta } = JSON.parse(message.data) as { delta: string };
        setText((current) => current + delta);
      }
      setStatus('done');
    } catch {
      setStatus(controller.signal.aborted ? 'stopped' : 'error');
    }
  }

  const streaming = status === 'streaming';
  return (
    <div className="flex max-w-xl flex-col gap-3">
      <div className="flex gap-2">
        <Button onClick={send} disabled={streaming}>
          Send
        </Button>
        <Button variant="secondary" onClick={() => controllerRef.current?.abort()} disabled={!streaming}>
          Stop
        </Button>
      </div>
      <p className="min-h-6 text-foreground" aria-busy={streaming}>
        {text}
      </p>
      <p role="status" className="text-sm text-muted-foreground">
        {STATUS[status]}
      </p>
    </div>
  );
}
