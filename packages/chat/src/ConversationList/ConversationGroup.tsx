import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Ref } from 'react';
import { conversationListStyles as s } from './conversationList.variants';
import type { ConversationSummary } from './types';

export type ConversationEntry =
  | { kind: 'group'; key: string; groupKey: string; label: string; collapsed: boolean }
  | { kind: 'row'; key: string; item: ConversationSummary };

export function ConversationGroup({
  entry,
  tabIndex,
  onToggle,
  onFocus,
  controlRef,
}: {
  entry: Extract<ConversationEntry, { kind: 'group' }>;
  tabIndex: number;
  onToggle: () => void;
  onFocus: () => void;
  controlRef: Ref<HTMLButtonElement>;
}) {
  const Chevron = entry.collapsed ? ChevronRight : ChevronDown;
  return (
    <h3>
      <button
        ref={controlRef}
        type="button"
        data-conversation-key={entry.key}
        tabIndex={tabIndex}
        className={s.heading}
        aria-expanded={!entry.collapsed}
        onClick={onToggle}
        onFocus={onFocus}
      >
        <Chevron size={14} aria-hidden className={entry.collapsed ? 'shrink-0 rtl:rotate-180' : 'shrink-0'} />
        {entry.label}
      </button>
    </h3>
  );
}
