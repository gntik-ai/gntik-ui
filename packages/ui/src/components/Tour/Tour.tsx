import { Popover as BasePopover } from '@base-ui/react/popover';
import { X } from 'lucide-react';
import { useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';
import { Button } from '../Button';
import { tourVariants } from './tour.variants';

export type TourTarget = string | RefObject<Element | null> | (() => Element | null);

export interface TourStep {
  /** CSS selector, ref or getter for the element the step points at. Missing targets centre the step. */
  target: TourTarget;
  title: ReactNode;
  content?: ReactNode;
  side?: BasePopover.Positioner.Props['side'];
  align?: BasePopover.Positioner.Props['align'];
}

export interface TourLabels {
  back: string;
  next: string;
  finish: string;
  skip: string;
  close: string;
  counter: (step: number, total: number) => string;
}

const defaultLabels: TourLabels = {
  back: 'Back',
  next: 'Next',
  finish: 'Finish',
  skip: 'Skip tour',
  close: 'End tour',
  counter: (i, n) => `Step ${i + 1} of ${n}`,
};

export interface TourProps {
  steps: TourStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Called when the tour ends: `completed` is true after Finish, false after Skip / Escape. */
  onFinish?: (completed: boolean) => void;
  /** Outline the target with the focus ring while its step is shown. */
  highlight?: boolean;
  labels?: Partial<TourLabels>;
  className?: string;
}

function resolve(target: TourTarget | undefined): Element | null {
  if (!target || typeof document === 'undefined') return null;
  if (typeof target === 'string') return document.querySelector(target);
  if (typeof target === 'function') return target();
  return target.current;
}

const centre = {
  getBoundingClientRect: () => {
    const x = window.innerWidth / 2;
    const y = window.innerHeight / 2;
    return { x, y, top: y, left: x, right: x, bottom: y, width: 0, height: 0, toJSON: () => ({}) } as DOMRect;
  },
};

/**
 * Onboarding steps anchored to elements: a non-modal popover (role dialog) positioned at each
 * step's target, with a step counter and Back / Next / Skip. Focus moves into the step and
 * returns where it was when the tour ends; Escape ends it; the target gets a focus-ring
 * outline (no overlay).
 */
export function Tour({
  steps,
  open,
  defaultOpen = false,
  onOpenChange,
  step,
  defaultStep = 0,
  onStepChange,
  onFinish,
  highlight = true,
  labels: labelsProp,
  className,
}: TourProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [innerStep, setInnerStep] = useState(defaultStep);
  const isOpen = (open ?? innerOpen) && steps.length > 0;
  const index = Math.min(Math.max(step ?? innerStep, 0), Math.max(steps.length - 1, 0));
  const current = steps[index];
  const last = index === steps.length - 1;
  const primaryRef = useRef<HTMLButtonElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const s = tourVariants();

  const setOpen = (next: boolean) => {
    setInnerOpen(next);
    onOpenChange?.(next);
  };
  const goTo = (i: number) => {
    const next = Math.min(Math.max(i, 0), steps.length - 1);
    setInnerStep(next);
    onStepChange?.(next);
  };
  const end = (completed: boolean) => {
    setOpen(false);
    onFinish?.(completed);
  };

  // Scroll the target into view and keep the highlight ring on it.
  useLayoutEffect(() => {
    const ring = ringRef.current;
    const el = isOpen ? resolve(current?.target) : null;
    if (!el) return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView?.({ block: 'center', inline: 'nearest', behavior: reduced ? 'auto' : 'smooth' });
    if (!ring) return;
    const place = () => {
      const r = el.getBoundingClientRect();
      Object.assign(ring.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${r.height}px` });
    };
    place();
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [isOpen, current?.target]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    if (e.key === fwd && !last) goTo(index + 1);
    else if (e.key === back && index > 0) goTo(index - 1);
    else return;
    e.preventDefault();
  };

  const target = current?.target;
  return (
    <>
      <BasePopover.Root
        modal="trap-focus"
        open={isOpen}
        onOpenChange={(next, details) => {
          if (next) return;
          if (details.reason === 'outside-press' || details.reason === 'focus-out') return;
          end(false);
        }}
      >
        <BasePopover.Portal>
          <BasePopover.Positioner
            className={s.positioner()}
            anchor={() => resolve(target) ?? centre}
            side={current?.side ?? 'bottom'}
            align={current?.align ?? 'center'}
            sideOffset={14}
            collisionPadding={12}
          >
            <BasePopover.Popup className={cn(s.popup(), className)} initialFocus={primaryRef} onKeyDown={onKeyDown}>
              <BasePopover.Arrow className={s.arrow()} />
              <p className={s.counter()}>{labels.counter(index, steps.length)}</p>
              <BasePopover.Title className={s.title()}>{current?.title}</BasePopover.Title>
              {current?.content != null && <BasePopover.Description className={s.description()}>{current.content}</BasePopover.Description>}
              <button type="button" aria-label={labels.close} className={s.close()} onClick={() => end(false)}>
                <X size={14} aria-hidden />
              </button>
              <div className={s.footer()}>
                {!last && (
                  <Button size="sm" variant="ghost" className={s.skip()} onClick={() => end(false)}>
                    {labels.skip}
                  </Button>
                )}
                {last && <span className={s.skip()} />}
                {index > 0 && (
                  <Button size="sm" variant="secondary" onClick={() => goTo(index - 1)}>
                    {labels.back}
                  </Button>
                )}
                <Button ref={primaryRef} size="sm" onClick={() => (last ? end(true) : goTo(index + 1))}>
                  {last ? labels.finish : labels.next}
                </Button>
              </div>
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </BasePopover.Root>
      {isOpen && highlight && typeof document !== 'undefined' && createPortal(<div ref={ringRef} aria-hidden data-tour-highlight="" className={s.highlight()} />, document.body)}
    </>
  );
}
