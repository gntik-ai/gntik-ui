import { ChatComposer } from '../../ChatComposer';
import { ChatAnnouncer, ChatMessage } from '../../ChatMessage';
import { Markdown } from '../../Markdown';
import { createEchoAdapter, useChat } from '../index';

const adapter = createEchoAdapter();

/** A backend-free, keyboard-accessible echo conversation with Stop and Retry. */
export default function UseChatEcho() {
  const { messages, isStreaming, sendMessage, stop, regenerate, error } = useChat({ adapter });
  const lastReply = [...messages]
    .reverse()
    .find((m) => m.role === 'assistant' && m.status === 'done')
    ?.parts.filter((p) => p.type === 'text')
    .map((p) => p.text)
    .join('');
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      {messages.map((message) => {
        const text = message.parts
          .filter((p) => p.type === 'text')
          .map((p) => p.text)
          .join('');
        const streaming = message.status === 'pending' || message.status === 'streaming';
        return (
          <ChatMessage
            key={message.id}
            role={message.role}
            streaming={streaming}
            copyText={text}
            onRetry={message.role === 'assistant' && !isStreaming ? () => regenerate(message.id) : undefined}
          >
            {text && <Markdown streaming={streaming}>{text}</Markdown>}
          </ChatMessage>
        );
      })}
      {error && (
        <p role="alert" className="text-destructive-text">
          {error.message}
        </p>
      )}
      <ChatComposer onSubmit={sendMessage} streaming={isStreaming} onStop={stop} />
      <ChatAnnouncer streaming={isStreaming} lastReply={lastReply} />
    </div>
  );
}
