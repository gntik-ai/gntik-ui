import { cn, useI18n } from '@gntik-ai/ui';
import { useId, type ComponentType, type ReactNode } from 'react';
import { suggestionChipsStyles as s } from './suggestionChips.variants';

type IconComponent = ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;

export interface Suggestion {
  /** Stable key; defaults to the label. */
  id?: string;
  /** Short title shown on the chip. */
  label: string;
  /** Second line (card layout only). */
  description?: string;
  /** Prompt sent when chosen; defaults to the label. */
  prompt?: string;
  icon?: IconComponent;
}

export interface SuggestionChipsProps {
  suggestions: ReadonlyArray<Suggestion | string>;
  onSelect: (prompt: string, suggestion: Suggestion) => void;
  /** `cards` (two-column grid with descriptions) for an empty thread, `chips` (pills) for follow-ups. */
  layout?: 'cards' | 'chips';
  /** Heading above the group; also its accessible name. */
  heading?: ReactNode;
  /** Accessible name when there is no visible heading. */
  label?: string;
  disabled?: boolean;
  className?: string;
}

const normalize = (x: Suggestion | string): Suggestion => (typeof x === 'string' ? { label: x } : x);

/** Prompt suggestions for an empty conversation (cards) or as follow-ups after a reply (chips). */
export function SuggestionChips({
  suggestions,
  onSelect,
  layout = 'cards',
  heading,
  label: labelProp,
  disabled = false,
  className,
}: SuggestionChipsProps) {
  const { t } = useI18n();
  const label = labelProp ?? t('chat.suggestions');
  const headingId = useId();
  const items = suggestions.map(normalize);
  return (
    <div
      role="group"
      aria-labelledby={heading ? headingId : undefined}
      aria-label={heading ? undefined : label}
      className={cn(s.root, className)}
    >
      {heading && (
        <div id={headingId} className={s.heading}>
          {heading}
        </div>
      )}
      <div className={layout === 'cards' ? s.grid : s.row}>
        {items.map((item) => {
          const Icon = item.icon;
          const prompt = item.prompt ?? item.label;
          return (
            <button
              key={item.id ?? item.label}
              type="button"
              disabled={disabled}
              className={layout === 'cards' ? s.card : s.chip}
              onClick={() => onSelect(prompt, item)}
            >
              {Icon && <Icon size={layout === 'cards' ? 16 : 14} aria-hidden className={layout === 'cards' ? s.icon : 'shrink-0 text-muted-foreground'} />}
              {layout === 'cards' ? (
                <span className="min-w-0">
                  <span className={s.label}>{item.label}</span>
                  {item.description && <span className={s.description}>{item.description}</span>}
                </span>
              ) : (
                item.label
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
