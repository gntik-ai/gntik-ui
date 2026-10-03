import { Avatar, IconButton, SimpleTooltip, cn, getInitials } from '@gntik-ai/ui';
import { Check, Copy, RotateCcw, Sparkles, ThumbsDown, ThumbsUp, Wrench } from 'lucide-react';
import { useId, type ReactNode, type Ref } from 'react';
import { formatTime } from '../utils/format';
import { useCopy } from '../utils/useCopy';
import { chatMessageStyles as s } from './chatMessage.variants';

export type ChatRole = 'user' | 'assistant' | 'system' | 'tool';
export type ChatFeedback = 'up' | 'down' | null;

export interface ChatMessageProps {
  role: ChatRole;
  /** Display name; defaults per role ("You", "Assistant", "System", "Tool"). */
  author?: string;
  /** Replaces the default avatar. Pass `null` to hide it. */
  avatar?: ReactNode;
  /** When the message was sent. A Date renders as a local short time. */
  timestamp?: Date | string;
  /** The body: a string, a <Markdown>, a ToolCallCard… */
  children?: ReactNode;
  /** Text is still arriving: hides the actions, marks the message busy, shows typing dots while empty. */
  streaming?: boolean;
  /** Plain text to copy; shows the Copy action. */
  copyText?: string;
  /** Shows the Retry action (assistant replies). */
  onRetry?: () => void;
  /** Current feedback (controlled). */
  feedback?: ChatFeedback;
  /** Shows the thumbs; called with the new value (clicking the active thumb clears it). */
  onFeedback?: (value: ChatFeedback) => void;
  /** Extra actions appended to the action group. */
  actions?: ReactNode;
  /** Keep the actions visible instead of revealing them on hover/focus. */
  alwaysShowActions?: boolean;
  className?: string;
  ref?: Ref<HTMLElement>;
}

const DEFAULT_AUTHOR: Record<ChatRole, string> = { user: 'You', assistant: 'Assistant', system: 'System', tool: 'Tool' };

function DefaultAvatar({ role, author }: { role: ChatRole; author: string }) {
  if (role === 'assistant') return <Avatar size="sm" tone="primary" fallback={<Sparkles size={15} aria-hidden />} />;
  if (role === 'tool') return <Avatar size="sm" tone="secondary" fallback={<Wrench size={14} aria-hidden />} />;
  // Decorative: the author name is already shown next to it.
  return <Avatar size="sm" tone="secondary" initials={getInitials(author)} />;
}

/**
 * One turn in a conversation. User turns are right-aligned bubbles, assistant turns are
 * full-width prose, system notes are centred pills and tool turns hold a ToolCallCard. Copy,
 * retry and feedback actions appear on hover or keyboard focus and are reachable with Tab.
 */
export function ChatMessage({
  role,
  author,
  avatar,
  timestamp,
  children,
  streaming = false,
  copyText,
  onRetry,
  feedback = null,
  onFeedback,
  actions,
  alwaysShowActions = false,
  className,
  ref,
}: ChatMessageProps) {
  const id = useId();
  const name = author ?? DEFAULT_AUTHOR[role];
  const v = s.role[role];
  const { copied, copy } = useCopy();
  const isEmpty = children === undefined || children === null || children === '';
  const time =
    timestamp instanceof Date ? (
      <time dateTime={timestamp.toISOString()} className={s.time}>
        {formatTime(timestamp)}
      </time>
    ) : timestamp ? (
      <span className={s.time}>{timestamp}</span>
    ) : null;
  const hasActions = !streaming && role !== 'system' && (copyText !== undefined || onRetry || onFeedback || actions);
  const showAvatar = role !== 'system' && avatar !== null;

  return (
    <article
      ref={ref}
      aria-labelledby={`${id}-author`}
      aria-busy={streaming || undefined}
      data-role={role}
      data-streaming={streaming || undefined}
      className={cn(s.root, v.root, className)}
    >
      {showAvatar && <div className={s.avatar}>{avatar ?? <DefaultAvatar role={role} author={name} />}</div>}
      <div className={cn(s.body, v.body)}>
        <div className={cn(s.meta, v.meta)}>
          <span id={`${id}-author`} className={s.author}>
            {name}
          </span>
          {time}
        </div>
        <div className={cn(s.content, v.content)}>
          {streaming && isEmpty ? (
            <span className={s.typing}>
              <span className={s.typingDot} />
              <span className={cn(s.typingDot, '[animation-delay:150ms]')} />
              <span className={cn(s.typingDot, '[animation-delay:300ms]')} />
              <span className="sr-only">{name} is thinking</span>
            </span>
          ) : (
            children
          )}
        </div>
        {hasActions && (
          <div role="group" aria-label={`Actions for ${name} message`} className={cn(s.actions, alwaysShowActions && s.actionsVisible)}>
            {copyText !== undefined && (
              <SimpleTooltip content={copied ? 'Copied' : 'Copy'}>
                <IconButton size="sm" icon={copied ? Check : Copy} label={copied ? 'Copied' : 'Copy message'} onClick={() => void copy(copyText)} />
              </SimpleTooltip>
            )}
            {onRetry && (
              <SimpleTooltip content="Retry">
                <IconButton size="sm" icon={RotateCcw} label="Retry" onClick={onRetry} />
              </SimpleTooltip>
            )}
            {onFeedback && (
              <>
                <SimpleTooltip content="Good response">
                  <IconButton
                    size="sm"
                    icon={ThumbsUp}
                    label="Good response"
                    aria-pressed={feedback === 'up'}
                    className={cn(feedback === 'up' && 'text-primary-text')}
                    onClick={() => onFeedback(feedback === 'up' ? null : 'up')}
                  />
                </SimpleTooltip>
                <SimpleTooltip content="Bad response">
                  <IconButton
                    size="sm"
                    icon={ThumbsDown}
                    label="Bad response"
                    aria-pressed={feedback === 'down'}
                    className={cn(feedback === 'down' && 'text-destructive-text')}
                    onClick={() => onFeedback(feedback === 'down' ? null : 'down')}
                  />
                </SimpleTooltip>
              </>
            )}
            {actions}
          </div>
        )}
      </div>
    </article>
  );
}
