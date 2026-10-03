import { IconButton, cn } from '@gntik-ai/ui';
import { ArrowDown } from 'lucide-react';
import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode, type Ref } from 'react';
import { useChatScroll } from '../useChatScroll';
import { chatLayoutStyles as s } from './chatLayout.variants';

export interface ChatLayoutProps {
  /** The messages (ChatMessage list, suggestions, …). */
  children?: ReactNode;
  /** Pinned at the bottom of the thread column, outside the scroll area (usually ChatComposer). */
  composer?: ReactNode;
  /** Optional header above the thread (title, model, actions). */
  header?: ReactNode;
  /** Optional side panel (artifact preview, details). Omit to hide it and its resize handle. */
  panel?: ReactNode;
  /** Accessible name of the side panel landmark. */
  panelLabel?: string;
  /** Initial panel width in px. */
  defaultPanelWidth?: number;
  minPanelWidth?: number;
  maxPanelWidth?: number;
  onPanelWidthChange?: (width: number) => void;
  /** Accessible name of the thread region. */
  label?: string;
  /** Label of the "jump to latest" button. */
  scrollButtonLabel?: string;
  /** Extra classes on the root. */
  className?: string;
  /** Extra classes on the centred content column. */
  contentClassName?: string;
  ref?: Ref<HTMLDivElement>;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Full-height chat frame: a scrollable thread with auto-scroll that respects scrolling up,
 * a "jump to latest" button, the composer pinned below, and an optional side panel that the
 * user can resize by dragging or with the arrow keys on its separator.
 */
export function ChatLayout({
  children,
  composer,
  header,
  panel,
  panelLabel = 'Details',
  defaultPanelWidth = 380,
  minPanelWidth = 260,
  maxPanelWidth = 720,
  onPanelWidthChange,
  label = 'Conversation',
  scrollButtonLabel = 'Scroll to latest message',
  className,
  contentClassName,
  ref,
}: ChatLayoutProps) {
  const { scrollRef, contentRef, isAtBottom, scrollToBottom } = useChatScroll();
  const [width, setWidth] = useState(() => clamp(defaultPanelWidth, minPanelWidth, maxPanelWidth));
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; width: number } | null>(null);

  const resize = (next: number) => {
    const w = clamp(Math.round(next), minPanelWidth, maxPanelWidth);
    setWidth(w);
    onPanelWidthChange?.(w);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, width };
    setDragging(true);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    // The panel sits on the right: dragging left widens it.
    resize(drag.current.width + (drag.current.x - e.clientX));
  };
  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };
  const onHandleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 64 : 16;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => resize(width + step),
      ArrowRight: () => resize(width - step),
      Home: () => resize(maxPanelWidth),
      End: () => resize(minPanelWidth),
    };
    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  return (
    <div ref={ref} className={cn(s.root, className)}>
      <section aria-label={label} className={s.thread}>
        {header && <div className={s.header}>{header}</div>}
        <div className={s.viewport}>
          <div ref={scrollRef} tabIndex={0} aria-label="Messages" role="region" className={s.scroller}>
            <div ref={contentRef} className={cn(s.content, contentClassName)}>
              {children}
            </div>
          </div>
          {!isAtBottom && (
            <div className={s.jump}>
              <IconButton
                icon={ArrowDown}
                label={scrollButtonLabel}
                variant="secondary"
                size="sm"
                className={s.jumpButton}
                onClick={() => scrollToBottom()}
              />
            </div>
          )}
        </div>
        {composer && (
          <div className={s.composer}>
            <div className={s.composerInner}>{composer}</div>
          </div>
        )}
      </section>
      {panel && (
        <>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label={`Resize ${panelLabel.toLowerCase()} panel`}
            aria-valuenow={width}
            aria-valuemin={minPanelWidth}
            aria-valuemax={maxPanelWidth}
            tabIndex={0}
            data-dragging={dragging || undefined}
            className={s.handle}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onHandleKey}
          />
          <aside aria-label={panelLabel} className={s.panel} style={{ width }}>
            {panel}
          </aside>
        </>
      )}
    </div>
  );
}
