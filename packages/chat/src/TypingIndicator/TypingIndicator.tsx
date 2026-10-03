import { cn } from '@gntik-ai/ui';
import type { Ref } from 'react';
import { useChatI18n } from '../utils/i18n';
import { typingIndicatorStyles as s } from './typingIndicator.variants';

export interface TypingIndicatorProps {
  /** Who is typing; used in the accessible text ("Assistant is typing"). */
  author?: string;
  /** Show the text next to the dots instead of keeping it screen-reader only. */
  showLabel?: boolean;
  /** Overrides the text entirely. */
  label?: string;
  size?: 'sm' | 'md';
  /**
   * Announce the text through its own polite status region. Off by default: in a thread,
   * ChatAnnouncer already announces "is responding" once.
   */
  announce?: boolean;
  className?: string;
  ref?: Ref<HTMLSpanElement>;
}

/**
 * Three dots that pulse while a reply is being written. The dots are decorative; the text
 * ("Assistant is typing") is always in the accessibility tree. Under reduced motion the dots
 * hold still.
 */
export function TypingIndicator({ author, showLabel = false, label, size = 'md', announce = false, className, ref }: TypingIndicatorProps) {
  const { t, tc } = useChatI18n();
  const text = label ?? tc('chat.typing', { author: author ?? t('chat.assistant') });
  const sz = s.size[size];
  return (
    <span
      ref={ref}
      data-slot="typing-indicator"
      role={announce ? 'status' : undefined}
      className={cn(s.root, className)}
    >
      <span aria-hidden className={cn(s.dots, sz.dots)}>
        <span className={cn(s.dot, sz.dot)} />
        <span className={cn(s.dot, sz.dot, '[animation-delay:150ms]')} />
        <span className={cn(s.dot, sz.dot, '[animation-delay:300ms]')} />
      </span>
      <span className={showLabel ? s.label : 'sr-only'}>{text}</span>
    </span>
  );
}
