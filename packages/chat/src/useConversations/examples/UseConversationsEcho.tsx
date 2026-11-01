import { useEffect, useRef } from 'react';
import { Button, Input } from '@gntik-ai/ui';
import { ChatComposer } from '../../ChatComposer';
import { ChatAnnouncer, ChatMessage } from '../../ChatMessage';
import { Markdown } from '../../Markdown';
import { createEchoAdapter, useChat } from '../../useChat';
import { useConversations, type ChatConversation } from '../index';

const adapter = createEchoAdapter();
const initial: ChatConversation[] = [
  { id: 'c1', title: 'First chat', updatedAt: '2026-11-01' },
  { id: 'c2', title: 'Second chat', updatedAt: '2026-11-01' },
];

/** Local histories; persistence belongs to the product. */
export default function UseConversationsEcho() {
  const {
    conversations,
    activeId,
    setActiveId,
    addConversation,
    setConversation,
    removeConversation,
    getMessages,
    setMessages,
  } = useConversations({ defaultConversations: initial, defaultActiveId: 'c1' });
  const nextId = useRef(3);
  const { messages, isStreaming, sendMessage, stop, error } = useChat({
    adapter,
    id: activeId ?? undefined,
    initialMessages: activeId === null ? undefined : getMessages(activeId),
  });
  const owningId = useRef(activeId);
  useEffect(() => {
    if (owningId.current !== activeId) {
      // useChat resets in an effect: this render still contains the previous id's messages.
      owningId.current = activeId;
      return;
    }
    if (activeId !== null) setMessages(activeId, messages);
  }, [activeId, messages, setMessages]);

  const selected = conversations.find((item) => item.id === activeId);
  const lastReply = messages
    .filter((message) => message.role === 'assistant')
    .at(-1)
    ?.parts.filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('');

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <nav aria-label="Conversations">
        <ul className="flex flex-wrap gap-2">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <Button
                variant="secondary"
                aria-pressed={activeId === conversation.id}
                onClick={() => setActiveId(conversation.id)}
              >
                {conversation.title}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      <Button
        variant="secondary"
        onClick={() => {
          const number = nextId.current++;
          const id = `c${number}`;
          addConversation({ id, title: `Chat ${number}`, updatedAt: new Date() });
          setActiveId(id);
        }}
      >
        New chat
      </Button>
      {selected ? (
        <>
          <Input
            aria-label="Conversation title"
            value={selected.title}
            onValueChange={(title) => setConversation(selected.id, { title, updatedAt: new Date() })}
          />
          <Button variant="secondary" onClick={() => removeConversation(selected.id)}>
            Remove chat
          </Button>
          <section aria-label="Messages" className="flex flex-col gap-4">
            {messages.map((message) => {
              const text = message.parts
                .filter((part) => part.type === 'text')
                .map((part) => part.text)
                .join('');
              const streaming = message.status === 'pending' || message.status === 'streaming';
              return (
                <ChatMessage key={message.id} role={message.role} streaming={streaming} copyText={text}>
                  {text && <Markdown streaming={streaming}>{text}</Markdown>}
                </ChatMessage>
              );
            })}
          </section>
          {error && (
            <p role="alert" className="text-destructive-text">
              {error.message}
            </p>
          )}
          <ChatComposer key={activeId} onSubmit={sendMessage} streaming={isStreaming} onStop={stop} />
          <ChatAnnouncer streaming={isStreaming} lastReply={lastReply} />
        </>
      ) : (
        <p className="text-muted-foreground">Create a conversation to start chatting.</p>
      )}
    </div>
  );
}
