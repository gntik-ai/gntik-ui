import { TooltipProvider } from '@gntik-ai/ui';
import { useState } from 'react';
import { Markdown } from '../../Markdown';
import { ChatMessage, type ChatFeedback } from '../ChatMessage';

const REPLY = 'The **web-app** project has 3 deployments today. The latest one, `v2.14.0`, finished in 2 m 10 s.';

export default function ChatMessageRoles() {
  const [feedback, setFeedback] = useState<ChatFeedback>(null);
  return (
    <TooltipProvider>
      <div className="flex max-w-2xl flex-col gap-6">
        <ChatMessage role="system">Conversation started · project web-app</ChatMessage>
        <ChatMessage role="user" author="Maria Ruiz" timestamp="09:41">
          How many deployments did web-app have today?
        </ChatMessage>
        <ChatMessage
          role="assistant"
          timestamp="09:41"
          copyText={REPLY}
          onRetry={() => {}}
          feedback={feedback}
          onFeedback={setFeedback}
        >
          <Markdown>{REPLY}</Markdown>
        </ChatMessage>
      </div>
    </TooltipProvider>
  );
}
