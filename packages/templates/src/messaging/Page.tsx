import { PageHeader } from '@gntik-ai/blocks';
import { ChatComposer, ChatMessage } from '@gntik-ai/chat';
import { MessagesSquare, SquarePen } from '@gntik-ai/icons';
import {
  Avatar,
  AvatarGroup,
  Badge,
  EmptyState,
  Heading,
  Page,
  SplitLayout,
  Text,
  Thumbnail,
  ThumbnailList,
  Timestamp,
  TooltipProvider,
  cn,
  type BreadcrumbItem,
} from '@gntik-ai/ui';
import { useId, useState } from 'react';
import { ConsoleShell, type ConsoleShellProps } from '../shared/ConsoleShell';
import { conversations as sampleConversations, messagingBreadcrumbs, type Conversation, type MessageAttachment } from './data';

export interface MessagingProps {
  conversations: Conversation[];
  defaultConversationId: string | null;
  /** Name shown on the current user's messages. */
  currentUser: string;
  /** Called with the text and attachments; the page appends the message locally. */
  onSend: (conversationId: string, text: string, attachments: MessageAttachment[]) => void;
  onNewConversation: () => void;
  breadcrumbs: BreadcrumbItem[];
  currentHref: string;
  shell: Omit<ConsoleShellProps, 'children'>;
}

/** Team messaging: SplitLayout conversation list → thread of ChatMessages with Thumbnail attachments and a ChatComposer. */
export default function MessagingPage(props: Partial<MessagingProps>) {
  const {
    conversations: initial = sampleConversations,
    defaultConversationId = null,
    currentUser = 'You',
    onSend,
    onNewConversation,
    breadcrumbs = messagingBreadcrumbs,
    currentHref = '/messages',
    shell,
  } = props;
  const [items, setItems] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(defaultConversationId);
  const [showDetail, setShowDetail] = useState(defaultConversationId != null);
  const [pending, setPending] = useState<MessageAttachment[]>([]);
  const ids = useId();
  const selected = items.find((c) => c.id === selectedId) ?? null;

  const openConversation = (id: string) => {
    setSelectedId(id);
    setShowDetail(true);
    setPending([]);
    setItems((list) => list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };
  const send = (text: string) => {
    if (!selected) return;
    const at = new Date();
    const attachments = pending;
    setItems((list) =>
      list.map((c) =>
        c.id === selected.id ? { ...c, messages: [...c.messages, { id: `m-${at.getTime()}`, author: currentUser, mine: true, text, at, attachments }] } : c,
      ),
    );
    setPending([]);
    onSend?.(selected.id, text, attachments);
  };

  const list = (
    <ul aria-label="Conversations" className="flex flex-col gap-0.5 p-2">
      {items.map((c) => {
        const last = c.messages[c.messages.length - 1];
        return (
          <li key={c.id}>
            <button
              type="button"
              aria-current={c.id === selectedId ? 'true' : undefined}
              onClick={() => openConversation(c.id)}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-start hover:bg-accent/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring aria-[current=true]:bg-accent"
            >
              <Avatar size="sm" name={c.title} aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className={cn('min-w-0 flex-1 truncate text-[13px] text-foreground', c.unread > 0 && 'font-semibold')}>{c.title}</span>
                  {last && <Timestamp value={last.at} tooltip={false} className="shrink-0 font-mono text-[11px]" />}
                </span>
                <span className="mt-0.5 flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-[12px] text-muted-foreground">
                    {last ? `${last.mine ? 'You' : last.author.split(' ')[0]}: ${last.text}` : 'No messages yet'}
                  </span>
                  {c.unread > 0 && (
                    <Badge tone="primary" size="sm">
                      {c.unread}
                      <span className="sr-only"> unread</span>
                    </Badge>
                  )}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  const detail = selected ? (
    <section aria-labelledby={`${ids}-title`} className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-border px-5 py-3">
        <div className="min-w-0 flex-1">
          <Heading id={`${ids}-title`} level={2} size="xs" truncate>
            {selected.title}
          </Heading>
          <Text variant="caption" tone="muted" truncate>
            {selected.participants.join(', ')}
          </Text>
        </div>
        <AvatarGroup size="xs" max={3} label="Participants">
          {selected.participants.map((p) => (
            <Avatar key={p} name={p} />
          ))}
        </AvatarGroup>
      </header>
      <div role="log" aria-label={`Messages in ${selected.title}`} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
        {selected.messages.map((m) => (
          <ChatMessage
            key={m.id}
            role={m.mine ? 'user' : 'assistant'}
            author={m.mine ? currentUser : m.author}
            avatar={m.mine ? undefined : <Avatar size="sm" name={m.author} aria-hidden />}
            timestamp={m.at}
          >
            {m.text}
            {m.attachments && m.attachments.length > 0 && (
              <ThumbnailList aria-label={`Attachments from ${m.author}`} className="mt-2">
                {m.attachments.map((a) => (
                  <Thumbnail key={a.id} name={a.name} size={a.size} type={a.type} src={a.src} />
                ))}
              </ThumbnailList>
            )}
          </ChatMessage>
        ))}
      </div>
      <div className="border-t border-border p-3">
        <ChatComposer
          label={`Message ${selected.title}`}
          placeholder={`Message ${selected.title}…`}
          onSubmit={send}
          attachments={pending.map(({ id, name, size }) => ({ id, name, size }))}
          onAttach={(files) =>
            setPending((p) => [...p, ...files.map((f, i) => ({ id: `${f.name}-${Date.now()}-${i}`, name: f.name, size: f.size, type: f.type || undefined }))])
          }
          onRemoveAttachment={(id) => setPending((p) => p.filter((a) => a.id !== id))}
        />
      </div>
    </section>
  ) : (
    <EmptyState icon={MessagesSquare} size="sm" titleAs="h2" className="mx-auto mt-16" title="Select a conversation" description="Messages and files show up here." />
  );

  return (
    <ConsoleShell breadcrumbs={breadcrumbs} currentHref={currentHref} {...shell}>
      <Page
        width="full"
        header={
          <PageHeader
            breadcrumbs={null}
            title="Messages"
            description="Direct and group conversations with your workspace."
            status=""
            meta={[]}
            tabs={null}
            actions={[{ label: 'New message', icon: SquarePen, onClick: onNewConversation }]}
          />
        }
      >
        <TooltipProvider>
          <div className="h-[680px] min-h-0 overflow-hidden rounded-xl border border-border">
            <SplitLayout listLabel="Conversations" detailLabel="Conversation" showDetail={showDetail} onShowDetailChange={setShowDetail} list={list} detail={detail} />
          </div>
        </TooltipProvider>
      </Page>
    </ConsoleShell>
  );
}
