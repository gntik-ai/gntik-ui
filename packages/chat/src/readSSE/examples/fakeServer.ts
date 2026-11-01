const encoder = new TextEncoder();

/** Resolves after `ms`, or rejects with the signal's reason when it aborts first. */
export function wait(ms: number, signal: AbortSignal): Promise<void> {
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
export function fakeStreamResponse(
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
