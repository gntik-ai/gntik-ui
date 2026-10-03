import { useEffect, useEffectEvent, useId, useState, type HTMLAttributes, type MouseEvent, type ReactNode, type Ref, type RefObject } from 'react';
import { cn } from '../../utils/cn';
import { useI18n } from '../../i18n/I18nProvider';
import { outlineVariants } from './docs-layout.variants';

export interface OutlineItem {
  /** `id` of the heading in the article. */
  id: string;
  label: ReactNode;
  /** Heading depth: 2 (section) or 3 (sub-section, indented). */
  level?: 2 | 3;
}

export interface OutlineProps extends Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'> {
  className?: string;
  ref?: Ref<HTMLElement>;
  items: OutlineItem[];
  /** Heading and accessible name. */
  label?: string;
  /** Hide the visible heading (e.g. inside a Collapsible whose trigger already says it). */
  hideHeading?: boolean;
  /** Render as a `<nav>` landmark (default) or a plain `<div>` (when nested in another named region). */
  landmark?: boolean;
  /** Current section (controlled). Without it, scroll-spy tracks the heading in view. */
  activeId?: string;
  onActiveChange?: (id: string) => void;
  /** Scroll container the headings move in (the layout's main column). Defaults to the viewport. */
  scrollRootRef?: RefObject<Element | null>;
  /** Called after a link moved focus to its heading. */
  onNavigate?: (id: string) => void;
}

const NATIVELY_FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex]';

/**
 * Table of contents with scroll-spy: the link of the heading in view gets aria-current="location".
 * Activating a link moves focus (not just scroll) to the heading. IntersectionObserver is optional:
 * without it (jsdom, old browsers) the active item only follows clicks.
 */
export function Outline({
  items,
  label: labelProp,
  hideHeading = false,
  landmark = true,
  activeId: activeProp,
  onActiveChange,
  scrollRootRef,
  onNavigate,
  className,
  ref,
  ...props
}: OutlineProps) {
  const { t } = useI18n();
  const label = labelProp ?? t('nav.onThisPage');
  const [inner, setInner] = useState<string | undefined>(items[0]?.id);
  const active = activeProp ?? inner;
  const headingId = useId();
  const s = outlineVariants();
  const ids = items.map((i) => i.id).join('|');
  const spy = useEffectEvent((id: string) => {
    setInner(id);
    onActiveChange?.(id);
  });

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const targets = ids
      .split('|')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const first = targets.find((t) => visible.has(t.id));
        if (first) spy(first.id);
      },
      { root: scrollRootRef?.current ?? null, rootMargin: '0px 0px -65% 0px', threshold: 0 },
    );
    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [ids, scrollRootRef]);

  function go(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    if (!target.matches(NATIVELY_FOCUSABLE)) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView?.({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    setInner(id);
    onActiveChange?.(id);
    onNavigate?.(id);
    try {
      history.replaceState(history.state, '', `#${id}`);
    } catch {}
  }

  const list = (
    <ul className={s.list()}>
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={item.id === active ? 'location' : undefined}
            className={outlineVariants({ level: item.level ?? 2 }).link()}
            onClick={(e) => go(e, item.id)}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );

  const heading = !hideHeading && (
    <p id={headingId} className={s.heading()}>
      {label}
    </p>
  );
  if (!landmark) {
    return (
      <div ref={ref as Ref<HTMLDivElement> | undefined} className={cn(s.root(), className)} {...props}>
        {heading}
        {list}
      </div>
    );
  }
  return (
    <nav
      ref={ref}
      aria-labelledby={hideHeading ? undefined : headingId}
      aria-label={hideHeading ? label : undefined}
      className={cn(s.root(), className)}
      {...props}
    >
      {heading}
      {list}
    </nav>
  );
}
