import type { ChatChunk } from './types';

/** Cancels readers and detaches stalled iterators even when a custom adapter ignores its signal. */
export async function* chunksFrom(
  source: ReadableStream<ChatChunk> | AsyncIterable<ChatChunk>,
  signal: AbortSignal,
): AsyncGenerator<ChatChunk> {
  const reader = 'getReader' in source ? source.getReader() : undefined;
  const iterator = reader ? undefined : (source as AsyncIterable<ChatChunk>)[Symbol.asyncIterator]();
  let abort: () => void = () => {};
  const aborted = new Promise<never>((_, reject) => {
    abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
  });
  // An already aborted signal must still have its rejection observed by the race.
  if (signal.aborted) abort();
  let completed = false;
  try {
    while (true) {
      const result = await Promise.race([reader ? reader.read() : iterator!.next(), aborted]);
      if (result.done) {
        completed = true;
        return;
      }
      signal.throwIfAborted();
      yield result.value;
    }
  } finally {
    signal.removeEventListener('abort', abort);
    if (reader) {
      if (!completed) await reader.cancel().catch(() => {});
      reader.releaseLock();
    } else if (!completed) {
      void iterator?.return?.().catch(() => {});
    }
  }
}
