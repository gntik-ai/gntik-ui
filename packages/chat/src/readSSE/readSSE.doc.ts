import type { ComponentDoc } from '@gntik-ai/ui';

export const doc: ComponentDoc = {
  name: 'readSSE',
  group: 'Feedback',
  status: 'beta',
  description:
    'Reads a streamed fetch response as an async iterator, for chat replies and live log tails where EventSource cannot be used (POST bodies, auth headers). `readSSE(response, { signal, maxBufferSize })` follows the WHATWG event-stream rules: streaming UTF-8, BOM, CRLF/LF/CR endings across chunk boundaries, comments, multi-line data, a persistent id and a digits-only retry. `readTextParts` splits on a separator (a line feed by default) for NDJSON. Aborting the signal, leaving the loop early or a stream error cancels the reader once, so the connection closes. An unterminated final block is dropped, as EventSource does. There is no reconnection: keep the last id and retry and send Last-Event-ID yourself. maxBufferSize bounds memory, not time, so abort a stream that goes quiet.',
};
