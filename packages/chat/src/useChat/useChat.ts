import { useEffect, useRef, useState } from 'react';
import type { ChatAttachment } from '../Attachment';
import { applyChunk } from './applyChunk';
import { chunksFrom } from './chunkSource';
import type { ChatAdapter, ChatThreadMessage, UseChatOptions } from './types';

interface Request {
  controller: AbortController;
  adapter: ChatAdapter;
  reply: ChatThreadMessage;
  timer?: ReturnType<typeof setTimeout>;
}

/**
 * Experimental streaming conversation runtime. Adapters call the product backend, never a provider
 * with browser-held keys. Busy sends are ignored. Render parts with the existing chat components;
 * pending/streaming map to ChatMessage.streaming and terminal replies can supply onRetry.
 * @experimental
 */
export function useChat(options: UseChatOptions) {
  const [messages, commitMessages] = useState<ChatThreadMessage[]>(options.initialMessages ?? []);
  const [isStreaming, setStreaming] = useState(false);
  const [error, setError] = useState<Error>();
  const current = useRef(messages);
  const active = useRef<Request | undefined>(undefined);
  const mounted = useRef(true);
  const [hasOlder, setHasOlder] = useState(Boolean(options.adapter.listMessages));
  const [isLoadingOlder, setLoadingOlder] = useState(false);
  const cursor = useRef(options.initialCursor ?? null);
  const older = useRef<AbortController | undefined>(undefined);
  const canLoad = useRef(Boolean(options.adapter.listMessages));
  const latest = useRef(options);
  useEffect(() => {
    latest.current = options;
  });

  useEffect(() => {
    mounted.current = true;
    const initial = latest.current;
    current.current = initial.initialMessages ?? [];
    cursor.current = initial.initialCursor ?? null;
    canLoad.current = Boolean(initial.adapter.listMessages);
    // Reset only when the conversation id changes, never when an inline adapter is re-created.
    commitMessages(current.current);
    setStreaming(false);
    setError(undefined);
    setLoadingOlder(false);
    setHasOlder(canLoad.current);
    return () => {
      mounted.current = false;
      const request = active.current;
      active.current = undefined;
      older.current?.abort();
      older.current = undefined;
      if (request) {
        clearTimeout(request.timer);
        request.controller.abort();
        void request.adapter.stop?.({ messageId: request.reply.id }).catch(() => {});
      }
    };
  }, [options.id]);

  const publish = () => {
    if (mounted.current) commitMessages([...current.current]);
  };
  const update = (request: Request) => {
    current.current = current.current.map((m) => (m.id === request.reply.id ? request.reply : m));
  };
  const begin = (history: ChatThreadMessage[], trigger: 'submit' | 'regenerate') => {
    const reply: ChatThreadMessage = {
      id: options.generateId?.() ?? crypto.randomUUID(),
      role: 'assistant',
      parts: [],
      status: 'pending',
      createdAt: new Date(),
    };
    const request: Request = { controller: new AbortController(), reply, adapter: options.adapter };
    active.current = request;
    current.current = [...history, reply];
    publish();
    setStreaming(true);
    setError(undefined);
    const valid = () => mounted.current && active.current === request;
    const finish = () => {
      clearTimeout(request.timer);
      update(request);
      publish();
      active.current = undefined;
      setStreaming(false);
    };
    void (async () => {
      try {
        const source = await options.adapter.sendMessage({
          messages: history,
          trigger,
          signal: request.controller.signal,
        });
        for await (const chunk of chunksFrom(source, request.controller.signal)) {
          if (!valid()) return;
          request.reply = applyChunk({ ...request.reply, status: 'streaming' }, chunk);
          if (request.reply.status === 'error') throw new Error(request.reply.error);
          update(request);
          if (request.reply.status === 'done' || request.reply.status === 'aborted') break;
          if (options.flushIntervalMs === 0) publish();
          else if (request.timer === undefined)
            request.timer = setTimeout(() => {
              request.timer = undefined;
              if (valid()) publish();
            }, options.flushIntervalMs ?? 50);
        }
        if (!valid()) return;
        if (request.reply.status !== 'aborted') request.reply = applyChunk(request.reply, { type: 'finish' });
        finish();
        if (request.reply.status === 'done') options.onFinish?.(request.reply);
      } catch (cause) {
        if (!valid()) return;
        const failure = cause instanceof Error ? cause : new Error(String(cause));
        request.reply = { ...request.reply, status: 'error', error: failure.message };
        finish();
        setError(failure);
        options.onError?.(failure, request.reply);
      }
    })();
  };
  const sendMessage = (text: string, attachments: ChatAttachment[] = []) => {
    if (active.current || !mounted.current) return;
    const user: ChatThreadMessage = {
      id: options.generateId?.() ?? crypto.randomUUID(),
      role: 'user',
      status: 'done',
      createdAt: new Date(),
      parts: [{ type: 'text', id: 'text', text }, ...attachments.map((file) => ({ type: 'file' as const, file }))],
    };
    begin([...current.current, user], 'submit');
  };

  const stop = () => {
    const request = active.current;
    if (!request) return;
    active.current = undefined;
    clearTimeout(request.timer);
    request.controller.abort();
    request.reply = applyChunk(request.reply, { type: 'abort' });
    update(request);
    publish();
    setStreaming(false);
    void request.adapter.stop?.({ messageId: request.reply.id }).catch(() => {});
  };
  const regenerate = (messageId?: string) => {
    if (active.current || !mounted.current) return;
    const index =
      messageId === undefined
        ? current.current.reduce((last, m, i) => (m.role === 'assistant' ? i : last), -1)
        : current.current.findIndex((m) => m.id === messageId && m.role === 'assistant');
    if (index < 0) return;
    begin(current.current.slice(0, index), 'regenerate');
  };
  const setMessages = (next: ChatThreadMessage[] | ((previous: ChatThreadMessage[]) => ChatThreadMessage[])) => {
    if (!mounted.current) return;
    current.current = typeof next === 'function' ? next(current.current) : next;
    publish();
  };
  const loadOlder = async () => {
    if (!mounted.current || older.current || !canLoad.current || !options.adapter.listMessages) return;
    const controller = new AbortController();
    older.current = controller;
    setLoadingOlder(true);
    try {
      const page = await options.adapter.listMessages({ cursor: cursor.current, signal: controller.signal });
      if (!mounted.current || older.current !== controller) return;
      current.current = [...page.messages, ...current.current];
      cursor.current = page.nextCursor;
      canLoad.current = page.nextCursor !== null;
      setHasOlder(canLoad.current);
      publish();
    } catch (cause) {
      if (mounted.current && older.current === controller)
        setError(cause instanceof Error ? cause : new Error(String(cause)));
    } finally {
      if (mounted.current && older.current === controller) {
        older.current = undefined;
        setLoadingOlder(false);
      }
    }
  };
  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    stop,
    regenerate,
    setMessages,
    loadOlder,
    hasOlder,
    isLoadingOlder,
  };
}
