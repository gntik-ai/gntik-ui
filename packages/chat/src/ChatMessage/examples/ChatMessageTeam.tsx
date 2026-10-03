import { TooltipProvider } from '@gntik-ai/ui';
import { ChatMessage } from '../ChatMessage';

/** A shared thread: the current user, a teammate (`participant`) and the assistant. */
export default function ChatMessageTeam() {
  return (
    <TooltipProvider>
      <div className="flex max-w-2xl flex-col gap-6">
        <ChatMessage role="participant" author="Daniel Okafor" timestamp="10:02" copyText="Can we roll back the last release?">
          Can we roll back the last release? Error rates doubled after it went out.
        </ChatMessage>
        <ChatMessage role="user" author="Maria Ruiz" timestamp="10:03">
          On it. Asking the assistant for the previous version.
        </ChatMessage>
        <ChatMessage role="assistant" timestamp="10:03">
          The previous release is v2.13.4, deployed 3 days ago with no incidents.
        </ChatMessage>
      </div>
    </TooltipProvider>
  );
}
