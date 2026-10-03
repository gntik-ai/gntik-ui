import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type { AnchorHTMLAttributes, MouseEvent, Ref } from 'react';
import { cn } from '../../utils/cn';
import { skipLinkVariants, visuallyHiddenVariants } from './visually-hidden.variants';

export interface VisuallyHiddenProps extends Omit<useRender.ComponentProps<'span'>, 'className'> {
  className?: string;
  /** Becomes visible while it (or something inside it) has focus — for skip links and similar. */
  focusable?: boolean;
}

/** Content for screen readers only: hidden visually, kept in the accessibility tree. */
export function VisuallyHidden({ focusable, className, render, ref, ...props }: VisuallyHiddenProps) {
  return useRender({
    defaultTagName: 'span',
    render,
    ref,
    props: mergeProps<'span'>(props, { className: cn(visuallyHiddenVariants({ focusable }), className) }),
  });
}

const NATIVELY_FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex]';

export interface SkipLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'> {
  className?: string;
  ref?: Ref<HTMLAnchorElement>;
  /** `id` of the element to jump to (usually `<main>`). */
  targetId: string;
}

/**
 * First focusable element on the page: hidden until Tab reaches it, then pinned top-left.
 * Activating it moves focus (not just scroll) to the target, which gets `tabindex="-1"` if needed.
 */
export function SkipLink({ targetId, className, children = 'Skip to main content', onClick, ...props }: SkipLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const target = document.getElementById(targetId);
    if (!target) return;
    event.preventDefault();
    if (!target.matches(NATIVELY_FOCUSABLE)) target.setAttribute('tabindex', '-1');
    target.focus();
    target.scrollIntoView?.({ block: 'start' });
    try {
      history.replaceState(history.state, '', `#${targetId}`);
    } catch {}
  }
  return (
    <a href={`#${targetId}`} className={cn(skipLinkVariants(), className)} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
