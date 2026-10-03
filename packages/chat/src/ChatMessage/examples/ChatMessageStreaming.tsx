import { Markdown } from '../../Markdown';
import { ChatMessage } from '../ChatMessage';

export default function ChatMessageStreaming() {
  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <ChatMessage role="assistant" streaming />
      <ChatMessage role="assistant" streaming>
        <Markdown streaming>{'Checking the invoices for **September**. So far two are'}</Markdown>
      </ChatMessage>
    </div>
  );
}
