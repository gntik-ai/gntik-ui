import { PageHeader } from '@gntik-ai/blocks';
import {
  ChatAnnouncer,
  ChatComposer,
  ChatLayout,
  ChatMessage,
  CitationList,
  Markdown,
  SuggestionChips,
  ToolCallCard,
  type ChatFeedback,
  type ChatRole,
  type CitationSource,
  type Suggestion,
  type ToolCallStatus,
} from '@gntik-ai/chat';
import { SquarePen } from '@gntik-ai/icons';
import { Page, TooltipProvider, type BreadcrumbItem } from '@gntik-ai/ui';
import { useEffect, useRef, useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  assistantBreadcrumbs,
  assistantReply,
  assistantSources,
  assistantSuggestions,
  assistantTool,
  chunkReply,
  type AssistantTool,
} from './data';

interface Turn {
  id: number;
  role: ChatRole;
  text: string;
  time: Date;
  streaming?: boolean;
  tool?: { status: ToolCallStatus; durationMs?: number };
  sources?: boolean;
  feedback?: ChatFeedback;
}

export interface AssistantChatProps {
  title: string;
  suggestions: Suggestion[];
  /** Sources cited under the reply and listed in the details panel. */
  sources: CitationSource[];
  /** Mock tool call run before each reply. */
  tool: AssistantTool;
  /** Mock reply (markdown), streamed in chunks. */
  reply: string;
  /** Milliseconds between streamed chunks. */
  tickMs: number;
  /** Show the details panel. */
  withPanel: boolean;
  /** Called with each prompt the user sends. */
  onSend: (text: string) => void;
  onFeedback: (feedback: ChatFeedback) => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  /** ConsoleShell props (app nav, user, workspaces, sidebar footer, topbar…). */
  shell: Omit<ConsoleShellProps, 'children'>;
}

/** Assistant chat: ConsoleShell + Page + ChatLayout with a mock-streamed reply (timers cleared on Stop and unmount). */
export default function AssistantChatPage(props: Partial<AssistantChatProps>) {
  const {
    title = 'Assistant',
    suggestions = assistantSuggestions,
    sources = assistantSources,
    tool = assistantTool,
    reply = assistantReply,
    tickMs = 30,
    withPanel = true,
    onSend,
    onFeedback,
    breadcrumbs = assistantBreadcrumbs,
    currentHref = '/assistant',
    shell,
  } = props;
  const [turns, setTurns] = useState<Turn[]>([]);
  const [streaming, setStreaming] = useState(false);
  const nextId = useRef(1);
  const [timers] = useState(() => new Set<ReturnType<typeof setTimeout>>());

  const clearTimers = () => {
    timers.forEach((t) => clearTimeout(t));
    timers.clear();
  };
  useEffect(
    () => () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    },
    [timers],
  );
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
  };

  const patch = (id: number, fn: (t: Turn) => Turn) => setTurns((ts) => ts.map((t) => (t.id === id ? fn(t) : t)));

  const respond = () => {
    clearTimers();
    const toolId = nextId.current++;
    const replyId = nextId.current++;
    const now = new Date();
    setStreaming(true);
    setTurns((ts) => [
      ...ts,
      { id: toolId, role: 'tool', text: '', time: now, tool: { status: 'running' } },
      { id: replyId, role: 'assistant', text: '', time: now, streaming: true },
    ]);
    const pieces = chunkReply(reply);
    const startAt = tool.durationMs;
    later(() => patch(toolId, (t) => ({ ...t, tool: { status: 'succeeded', durationMs: tool.durationMs } })), startAt);
    pieces.forEach((piece, i) => later(() => patch(replyId, (t) => ({ ...t, text: t.text + piece })), startAt + (i + 1) * tickMs));
    later(() => {
      patch(replyId, (t) => ({ ...t, streaming: false, sources: true }));
      setStreaming(false);
    }, startAt + (pieces.length + 1) * tickMs);
  };

  const send = (text: string) => {
    setTurns((ts) => [...ts, { id: nextId.current++, role: 'user', text, time: new Date() }]);
    onSend?.(text);
    respond();
  };

  const stop = () => {
    clearTimers();
    setTurns((ts) =>
      ts.map((t) =>
        t.streaming ? { ...t, streaming: false } : t.tool?.status === 'running' ? { ...t, tool: { status: 'failed', durationMs: 0 } } : t,
      ),
    );
    setStreaming(false);
  };

  const retry = (id: number) => {
    setTurns((ts) => {
      const at = ts.findIndex((t) => t.id === id);
      // Drop the reply and the tool call that preceded it.
      const cut = at > 0 && ts[at - 1]?.role === 'tool' ? at - 1 : at;
      return ts.slice(0, cut);
    });
    respond();
  };

  const newConversation = () => {
    clearTimers();
    setTurns([]);
    setStreaming(false);
  };

  const lastReply = [...turns].reverse().find((t) => t.role === 'assistant' && !t.streaming)?.text;

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        width="full"
        header={
          <PageHeader
            breadcrumbs={null}
            title={title}
            description="Ask about projects, deployments, invoices and members. Answers cite their sources."
            status=""
            meta={[]}
            tabs={null}
            actions={[{ label: 'New conversation', icon: SquarePen, variant: 'secondary', disabled: turns.length === 0, onClick: newConversation }]}
          />
        }
      >
        <TooltipProvider>
          <div className="h-[680px] min-h-0 overflow-hidden rounded-xl border border-border">
            <ChatLayout
              header={<h2 className="px-4 py-3 text-[13px] font-semibold text-foreground">{turns.length === 0 ? 'New conversation' : 'Conversation'}</h2>}
              panel={
                withPanel ? (
                  <div className="flex flex-col gap-4 p-4 text-[13px]">
                    <div>
                      <h2 className="font-semibold text-foreground">Details</h2>
                      <p className="mt-1 text-muted-foreground">Read access to projects, deployments, invoices and members in this workspace.</p>
                    </div>
                    <CitationList sources={sources} heading="Context sources" />
                  </div>
                ) : undefined
              }
              composer={<ChatComposer onSubmit={send} streaming={streaming} onStop={stop} maxLength={4000} />}
            >
              {turns.length === 0 && (
                <div className="flex flex-col gap-5 pt-10">
                  <h3 className="text-center text-[20px] font-semibold tracking-tight text-foreground">How can I help?</h3>
                  <SuggestionChips suggestions={suggestions} onSelect={send} />
                </div>
              )}
              {turns.map((t) => {
                if (t.role === 'tool' && t.tool) {
                  return (
                    <ChatMessage key={t.id} role="tool" author="Tool" timestamp={t.time}>
                      <ToolCallCard
                        name={tool.name}
                        status={t.tool.status}
                        durationMs={t.tool.durationMs}
                        args={tool.args}
                        result={t.tool.status === 'succeeded' ? tool.result : undefined}
                        error={t.tool.status === 'failed' ? 'Stopped by the user.' : undefined}
                      />
                    </ChatMessage>
                  );
                }
                if (t.role === 'assistant') {
                  return (
                    <ChatMessage
                      key={t.id}
                      role="assistant"
                      timestamp={t.time}
                      streaming={t.streaming}
                      copyText={t.text}
                      onRetry={streaming ? undefined : () => retry(t.id)}
                      feedback={t.feedback ?? null}
                      onFeedback={(f) => {
                        patch(t.id, (x) => ({ ...x, feedback: f }));
                        onFeedback?.(f);
                      }}
                    >
                      {t.text && <Markdown streaming={t.streaming}>{t.text}</Markdown>}
                      {t.sources && <CitationList sources={sources} className="mt-3" />}
                    </ChatMessage>
                  );
                }
                return (
                  <ChatMessage key={t.id} role={t.role} timestamp={t.time}>
                    {t.text}
                  </ChatMessage>
                );
              })}
              <ChatAnnouncer streaming={streaming} lastReply={lastReply} />
            </ChatLayout>
          </div>
        </TooltipProvider>
      </Page>
    </ConsoleShell>
  );
}
