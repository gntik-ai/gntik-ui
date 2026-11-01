import { useEffect } from 'react';
import { act, renderHook } from '@testing-library/react';
import { useChat } from './useChat';
import type { ChatAdapter, ChatChunk } from './types';
import { createEchoAdapter } from './adapters/echo';

describe('useChat', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('appends attachments and echoes through pending, streaming and done', async () => {
    const onFinish = vi.fn();
    const { result } = renderHook(() => useChat({ adapter: createEchoAdapter({ delayMs: 100 }), onFinish }));
    act(() => result.current.sendMessage('hello', [{ id: 'f', name: 'notes.txt' }]));
    expect(result.current.messages[0]).toMatchObject({
      role: 'user',
      parts: [
        { type: 'text', text: 'hello' },
        { type: 'file', file: { name: 'notes.txt' } },
      ],
    });
    expect(result.current.messages[1]?.status).toBe('pending');
    expect(result.current.isStreaming).toBe(true);
    await act(async () => vi.advanceTimersByTimeAsync(150));
    expect(result.current.messages[1]?.status).toBe('streaming');
    await act(async () => vi.runAllTimersAsync());
    expect(result.current.messages[1]).toMatchObject({ status: 'done', parts: [{ type: 'text', text: 'hello' }] });
    expect(result.current.isStreaming).toBe(false);
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
  it('stops a readable stream, keeps partial parts, fails running tools and cancels on unmount', async () => {
    let signal!: AbortSignal;
    let stream!: ReadableStreamDefaultController<ChatChunk>;
    const cancel = vi.fn();
    const adapter: ChatAdapter = {
      async sendMessage(options) {
        signal = options.signal;
        return new ReadableStream({
          start(controller) {
            stream = controller;
          },
          cancel,
        });
      },
    };
    const { result, unmount } = renderHook(() => useChat({ adapter, flushIntervalMs: 0 }));
    await act(async () => result.current.sendMessage('hello'));
    await act(async () => {
      stream.enqueue({ type: 'text-delta', id: 'x', delta: 'Hel' });
      stream.enqueue({ type: 'tool-input-available', toolCallId: 't1', toolName: 'search', input: {} });
    });
    act(() => result.current.stop());
    expect(signal.aborted).toBe(true);
    expect(result.current.messages[1]).toMatchObject({
      status: 'aborted',
      parts: [
        { type: 'text', text: 'Hel' },
        { type: 'tool', status: 'failed' },
      ],
    });
    expect(result.current.isStreaming).toBe(false);
    await act(async () => {});
    expect(cancel).toHaveBeenCalledTimes(1);
    await act(async () => result.current.sendMessage('next'));
    const beforeUnmount = result.current;
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => vi.runAllTimersAsync());
    expect(result.current).toBe(beforeUnmount);
    expect(cancel).toHaveBeenCalledTimes(2);
  });

  it.each(['throw', 'chunk'])('keeps partial text on a %s failure and reports it once', async (mode) => {
    const onError = vi.fn();
    const adapter: ChatAdapter = {
      async sendMessage() {
        return (async function* () {
          yield { type: 'text-delta', id: 'x', delta: 'Hel' };
          if (mode === 'chunk') yield { type: 'error', errorText: 'Offline' };
          throw new Error('Offline');
        })();
      },
    };
    const { result } = renderHook(() => useChat({ adapter, onError }));
    await act(async () => result.current.sendMessage('hello'));
    expect(result.current.messages[1]).toMatchObject({
      status: 'error',
      error: 'Offline',
      parts: [{ type: 'text', text: 'Hel' }],
    });
    expect(result.current.error?.message).toBe('Offline');
    expect(onError).toHaveBeenCalledTimes(1);
    expect(result.current.isStreaming).toBe(false);
  });
  it('regenerates the last assistant reply and ignores all busy requests', async () => {
    const send = vi.fn(createEchoAdapter({ delayMs: 10 }).sendMessage);
    const { result } = renderHook(() => useChat({ adapter: { sendMessage: send } }));
    act(() => {
      result.current.sendMessage('first');
      result.current.sendMessage('ignored');
      result.current.regenerate();
    });
    expect(send).toHaveBeenCalledTimes(1);
    await act(async () => vi.runAllTimersAsync());
    act(() => result.current.sendMessage('second'));
    await act(async () => vi.runAllTimersAsync());
    const previous = result.current.messages;
    act(() => result.current.regenerate());
    expect(result.current.messages.slice(0, 3)).toEqual(previous.slice(0, 3));
    expect(result.current.messages[3]?.id).not.toBe(previous[3]?.id);
    expect(send.mock.calls[2]?.[0]).toMatchObject({ trigger: 'regenerate', messages: previous.slice(0, 3) });
    expect(send.mock.calls[2]?.[0].messages.at(-1)?.role).toBe('user');
    await act(async () => vi.runAllTimersAsync());
    act(() => result.current.regenerate(previous[0]?.id));
    expect(send).toHaveBeenCalledTimes(3);
  });

  it('prepends two chronological history pages and suppresses concurrent paging', async () => {
    const old = (id: string) => ({
      id,
      role: 'user' as const,
      status: 'done' as const,
      parts: [],
      createdAt: new Date(0),
    });
    let resolve!: (page: { messages: ReturnType<typeof old>[]; nextCursor: string | null }) => void;
    const listMessages = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolve = r;
          }),
      )
      .mockResolvedValueOnce({ messages: [old('oldest')], nextCursor: null });
    const { result } = renderHook(() =>
      useChat({
        adapter: { ...createEchoAdapter(), listMessages },
        initialCursor: 'c1',
        initialMessages: [old('now')],
      }),
    );
    act(() => {
      void result.current.loadOlder();
      void result.current.loadOlder();
    });
    expect(listMessages).toHaveBeenCalledTimes(1);
    expect(result.current.isLoadingOlder).toBe(true);
    await act(async () => resolve({ messages: [old('older')], nextCursor: 'c2' }));
    expect(result.current.hasOlder).toBe(true);
    await act(async () => result.current.loadOlder());
    expect(listMessages.mock.calls.map(([o]) => o.cursor)).toEqual(['c1', 'c2']);
    expect(result.current.messages.map((m) => m.id)).toEqual(['oldest', 'older', 'now']);
    expect(result.current.hasOlder).toBe(false);
    expect(result.current.isLoadingOlder).toBe(false);
    await act(async () => result.current.loadOlder());
    expect(listMessages).toHaveBeenCalledTimes(2);
  });

  it.each([50, 0])('batches 100 deltas with flushIntervalMs %i', async (flushIntervalMs) => {
    let stream!: ReadableStreamDefaultController<ChatChunk>;
    const adapter: ChatAdapter = {
      async sendMessage() {
        return new ReadableStream({
          start(c) {
            stream = c;
          },
        });
      },
    };
    const commits = vi.fn();
    const { result } = renderHook(() => {
      const chat = useChat({ adapter, flushIntervalMs });
      useEffect(() => {
        commits(chat.messages);
      }, [chat.messages]);
      return chat;
    });
    await act(async () => result.current.sendMessage('hello'));
    commits.mockClear();
    for (let n = 0; n < 100; n++) await act(async () => stream.enqueue({ type: 'text-delta', id: 'x', delta: 'x' }));
    if (flushIntervalMs) {
      expect(commits).not.toHaveBeenCalled();
      await act(async () => vi.advanceTimersByTimeAsync(50));
    }
    expect(commits).toHaveBeenCalledTimes(flushIntervalMs ? 1 : 100);
    expect(result.current.messages[1]?.parts[0]).toMatchObject({ text: 'x'.repeat(100) });
  });

  it('aborts and resets on an id change, discarding stale stream and history results', async () => {
    const signals: AbortSignal[] = [];
    let resolve!: (page: { messages: []; nextCursor: string | null }) => void;
    const adapter: ChatAdapter = {
      async sendMessage({ signal }) {
        signals.push(signal);
        return new ReadableStream();
      },
      async listMessages({ signal }) {
        signals.push(signal);
        return new Promise((r) => {
          resolve = r;
        });
      },
    };
    const { result, rerender } = renderHook(({ id }) => useChat({ adapter, id }), { initialProps: { id: 'one' } });
    await act(async () => {
      result.current.sendMessage('hello');
      void result.current.loadOlder();
    });
    rerender({ id: 'two' });
    expect(signals.every((s) => s.aborted)).toBe(true);
    expect(result.current.messages).toEqual([]);
    expect(result.current.isStreaming).toBe(false);
    await act(async () => resolve({ messages: [], nextCursor: null }));
    expect(result.current.hasOlder).toBe(true);
  });
});
