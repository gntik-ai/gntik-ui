import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseChatScrollOptions {
  /** Distance from the bottom (px) still treated as "at the bottom". */
  threshold?: number;
}

export interface UseChatScrollResult {
  /** Callback ref for the scrolling element. */
  scrollRef: (el: HTMLElement | null) => void;
  /** Callback ref for the content inside it (watched for growth, e.g. streamed tokens). */
  contentRef: (el: HTMLElement | null) => void;
  /** True while the viewport is pinned to the latest message. */
  isAtBottom: boolean;
  /** Scrolls to the latest message and re-pins auto-scroll. */
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

/** Imperative DOM write kept outside the hook (state values must not be mutated in place). */
function pinToBottom(el: HTMLElement) {
  el.scrollTop = el.scrollHeight;
}

function distanceFromBottom(el: HTMLElement) {
  return el.scrollHeight - el.scrollTop - el.clientHeight;
}

/**
 * Auto-scroll for a chat thread that respects the reader: new content keeps the view pinned
 * to the bottom only while the user is already there. Scrolling up unpins it (and
 * `isAtBottom` turns false, so a "scroll to latest" button can show); `scrollToBottom()`
 * pins it again.
 */
export function useChatScroll({ threshold = 48 }: UseChatScrollOptions = {}): UseChatScrollResult {
  const [scrollEl, setScrollEl] = useState<HTMLElement | null>(null);
  const [contentEl, setContentEl] = useState<HTMLElement | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const pinned = useRef(true);
  const lastTop = useRef(0);

  useEffect(() => {
    if (!scrollEl) return;
    lastTop.current = scrollEl.scrollTop;
    const onScroll = () => {
      const top = scrollEl.scrollTop;
      // Re-pin at the bottom; unpin only when the reader moves up (a smooth programmatic
      // scroll towards the bottom passes through "not at bottom" without unpinning).
      if (distanceFromBottom(scrollEl) <= threshold) pinned.current = true;
      else if (top < lastTop.current) pinned.current = false;
      lastTop.current = top;
      setIsAtBottom(pinned.current);
    };
    scrollEl.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollEl.removeEventListener('scroll', onScroll);
  }, [scrollEl, threshold]);

  useEffect(() => {
    if (!scrollEl) return;
    const follow = () => {
      if (!pinned.current) return;
      pinToBottom(scrollEl);
      lastTop.current = scrollEl.scrollTop;
    };
    follow();
    const target = contentEl ?? scrollEl;
    const mo = new MutationObserver(follow);
    mo.observe(target, { childList: true, subtree: true, characterData: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(follow) : undefined;
    ro?.observe(target);
    return () => {
      mo.disconnect();
      ro?.disconnect();
    };
  }, [scrollEl, contentEl]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      if (!scrollEl) return;
      pinned.current = true;
      setIsAtBottom(true);
      const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (typeof scrollEl.scrollTo === 'function') {
        scrollEl.scrollTo({ top: scrollEl.scrollHeight, behavior: reduce ? 'auto' : behavior });
      } else {
        pinToBottom(scrollEl);
      }
    },
    [scrollEl],
  );

  return { scrollRef: setScrollEl, contentRef: setContentEl, isAtBottom, scrollToBottom };
}
