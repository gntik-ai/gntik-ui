import { readSSE } from '../../readSSE';
import type { ChatAdapter, ChatChunk } from '../types';
import { postChat, type HttpChatAdapterOptions } from './http';

/** Options for a text-only chat-completions proxy. Provider keys must stay on the product server.
 * @experimental
 */
export interface OpenAICompatibleAdapterOptions extends HttpChatAdapterOptions {
  model?: string;
}
const record = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

/**
 * Experimental chat-completions SSE adapter. url must be the product backend. Maps content and
 * reasoning_content from the first choice; use the HTTP adapter for files, sources and tool parts.

 * @experimental
 */
export function createOpenAICompatibleAdapter(options: OpenAICompatibleAdapterOptions): ChatAdapter {
  return {
    async sendMessage({ messages, signal }) {
      const response = await postChat(
        options,
        {
          ...(options.model === undefined ? {} : { model: options.model }),
          ...options.body,
          stream: true,
          messages: messages.map((message) => ({
            role: message.role,
            content: message.parts
              .filter((p) => p.type === 'text')
              .map((p) => p.text)
              .join(''),
          })),
        },
        signal,
      );
      return (async function* (): AsyncGenerator<ChatChunk> {
        for await (const event of readSSE(response, { signal })) {
          if (event.data === '[DONE]') break;
          const data = record(JSON.parse(event.data));
          if (data.error) throw new Error(String(record(data.error).message ?? data.error));
          const choice = Array.isArray(data.choices) ? record(data.choices[0]) : {};
          const delta = record(choice.delta);
          if (typeof delta.reasoning_content === 'string')
            yield { type: 'reasoning-delta', id: 'reasoning', delta: delta.reasoning_content };
          if (typeof delta.content === 'string') yield { type: 'text-delta', id: 'text', delta: delta.content };
        }
        yield { type: 'finish' };
      })();
    },
  };
}
