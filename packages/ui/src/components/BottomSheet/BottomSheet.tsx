import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import { X } from 'lucide-react';
import { createContext, useContext, useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { bottomSheetVariants } from './bottom-sheet.variants';

export type BottomSheetSnapPoint = BaseDrawer.Root.SnapPoint;

export interface BottomSheetLabels {
  /** Accessible name of the drag handle. */
  handle: string;
  /** Keyboard hint read with the handle. */
  handleHint: string;
  close: string;
  /** Announced when the sheet settles on a snap point. */
  position: (index: number, total: number) => string;
}

const defaultLabels: BottomSheetLabels = {
  handle: 'Resize sheet',
  handleHint: 'Arrow Up expands, Arrow Down collapses.',
  close: 'Close',
  position: (i, n) => (i === n - 1 ? 'Sheet expanded.' : `Sheet at height ${i + 1} of ${n}.`),
};

interface SheetContextValue {
  snapPoints: BottomSheetSnapPoint[];
  snap: BottomSheetSnapPoint | null;
  setSnap: (next: BottomSheetSnapPoint) => void;
  labels: BottomSheetLabels;
}

const SheetContext = createContext<SheetContextValue | null>(null);

export interface BottomSheetProps extends Omit<BaseDrawer.Root.Props, 'swipeDirection' | 'snapPoints' | 'snapPoint' | 'defaultSnapPoint' | 'onSnapPointChange'> {
  /**
   * Heights the sheet rests at, smallest first: 0–1 is a fraction of the viewport, larger
   * numbers are px, strings take px/rem. The last one should be the expanded height (1).
   */
  snapPoints?: BottomSheetSnapPoint[];
  snapPoint?: BottomSheetSnapPoint | null;
  /** Snap point used each time the sheet opens (default: the first). */
  defaultSnapPoint?: BottomSheetSnapPoint;
  onSnapPointChange?: (snapPoint: BottomSheetSnapPoint | null) => void;
  labels?: Partial<BottomSheetLabels>;
}

/**
 * Mobile sheet on Base UI Drawer: snaps between heights, drags (or swipes down to close)
 * from anywhere outside the scrollable content, and its handle is a keyboard control.
 */
export function BottomSheet({
  snapPoints = [0.5, 1],
  snapPoint,
  defaultSnapPoint,
  onSnapPointChange,
  onOpenChange,
  labels: labelsProp,
  children,
  ...props
}: BottomSheetProps) {
  const initial = defaultSnapPoint ?? snapPoints[0] ?? 1;
  const [inner, setInner] = useState<BottomSheetSnapPoint | null>(initial);
  const snap = snapPoint !== undefined ? snapPoint : inner;
  const labels = { ...defaultLabels, ...labelsProp };
  const setSnap = (next: BottomSheetSnapPoint | null) => {
    setInner(next);
    onSnapPointChange?.(next);
  };
  return (
    <SheetContext.Provider value={{ snapPoints, snap, setSnap, labels }}>
      <BaseDrawer.Root
        swipeDirection="down"
        snapPoints={snapPoints}
        snapPoint={snap}
        onSnapPointChange={(next) => setSnap(next)}
        onOpenChange={(open, details) => {
          if (open) setSnap(initial);
          onOpenChange?.(open, details);
        }}
        {...props}
      >
        {children}
      </BaseDrawer.Root>
    </SheetContext.Provider>
  );
}

/** Opens the sheet. Use `render={<Button />}` to style it as a kit button. */
export const BottomSheetTrigger = BaseDrawer.Trigger;
/** Closes the sheet. Use `render={<Button variant="ghost" />}` for footer actions. */
export const BottomSheetClose = BaseDrawer.Close;

function SheetHandle() {
  const ctx = useContext(SheetContext);
  const hintId = useId();
  const s = bottomSheetVariants();
  if (!ctx) return null;
  const { snapPoints, snap, setSnap, labels } = ctx;
  const n = snapPoints.length;
  const at = Math.max(0, snapPoints.findIndex((p) => p === snap));
  const to = (i: number) => {
    const next = snapPoints[Math.min(Math.max(i, 0), n - 1)];
    if (next !== undefined && next !== snap) setSnap(next);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = { ArrowUp: at + 1, ArrowDown: at - 1, Home: 0, End: n - 1, PageUp: n - 1, PageDown: 0 };
    const target = keys[e.key];
    if (target === undefined) return;
    e.preventDefault();
    to(target);
  };
  return (
    <div className={s.handleArea()}>
      <button
        type="button"
        className={s.handle()}
        aria-label={labels.handle}
        aria-describedby={hintId}
        onKeyDown={onKeyDown}
        onClick={() => to(at === n - 1 ? 0 : at + 1)}
      >
        <span aria-hidden className={s.handleBar()} />
      </button>
      <span id={hintId} hidden>
        {labels.handleHint}
      </span>
      <span role="status" className="sr-only">
        {labels.position(at, n)}
      </span>
    </div>
  );
}

export interface BottomSheetContentProps extends Omit<BaseDrawer.Popup.Props, 'className' | 'title'> {
  className?: string;
  title?: ReactNode;
  description?: ReactNode;
  /** Fixed action bar under the scrollable content. */
  footer?: ReactNode;
  showClose?: boolean;
  container?: BaseDrawer.Portal.Props['container'];
  children?: ReactNode;
}

/**
 * The sheet: portal, backdrop, viewport and popup with the keyboard-accessible handle, an
 * optional header (title, description), scrollable content and a fixed footer.
 */
export function BottomSheetContent({ className, title, description, footer, showClose = true, container, children, ...props }: BottomSheetContentProps) {
  const ctx = useContext(SheetContext);
  const s = bottomSheetVariants();
  return (
    <BaseDrawer.Portal container={container}>
      <BaseDrawer.Backdrop className={s.backdrop()} />
      <BaseDrawer.Viewport className={s.viewport()}>
        <BaseDrawer.Popup className={cn(s.popup(), className)} {...props}>
          <SheetHandle />
          {(title != null || description != null) && (
            <div className={s.header()}>
              {title != null && <BaseDrawer.Title className={s.title()}>{title}</BaseDrawer.Title>}
              {description != null && <BaseDrawer.Description className={s.description()}>{description}</BaseDrawer.Description>}
            </div>
          )}
          <BaseDrawer.Content className={s.content()}>{children}</BaseDrawer.Content>
          {footer != null && <div className={s.footer()}>{footer}</div>}
          {showClose && (
            <BaseDrawer.Close aria-label={ctx?.labels.close ?? defaultLabels.close} className={s.close()}>
              <X size={16} aria-hidden />
            </BaseDrawer.Close>
          )}
        </BaseDrawer.Popup>
      </BaseDrawer.Viewport>
    </BaseDrawer.Portal>
  );
}
