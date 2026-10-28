import { useChatI18n } from '../utils/i18n';

export interface ChatAnnouncerProps {
  /** A reply is being generated. */
  streaming: boolean;
  /** The current stream is reasoning rather than answer text. */
  reasoning?: boolean;
  /** Plain text of the latest completed reply (announced once, when streaming ends). */
  lastReply?: string;
  /** Who is replying, used in the "is responding" status. */
  author?: string;
  /** Max characters of the completed reply to announce. */
  maxLength?: number;
}

/**
 * Screen-reader strategy for streaming: the thread itself is not a live region (it would
 * re-announce every token). This single polite, atomic status says "Assistant is responding…"
 * or "Assistant is thinking…" during reasoning, and reads the finished reply once when it ends.
 */
export function ChatAnnouncer({
  streaming,
  reasoning = false,
  lastReply,
  author,
  maxLength = 600,
}: ChatAnnouncerProps) {
  const { t, tc } = useChatI18n();
  let text = '';
  if (streaming) {
    const vars = { author: author ?? t('chat.assistant') };
    text = reasoning ? tc('chat.thinkingStatus', vars) : t('chat.responding', vars);
  } else if (lastReply) text = lastReply.length > maxLength ? `${lastReply.slice(0, maxLength)}…` : lastReply;
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {text}
    </div>
  );
}
