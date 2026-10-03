import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { Children, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { carouselVariants, type CarouselVariantProps } from './carousel.variants';

export interface CarouselLabels {
  previous: string;
  next: string;
  play: string;
  pause: string;
  /** Accessible name of each slide, e.g. "2 of 5". */
  slide: (index: number, total: number) => string;
  /** Accessible name of each picker dot. */
  goTo: (index: number, total: number) => string;
  /** Accessible name of the dot group. */
  pickers: string;
}

const defaultLabels: CarouselLabels = {
  previous: 'Previous slide',
  next: 'Next slide',
  play: 'Start automatic slide show',
  pause: 'Stop automatic slide show',
  slide: (i, n) => `${i + 1} of ${n}`,
  goTo: (i) => `Go to slide ${i + 1}`,
  pickers: 'Choose slide',
};

export interface CarouselProps extends CarouselVariantProps {
  /** Accessible name of the carousel (required by the pattern). */
  label: string;
  /** Visible heading next to the controls; defaults to none (the label stays accessible). */
  title?: ReactNode;
  /** One child per slide. */
  children: ReactNode;
  /** Gap between slides, in px. */
  gap?: number;
  /** Show picker dots under the strip. */
  showDots?: boolean;
  /** Controlled index of the first visible slide. */
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  /** Advance every N ms. Off by default; when on, a pause control is shown and reduced motion keeps it paused. */
  autoplay?: number | false;
  /** Wrap from the last slide to the first (always on while autoplaying). */
  loop?: boolean;
  labels?: Partial<CarouselLabels>;
  className?: string;
}

const prefersReducedMotion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Scroll-snap media strip (APG carousel pattern): a labelled region with
 * `aria-roledescription="carousel"`, slides as labelled groups, previous/next buttons,
 * optional picker dots and arrow-key navigation on the focused strip. No autoplay by
 * default; with `autoplay` a pause control comes first and hover/focus pause rotation.
 */
export function Carousel({
  label,
  title,
  children,
  perView = 1,
  gap = 12,
  showDots = false,
  index,
  defaultIndex = 0,
  onIndexChange,
  autoplay = false,
  loop = false,
  labels: labelsProp,
  className,
}: CarouselProps) {
  const labels = { ...defaultLabels, ...labelsProp };
  const slides = Children.toArray(children);
  const total = slides.length;
  const [inner, setInner] = useState(defaultIndex);
  const current = Math.min(Math.max(index ?? inner, 0), Math.max(total - 1, 0));
  const [playing, setPlaying] = useState(() => !!autoplay && !prefersReducedMotion());
  const [held, setHeld] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scrollingTo = useRef<number | null>(null);
  const id = useId();
  const s = carouselVariants({ perView });
  const wraps = loop || !!autoplay;

  const scrollToSlide = (i: number) => {
    const el = viewportRef.current?.querySelector<HTMLElement>(`[data-slide-index="${i}"]`);
    if (!el || !viewportRef.current) return;
    scrollingTo.current = i;
    const behavior: ScrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
    const vp = viewportRef.current;
    const rtl = getComputedStyle(vp).direction === 'rtl';
    const delta = rtl
      ? el.getBoundingClientRect().right - vp.getBoundingClientRect().right
      : el.getBoundingClientRect().left - vp.getBoundingClientRect().left;
    vp.scrollBy?.({ left: delta, behavior });
  };

  const goTo = (i: number) => {
    const next = wraps ? (i + total) % total : Math.min(Math.max(i, 0), total - 1);
    if (next === current || total === 0) return;
    setInner(next);
    onIndexChange?.(next);
    scrollToSlide(next);
  };

  /** Keeps the index in sync when the user scrolls or swipes the strip. */
  const onScroll = () => {
    const vp = viewportRef.current;
    if (!vp) return;
    const rtl = getComputedStyle(vp).direction === 'rtl';
    const edge = rtl ? vp.getBoundingClientRect().right : vp.getBoundingClientRect().left;
    let best = current;
    let bestDist = Infinity;
    vp.querySelectorAll<HTMLElement>('[data-slide-index]').forEach((el) => {
      const r = el.getBoundingClientRect();
      const d = Math.abs((rtl ? r.right : r.left) - edge);
      if (d < bestDist) {
        bestDist = d;
        best = Number(el.dataset.slideIndex);
      }
    });
    if (scrollingTo.current !== null) {
      if (best === scrollingTo.current) scrollingTo.current = null;
      return;
    }
    if (best !== current) {
      setInner(best);
      onIndexChange?.(best);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    let target: number | null = null;
    if (e.key === fwd) target = current + 1;
    else if (e.key === back) target = current - 1;
    else if (e.key === 'Home') target = 0;
    else if (e.key === 'End') target = total - 1;
    if (target === null) return;
    e.preventDefault();
    goTo(target);
  };

  const rotating = playing && !held && !!autoplay && total > 1;
  const advanceRef = useRef<() => void>(() => {});
  useEffect(() => {
    advanceRef.current = () => goTo(current + 1);
  });
  useEffect(() => {
    if (!rotating || !autoplay) return;
    const t = window.setInterval(() => advanceRef.current(), autoplay);
    return () => window.clearInterval(t);
  }, [rotating, autoplay]);

  const style = { '--carousel-gap': `${gap}px`, gap: `${gap}px` } as CSSProperties;
  const atStart = !wraps && current === 0;
  const atEnd = !wraps && current >= total - 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className={cn(s.root(), className)}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
      }}
    >
      <div className={s.header()}>
        {autoplay !== false && (
          <button
            type="button"
            className={s.control()}
            aria-label={playing ? labels.pause : labels.play}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause size={14} aria-hidden /> : <Play size={14} aria-hidden />}
          </button>
        )}
        {title != null && <div className={s.title()}>{title}</div>}
        <div className={s.controls()}>
          <button type="button" className={s.control()} aria-label={labels.previous} aria-controls={`${id}-viewport`} disabled={atStart} onClick={() => goTo(current - 1)}>
            <ChevronLeft size={15} aria-hidden className="rtl:-scale-x-100" />
          </button>
          <button type="button" className={s.control()} aria-label={labels.next} aria-controls={`${id}-viewport`} disabled={atEnd} onClick={() => goTo(current + 1)}>
            <ChevronRight size={15} aria-hidden className="rtl:-scale-x-100" />
          </button>
        </div>
      </div>
      <div
        ref={viewportRef}
        id={`${id}-viewport`}
        tabIndex={0}
        aria-live={rotating ? 'off' : 'polite'}
        aria-label={label}
        role="group"
        className={s.viewport()}
        style={style}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
      >
        {slides.map((child, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={labels.slide(i, total)}
            aria-current={i === current || undefined}
            data-slide-index={i}
            className={s.slide()}
          >
            {child}
          </div>
        ))}
      </div>
      {showDots && total > 1 && (
        <div role="group" aria-label={labels.pickers} className={s.dots()}>
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={s.dot()}
              aria-label={labels.goTo(i, total)}
              aria-current={i === current}
              aria-controls={`${id}-viewport`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
