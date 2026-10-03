import { TooltipProvider, cn } from '@gntik-ai/ui';
import { useEffect, useRef, useState } from 'react';
import { AttachmentList, type ChatAttachment } from '../Attachment';
import { ChatAnnouncer, ChatMessage, type ChatRole } from '../ChatMessage';
import { ChatComposer } from '../ChatComposer';
import { MessageFeedback, type FeedbackValue } from '../MessageFeedback';
import { DEMO_MODELS, ModelPicker } from '../ModelPicker';
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
  feedback?: FeedbackValue;
  attachments?: ChatAttachment[];
}

export interface ChatDemoProps {
  /** Show the resizable details panel. */
  withPanel?: boolean;
  /** Milliseconds between streamed chunks. */
  tickMs?: number;
  className?: string;
}

/**
 * End-to-end example: suggestions, a user turn with attachments, a tool call, a streamed
 * markdown reply with sources, Stop, Regenerate and feedback, and a compact model picker. Streaming is mocked with timers that are cleared on
 * Stop and on unmount.
 */
export function ChatDemo({ withPanel = true, tickMs = 30, className }: ChatDemoProps) {
  const [messages, setMessages] = useState<DemoMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [model, setModel] = useState<string | null>('balanced');
  const [files, setFiles] = useState<ChatAttachment[]>([]);
  const nextId = useRef(1);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const objectUrls = useRef<string[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => clearTimeout(t));
    timers.current = [];
  };
  useEffect(
    () => () => {
      clearTimers();
      objectUrls.current.forEach((u) => URL.revokeObjectURL(u));
    },
    [],
  );

  const attach = (picked: File[]) => {
    const added = picked.map((f): ChatAttachment => {
      let previewUrl: string | undefined;
      if (f.type.startsWith('image/') && typeof URL.createObjectURL === 'function') {
        previewUrl = URL.createObjectURL(f);
        objectUrls.current.push(previewUrl);
      }
      return { id: `file-${nextId.current++}`, name: f.name, size: f.size, type: f.type, previewUrl };
    });
    setFiles((all) => [...all, ...added]);
  };

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

  const send = (text: string, attachments: ChatAttachment[] = []) => {
    setMessages((ms) => [...ms, { id: nextId.current++, role: 'user', text, time: new Date(), attachments }]);
    setFiles([]);
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
          composer={
            <ChatComposer
              onSubmit={send}
              streaming={streaming}
              onStop={stop}
              maxLength={4000}
              attachments={files}
              onAttach={attach}
              onRemoveAttachment={(id) => setFiles((all) => all.filter((f) => f.id !== id))}
              accept=".pdf,.csv,.md,.txt,.json,image/*"
              maxSize={10 * 1024 * 1024}
              maxFiles={5}
              modelPicker={<ModelPicker compact models={DEMO_MODELS} value={model} onValueChange={setModel} />}
            />
          }
        >
          {messages.length === 0 && (
            <div className="flex flex-col gap-5 pt-10">
              <h2 className="text-center text-[20px] font-semibold tracking-tight text-foreground">How can I help?</h2>
              <SuggestionChips suggestions={DEMO_SUGGESTIONS} onSelect={(text) => send(text)} />
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
                  alwaysShowActions={m.feedback?.rating === 'down'}
                  actions={
                    <MessageFeedback
                      copyText={m.text}
                      onRegenerate={streaming ? undefined : () => retry(m.id)}
                      value={m.feedback ?? { rating: null }}
                      onFeedback={(f) => patch(m.id, (x) => ({ ...x, feedback: f }))}
                    />
                  }
                >
                  {m.text && <Markdown streaming={m.streaming}>{m.text}</Markdown>}
                  {m.sources && <CitationList sources={DEMO_SOURCES} className="mt-3" />}
                </ChatMessage>
              );
            }
            return (
              <ChatMessage key={m.id} role={m.role} timestamp={m.time}>
                {m.text}
                {m.attachments && m.attachments.length > 0 && <AttachmentList attachments={m.attachments} variant="tile" className="mt-2" />}
              </ChatMessage>
            );
          })}
          <ChatAnnouncer streaming={streaming} lastReply={lastReply} />
        </ChatLayout>
      </div>
    </TooltipProvider>
  );
}
