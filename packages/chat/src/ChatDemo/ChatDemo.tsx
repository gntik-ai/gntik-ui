import { TooltipProvider, cn } from '@gntik-ai/ui';
import { useEffect, useRef, useState } from 'react';
import { ChatAnnouncer, ChatMessage, type ChatFeedback, type ChatRole } from '../ChatMessage';
import { ChatComposer } from '../ChatComposer';
import { ChatLayout } from '../ChatLayout';
import { CitationList } from '../Citation';
import { Markdown } from '../Markdown';
import { SuggestionChips } from '../SuggestionChips';
import { ToolCallCard, type ToolCallStatus } from '../ToolCallCard';
import { DEMO_REPLY, DEMO_SOURCES, DEMO_SUGGESTIONS, DEMO_TOOL, chunk } from './demoScript';

interface DemoMessage {
  id: number;
  role: ChatRole;
  text: string;
  time: Date;
  streaming?: boolean;
  tool?: { status: ToolCallStatus; durationMs?: number };
  sources?: boolean;
  feedback?: ChatFeedback;
}

export interface ChatDemoProps {
  /** Show the resizable details panel. */
  withPanel?: boolean;
  /** Milliseconds between streamed chunks. */
  tickMs?: number;
  className?: string;
}

/**
 * End-to-end example: suggestions, a user turn, a tool call, a streamed markdown reply with
 * sources, Stop, Retry and feedback. Streaming is mocked with timers that are cleared on
 * Stop and on unmount.
 */
export function ChatDemo({ withPanel = true, tickMs = 30, className }: ChatDemoProps) {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const nextId = useRef(1);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);

  const patch = (id: number, fn: (m: DemoMessage) => DemoMessage) => setMessages((ms) => ms.map((m) => (m.id === id ? fn(m) : m)));

  const respond = () => {
    clearTimers();
    const toolId = nextId.current++;
    const replyId = nextId.current++;
    const now = new Date();
    setStreaming(true);
    setMessages((ms) => [
      ...ms,
      { id: toolId, role: 'tool', text: '', time: now, tool: { status: 'running' } },
      { id: replyId, role: 'assistant', text: '', time: now, streaming: true },
    ]);
    const pieces = chunk(DEMO_REPLY);
    const startAt = DEMO_TOOL.durationMs;
    timers.current.push(setTimeout(() => patch(toolId, (m) => ({ ...m, tool: { status: 'succeeded', durationMs: DEMO_TOOL.durationMs } })), startAt));
    pieces.forEach((piece, i) => {
      timers.current.push(setTimeout(() => patch(replyId, (m) => ({ ...m, text: m.text + piece })), startAt + (i + 1) * tickMs));
    });
    timers.current.push(
      setTimeout(() => {
        patch(replyId, (m) => ({ ...m, streaming: false, sources: true }));
        setStreaming(false);
      }, startAt + (pieces.length + 1) * tickMs),
    );
  };

  const send = (text: string) => {
    setMessages((ms) => [...ms, { id: nextId.current++, role: 'user', text, time: new Date() }]);
    respond();
  };

  const stop = () => {
    clearTimers();
    setMessages((ms) =>
      ms.map((m) =>
        m.streaming ? { ...m, streaming: false } : m.tool?.status === 'running' ? { ...m, tool: { status: 'failed', durationMs: 0 } } : m,
      ),
    );
    setStreaming(false);
  };

  const retry = (id: number) => {
    setMessages((ms) => {
      const at = ms.findIndex((m) => m.id === id);
      // Drop the reply and the tool call that preceded it.
      const cut = at > 0 && ms[at - 1]?.role === 'tool' ? at - 1 : at;
      return ms.slice(0, cut);
    });
    respond();
  };

  const lastReply = [...messages].reverse().find((m) => m.role === 'assistant' && !m.streaming)?.text;

  return (
    <TooltipProvider>
      <div className={cn('h-[640px] overflow-hidden rounded-xl border border-border', className)}>
        <ChatLayout
          header={<div className="px-4 py-3 text-[13px] font-semibold text-foreground">New conversation</div>}
          panel={
            withPanel ? (
              <div className="flex flex-col gap-4 p-4 text-[13px]">
                <div>
                  <h2 className="font-semibold text-foreground">Details</h2>
                  <p className="mt-1 text-muted-foreground">Workspace assistant with read access to projects, deployments and invoices.</p>
                </div>
                <CitationList sources={DEMO_SOURCES} heading="Context sources" />
              </div>
            ) : undefined
          }
          composer={<ChatComposer onSubmit={send} streaming={streaming} onStop={stop} maxLength={4000} />}
        >
          {messages.length === 0 && (
            <div className="flex flex-col gap-5 pt-10">
              <h2 className="text-center text-[20px] font-semibold tracking-tight text-foreground">How can I help?</h2>
              <SuggestionChips suggestions={DEMO_SUGGESTIONS} onSelect={send} />
            </div>
          )}
          {messages.map((m) => {
            if (m.role === 'tool' && m.tool) {
              return (
                <ChatMessage key={m.id} role="tool" author="Tool" timestamp={m.time}>
                  <ToolCallCard
                    name={DEMO_TOOL.name}
                    status={m.tool.status}
                    durationMs={m.tool.durationMs}
                    args={DEMO_TOOL.args}
                    result={m.tool.status === 'succeeded' ? DEMO_TOOL.result : undefined}
                    error={m.tool.status === 'failed' ? 'Stopped by the user.' : undefined}
                  />
                </ChatMessage>
              );
            }
            if (m.role === 'assistant') {
              return (
                <ChatMessage
                  key={m.id}
                  role="assistant"
                  timestamp={m.time}
                  streaming={m.streaming}
                  copyText={m.text}
                  onRetry={streaming ? undefined : () => retry(m.id)}
                  feedback={m.feedback ?? null}
                  onFeedback={(f) => patch(m.id, (x) => ({ ...x, feedback: f }))}
                >
                  {m.text && <Markdown streaming={m.streaming}>{m.text}</Markdown>}
                  {m.sources && <CitationList sources={DEMO_SOURCES} className="mt-3" />}
                </ChatMessage>
              );
            }
            return (
              <ChatMessage key={m.id} role={m.role} timestamp={m.time}>
                {m.text}
              </ChatMessage>
            );
          })}
          <ChatAnnouncer streaming={streaming} lastReply={lastReply} />
        </ChatLayout>
      </div>
    </TooltipProvider>
  );
}
