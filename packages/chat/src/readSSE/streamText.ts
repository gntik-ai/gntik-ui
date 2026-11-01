/** A fetch `Response` or the byte stream of one (`response.body`). */
export type StreamSource = Response | ReadableStream<Uint8Array>;

/** Default for `maxBufferSize`: pending characters allowed before a RangeError. */
export const DEFAULT_MAX_BUFFER_SIZE = 1_048_576;

const noop = () => {};

function bodyOf(source: StreamSource): ReadableStream<Uint8Array> {
  if ('getReader' in source) return source;
  if (source.body === null) throw new TypeError('The response has no body to read.');
  return source.body;
}

/**
 * Decoded text chunks of a byte stream. Owns the reader: it is cancelled exactly once when the
 * signal aborts, the consumer stops early or the stream fails, and only released when the stream ends.
 * Uses `getReader()` because `ReadableStream` is not async iterable in every browser.
 */
export async function* streamText(source: StreamSource, signal?: AbortSignal): AsyncGenerator<string> {
  const reader = bodyOf(source).getReader();
  const decoder = new TextDecoder();
  let ended = false;
  let cancelled = false;
  let interrupt: ((reason: unknown) => void) | undefined;

  const cancel = (reason?: unknown) => {
    if (cancelled) return;
    cancelled = true;
    try {
      Promise.resolve(reader.cancel(reason)).catch(noop);
    } catch {
      // A reader that cannot be cancelled has nothing left to release.
    }
  };
  const read = () =>
    new Promise<ReadableStreamReadResult<Uint8Array>>((resolve, reject) => {
      interrupt = reject;
      reader.read().then(resolve, reject);
    });
  const onAbort = () => {
    cancel(signal?.reason);
    interrupt?.(signal?.reason);
  };
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    for (;;) {
      if (signal?.aborted) throw signal.reason;
      const result = await read();
      if (signal?.aborted) throw signal.reason;
      if (result.done) {
        ended = true;
        break;
      }
      const text = decoder.decode(result.value, { stream: true });
      if (text) yield text;
    }
    const rest = decoder.decode();
    if (rest) yield rest;
  } finally {
    signal?.removeEventListener('abort', onAbort);
    if (!ended) cancel();
    try {
      reader.releaseLock();
    } catch {
      // Already released, or the reader is not lockable.
    }
  }
}
