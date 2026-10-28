import { Collapsible, CollapsiblePanel, CollapsibleTrigger, cn } from '@gntik-ai/ui';
import { useEffect, useRef, useState, type ReactNode, type Ref } from 'react';
import { Markdown } from '../Markdown';
import { formatElapsed } from '../utils/formatElapsed';
import { useChatI18n } from '../utils/i18n';
import { reasoningBlockStyles as s } from './reasoningBlock.variants';

export interface ReasoningBlockProps {
  children?: string | ReactNode;
  streaming?: boolean;
  durationMs?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  label?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** A quiet disclosure for reasoning tokens; announcements belong in ChatAnnouncer. */
export function ReasoningBlock({
  children,
  streaming = false,
  durationMs,
  open,
  defaultOpen = false,
  onOpenChange,
  label,
  className,
  ref,
}: ReasoningBlockProps) {
  const { tc } = useChatI18n();
  const [internalOpen, setInternalOpen] = useState(streaming || defaultOpen);
  const wasStreaming = useRef(streaming);
  const userToggled = useRef(false);

  useEffect(() => {
    if (wasStreaming.current === streaming) return;
    wasStreaming.current = streaming;
    if (streaming) userToggled.current = false;
    if (open === undefined && (streaming || !userToggled.current)) {
      // Synchronise only a stream phase transition, never a token or defaultOpen update.
      setInternalOpen(streaming || defaultOpen);
    }
  }, [streaming, defaultOpen, open]);

  const hasContent =
    typeof children === 'string' ? children.trim().length > 0 : children != null && typeof children !== 'boolean';
  if (!streaming && !hasContent) return null;

  return (
    <Collapsible
      ref={ref}
      open={open ?? internalOpen}
      onOpenChange={(next) => {
        if (streaming) userToggled.current = true;
        if (open === undefined) setInternalOpen(next);
        onOpenChange?.(next);
      }}
      className={cn(s.root, className)}
    >
      <CollapsibleTrigger className={s.trigger} {...(!hasContent ? { 'aria-controls': undefined } : {})}>
        <span className={streaming ? s.running : undefined}>
          {label ??
            (streaming
              ? tc('chat.thinking')
              : durationMs !== undefined
                ? tc('chat.thoughtFor', { duration: formatElapsed(durationMs) })
                : tc('chat.reasoning'))}
        </span>
      </CollapsibleTrigger>
      {hasContent && (
        <CollapsiblePanel aria-busy={streaming}>
          <div className={s.body}>
            {typeof children === 'string' ? (
              <Markdown streaming={streaming} className={s.markdown}>
                {children}
              </Markdown>
            ) : (
              children
            )}
          </div>
        </CollapsiblePanel>
      )}
    </Collapsible>
  );
}
