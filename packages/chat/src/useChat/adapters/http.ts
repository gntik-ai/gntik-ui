import { readSSE } from '../../readSSE';
import type { ChatAdapter, ChatChunk } from '../types';

/** Backend POST options. url must point to your product backend; keep provider keys server-side.
 * @experimental
 */
export interface HttpChatAdapterOptions {
  url: string;
  headers?: HeadersInit;
  body?: Record<string, unknown>;
  fetch?: typeof globalThis.fetch;
}

export async function postChat(options: HttpChatAdapterOptions, body: Record<string, unknown>, signal: AbortSignal) {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  const response = await (options.fetch ?? globalThis.fetch)(options.url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal,
  });
  if (!response.ok) throw new Error(`Chat request failed: HTTP ${response.status}`);
  return response;
}

/** Experimental UI-message-stream v1 adapter. url must be the product backend, with keys on the server.
 * @experimental
 */
export function createHttpChatAdapter(options: HttpChatAdapterOptions): ChatAdapter {
  return {
    async sendMessage({ messages, trigger, signal }) {
      const response = await postChat(options, { ...options.body, messages, trigger }, signal);
      return (async function* (): AsyncGenerator<ChatChunk> {
        for await (const event of readSSE(response, { signal })) {
          if (event.data === '[DONE]') break;
          const chunk: unknown = JSON.parse(event.data);
          if (typeof chunk !== 'object' || chunk === null || !('type' in chunk) || typeof chunk.type !== 'string')
            throw new TypeError('Invalid chat chunk');
          yield chunk as ChatChunk;
        }
      })();
    },
  };
}
