import { createEventStreamParser, type SSEMessage } from './eventStreamParser';
import { DEFAULT_MAX_BUFFER_SIZE, streamText, type StreamSource } from './streamText';

export type { SSEMessage } from './eventStreamParser';
export type { StreamSource } from './streamText';

export interface ReadSSEOptions {
  /** Aborting cancels the reader and makes the iterator throw `signal.reason` (an `AbortError` by default). */
  signal?: AbortSignal;
  /** Pending characters (decoded string length, not bytes) allowed in one block. Default 1,048,576. */
  maxBufferSize?: number;
}

export interface ReadTextPartsOptions extends ReadSSEOptions {
  /** Text that ends a part. Default a line feed. Must not be empty. */
  separator?: string;
}

/**
 * Reads a streamed `fetch` response as Server-Sent Events, following the WHATWG event-stream rules.
 * Use it where `EventSource` cannot be: POST bodies, auth headers, chat replies and log tails.
 *
 * - UTF-8 is decoded as a stream, so a character or a CR LF pair split across chunks is fine.
 * - A blank line dispatches a message. `event` defaults to `message`, repeated `data` lines are joined
 *   with a line feed, `id` persists across messages (an id containing U+0000 is ignored) and `retry`
 *   is kept only when it is all digits. Comment lines and unknown fields are ignored.
 * - A block without `data` yields nothing, but its `retry` is reported with the next message.
 * - An unterminated final block is dropped, as `EventSource` does. A server that closes without a blank
 *   line therefore loses its last message.
 * - It does not check `response.ok` or the content type, and does not reconnect: remember `id` and
 *   `retry` to reconnect with `Last-Event-ID`. A `Response` without a body throws a `TypeError`.
 * - Aborting `signal`, leaving the loop early (`break`, `return()`) or a stream error cancels the reader
 *   once, so the connection closes. The iterator throws `signal.reason` on abort.
 * - `maxBufferSize` bounds memory, not time: a stream that never sends a blank line stays open until
 *   you abort. A longer pending block throws a `RangeError` and cancels the reader.
 * - OpenAI-style streams end with `data: [DONE]`, which is yielded as plain data: stop on it yourself.
 *
 * @example
 * const controller = new AbortController();
 * const response = await fetch('/api/chat', { method: 'POST', body, signal: controller.signal });
 * for await (const message of readSSE(response, { signal: controller.signal })) {
 *   if (message.data === '[DONE]') break;
 *   append(JSON.parse(message.data));
 * }
 */
export async function* readSSE(source: StreamSource, options: ReadSSEOptions = {}): AsyncGenerator<SSEMessage> {
  const { signal, maxBufferSize = DEFAULT_MAX_BUFFER_SIZE } = options;
  const parser = createEventStreamParser(maxBufferSize);
  for await (const text of streamText(source, signal)) {
    for (const message of parser.write(text)) {
      if (signal?.aborted) throw signal.reason;
      yield message;
    }
  }
}

/** Length of the longest suffix of `text` that is a proper prefix of `separator` (a separator still arriving). */
function partialSeparatorLength(text: string, separator: string): number {
  for (let length = Math.min(separator.length - 1, text.length); length > 0; length--) {
    if (text.endsWith(separator.slice(0, length))) return length;
  }
  return 0;
}

/**
 * Reads a streamed response as text parts split on `separator` (default a line feed), for protocols
 * that are not SSE, such as NDJSON log tails. Parts do not include the separator; empty parts are
 * skipped, and a part split across chunks (or a separator split across chunks) is joined. Text after
 * the last separator is yielded when the stream ends. Map parts in your loop (`JSON.parse(part)`).
 *
 * Abort, early exit, stream errors, `maxBufferSize` (a pending part longer than it throws a
 * `RangeError`) and a `Response` without a body behave as in {@link readSSE}.
 *
 * @example
 * for await (const line of readTextParts(response, { signal })) {
 *   log.push(JSON.parse(line));
 * }
 */
export async function* readTextParts(source: StreamSource, options: ReadTextPartsOptions = {}): AsyncGenerator<string> {
  const { signal, maxBufferSize = DEFAULT_MAX_BUFFER_SIZE, separator = '\n' } = options;
  if (separator === '') throw new TypeError('readTextParts: separator must not be empty.');
  const tooLarge = () => new RangeError(`A pending part is longer than maxBufferSize (${maxBufferSize} characters).`);
  let pending = '';
  for await (const text of streamText(source, signal)) {
    // A separator may straddle the previous chunk, so look again from its last few characters.
    let from = Math.max(0, pending.length - (separator.length - 1));
    pending += text;
    let start = 0;
    for (let end = pending.indexOf(separator, from); end !== -1; end = pending.indexOf(separator, from)) {
      if (end - start > maxBufferSize) throw tooLarge();
      const part = pending.slice(start, end);
      start = from = end + separator.length;
      if (part === '') continue;
      if (signal?.aborted) throw signal.reason;
      yield part;
    }
    pending = pending.slice(start);
    // A trailing partial separator belongs to the next chunk's match, not to the part, so it is not counted.
    if (pending.length - partialSeparatorLength(pending, separator) > maxBufferSize) throw tooLarge();
  }
  if (pending !== '') yield pending;
}
