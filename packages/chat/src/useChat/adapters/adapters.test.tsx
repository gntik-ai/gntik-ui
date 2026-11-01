import { readFileSync } from 'node:fs';
import { act, renderHook } from '@testing-library/react';
import { applyChunk } from '../applyChunk';
import { useChat } from '../useChat';
import type { ChatAdapter, ChatChunk, ChatThreadMessage } from '../types';
import { createHttpChatAdapter } from './http';
import { createOpenAICompatibleAdapter } from './openai-compatible';

const fixture = (name: string) => readFileSync(`src/useChat/adapters/fixtures/${name}.sse`, 'utf8');
const initial = (): ChatThreadMessage => ({
  id: 'a',
  role: 'assistant',
  status: 'pending',
  parts: [],
  createdAt: new Date(0),
});
async function collect(adapter: ChatAdapter) {
  const source = await adapter.sendMessage({
    messages: [{ ...initial(), role: 'user', parts: [{ type: 'text', id: 't', text: 'hi' }] }],
    trigger: 'submit',
    signal: new AbortController().signal,
  });
  let message = initial();
  for await (const chunk of source as AsyncIterable<ChatChunk>) message = applyChunk(message, chunk);
  return message;
}

describe('backend SSE adapters', () => {
  it('maps a chat-completions fixture into one reasoning and one text part and posts plain messages', async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(fixture('chat-completions')));
    const adapter = createOpenAICompatibleAdapter({
      url: '/api/chat',
      model: 'example',
      fetch,
      headers: { 'X-Workspace': 'one' },
      body: { temperature: 0 },
    });
    const reply = await collect(adapter);
    expect(reply.status).toBe('done');
    expect(reply.parts).toEqual([
      { type: 'reasoning', id: 'reasoning', text: 'Let me think.', state: 'done' },
      { type: 'text', id: 'text', text: 'Hello' },
    ]);
    expect(JSON.parse(String(fetch.mock.calls[0]?.[1]?.body))).toEqual({
      model: 'example',
      temperature: 0,
      stream: true,
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(fetch.mock.calls[0]?.[0]).toBe('/api/chat');
    expect(new Headers(fetch.mock.calls[0]?.[1]?.headers).get('X-Workspace')).toBe('one');
    expect(fetch.mock.calls[0]?.[1]?.signal).toBeInstanceOf(AbortSignal);
  });
  it('reduces the recorded UI stream exactly like the same protocol chunks', async () => {
    const body = fixture('ui-stream');
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(new Response(body));
    const reply = await collect(createHttpChatAdapter({ url: '/api/chat', fetch, body: { conversation: 'one' } }));
    const chunks: ChatChunk[] = body
      .split('\n\n')
      .filter((s) => s.startsWith('data: {'))
      .map((s) => JSON.parse(s.slice(6)) as ChatChunk);
    const expected = chunks.reduce(applyChunk, initial());
    expect(reply.parts).toEqual(expected.parts);
    expect(reply.status).toBe('done');
    expect(reply.parts).toHaveLength(3);
    expect(JSON.parse(String(fetch.mock.calls[0]?.[1]?.body))).toMatchObject({
      trigger: 'submit',
      conversation: 'one',
      messages: [{ role: 'user' }],
    });
  });

  it.each([createHttpChatAdapter, createOpenAICompatibleAdapter])(
    'rejects HTTP 500 before reading the response',
    async (factory) => {
      const response = new Response('not SSE', { status: 500 });
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useChat({ adapter: factory({ url: '/api/chat', fetch: vi.fn().mockResolvedValue(response) }), onError }),
      );
      await act(async () => result.current.sendMessage('hi'));
      expect(result.current.messages[1]).toMatchObject({
        status: 'error',
        parts: [],
        error: 'Chat request failed: HTTP 500',
      });
      expect(result.current.error?.message).toContain('500');
      expect(onError).toHaveBeenCalledTimes(1);
      expect(response.bodyUsed).toBe(false);
    },
  );
});
