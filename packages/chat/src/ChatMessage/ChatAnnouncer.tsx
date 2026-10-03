export interface ChatAnnouncerProps {
  /** A reply is being generated. */
  streaming: boolean;
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
 * when a stream starts and reads the finished reply once when it ends.
 */
export function ChatAnnouncer({ streaming, lastReply, author = 'Assistant', maxLength = 600 }: ChatAnnouncerProps) {
  let text = '';
  if (streaming) text = `${author} is responding…`;
  else if (lastReply) text = lastReply.length > maxLength ? `${lastReply.slice(0, maxLength)}…` : lastReply;
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {text}
    </div>
  );
}
