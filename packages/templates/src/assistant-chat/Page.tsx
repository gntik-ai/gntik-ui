import { PageHeader } from '@gntik-ai/blocks';
import {
  AttachmentList,
  ChatAnnouncer,
  ChatComposer,
  ChatLayout,
  ChatMessage,
  CitationList,
  Markdown,
  SuggestionChips,
  ReasoningBlock,
  useChat,
  type ChatAdapter,
  type ChatAttachment,
  ToolCallCard,
  type ChatFeedback,
  type CitationSource,
  type Suggestion,
} from '@gntik-ai/chat';
import { SquarePen } from '@gntik-ai/icons';
import { Page, TooltipProvider, type BreadcrumbItem } from '@gntik-ai/ui';
import { Fragment, useMemo, useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import {
  assistantBreadcrumbs,
  assistantReply,
  assistantSources,
  assistantSuggestions,
  assistantTool,
  createScriptedAdapter,
  type AssistantTool,
} from './data';

export interface AssistantChatProps {
  /** Experimental runtime adapter. Its URL must be the product backend; provider keys stay server-side. */
  adapter?: ChatAdapter;
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

/** Assistant chat: streams a backend adapter, or an abortable scripted demo when no adapter is supplied. */
export default function AssistantChatPage(props: Partial<AssistantChatProps>) {
  const {
    adapter,
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
  const scripted = useMemo(() => createScriptedAdapter(reply, tool, tickMs, sources), [reply, tool, tickMs, sources]);
  const {
    messages: turns,
    isStreaming: streaming,
    sendMessage,
    stop,
    regenerate,
    setMessages,
  } = useChat({ adapter: adapter ?? scripted, flushIntervalMs: 0 });
  const [feedback, setFeedback] = useState<Record<string, ChatFeedback>>({});
  const send = (text: string, attachments: ChatAttachment[] = []) => {
    if (streaming) return;
    sendMessage(text, attachments);
    onSend?.(text);
  };
  const newConversation = () => {
    stop();
    setMessages([]);
    setFeedback({});
  };
  const lastReply = [...turns]
    .reverse()
    .find((t) => t.role === 'assistant' && t.status === 'done')
    ?.parts.filter((p) => p.type === 'text')
    .map((p) => p.text)
    .join('');

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
            actions={[
              {
                label: 'New conversation',
                icon: SquarePen,
                variant: 'secondary',
                disabled: turns.length === 0,
                onClick: newConversation,
              },
            ]}
          />
        }
      >
        <TooltipProvider>
          <div className="h-[680px] min-h-0 overflow-hidden rounded-xl border border-border">
            <ChatLayout
              header={
                <h2 className="px-4 py-3 text-[13px] font-semibold text-foreground">
                  {turns.length === 0 ? 'New conversation' : 'Conversation'}
                </h2>
              }
              panel={
                withPanel ? (
                  <div className="flex flex-col gap-4 p-4 text-[13px]">
                    <div>
                      <h2 className="font-semibold text-foreground">Details</h2>
                      <p className="mt-1 text-muted-foreground">
                        Read access to projects, deployments, invoices and members in this workspace.
                      </p>
                    </div>
                    <CitationList sources={sources} heading="Context sources" />
                  </div>
                ) : undefined
              }
              composer={<ChatComposer onSubmit={send} streaming={streaming} onStop={stop} maxLength={4000} />}
            >
              {turns.length === 0 && (
                <div className="flex flex-col gap-5 pt-10">
                  <h3 className="text-center text-[20px] font-semibold tracking-tight text-foreground">
                    How can I help?
                  </h3>
                  <SuggestionChips suggestions={suggestions} onSelect={(text) => send(text)} />
                </div>
              )}
              {turns.map((t) => {
                const text = t.parts
                  .filter((p) => p.type === 'text')
                  .map((p) => p.text)
                  .join('');
                const files = t.parts.filter((p) => p.type === 'file').map((p) => p.file);
                const citations = t.parts.filter((p) => p.type === 'source').map((p) => p.source);
                const busy = t.status === 'pending' || t.status === 'streaming';
                return (
                  <Fragment key={t.id}>
                    {t.parts
                      .filter((p) => p.type === 'tool')
                      .map((part) => (
                        <ChatMessage key={part.toolCallId} role="tool" timestamp={t.createdAt}>
                          <ToolCallCard
                            name={part.toolName}
                            status={part.status}
                            durationMs={
                              !adapter
                                ? part.status === 'succeeded'
                                  ? tool.durationMs
                                  : part.status === 'failed'
                                    ? 0
                                    : undefined
                                : undefined
                            }
                            args={part.input}
                            result={part.output}
                            error={
                              part.errorText ??
                              (!adapter && part.status === 'failed' ? 'Stopped by the user.' : undefined)
                            }
                          />
                        </ChatMessage>
                      ))}
                    <ChatMessage
                      role={t.role}
                      timestamp={t.createdAt}
                      streaming={busy}
                      copyText={t.role === 'assistant' ? text : undefined}
                      onRetry={t.role === 'assistant' && !streaming ? () => regenerate(t.id) : undefined}
                      feedback={feedback[t.id] ?? null}
                      onFeedback={
                        t.role === 'assistant'
                          ? (f) => {
                              setFeedback((previous) => ({ ...previous, [t.id]: f }));
                              onFeedback?.(f);
                            }
                          : undefined
                      }
                    >
                      {t.parts
                        .filter((p) => p.type === 'reasoning')
                        .map((part) => (
                          <ReasoningBlock key={part.id} streaming={busy && part.state === 'streaming'}>
                            {part.text}
                          </ReasoningBlock>
                        ))}
                      {text && (t.role === 'assistant' ? <Markdown streaming={busy}>{text}</Markdown> : text)}
                      {files.length > 0 && <AttachmentList attachments={files} />}
                      {citations.length > 0 && <CitationList sources={citations} className="mt-3" />}
                      {t.error && (
                        <p role="alert" className="text-destructive-text">
                          {t.error}
                        </p>
                      )}
                    </ChatMessage>
                  </Fragment>
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
