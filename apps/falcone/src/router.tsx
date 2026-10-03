// A tiny history router: the current path, navigate(), a router link for LinkProvider and a
// matcher for ":param" patterns. Plain same-origin <a href="/…"> clicks are routed too, so kit
// parts that render bare anchors (breadcrumbs, status pages) stay client-side.
import { useEffect, useSyncExternalStore, type ComponentPropsWithRef, type MouseEvent } from 'react';

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function navigate(href: string, { replace = false } = {}) {
  if (href === window.location.pathname + window.location.search) return;
  if (replace) window.history.replaceState(null, '', href);
  else window.history.pushState(null, '', href);
  window.scrollTo(0, 0);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

/** The current pathname (no trailing slash except the root). */
export function usePath() {
  const path = useSyncExternalStore(subscribe, () => window.location.pathname);
  return path.length > 1 ? path.replace(/\/+$/, '') : path;
}

const isPlainLeftClick = (e: MouseEvent | globalThis.MouseEvent) =>
  e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/** Router link handed to the kit's LinkProvider. */
export function RouterLink({ href = '', onClick, target, ...props }: ComponentPropsWithRef<'a'>) {
  return (
    <a
      href={href}
      target={target}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !isPlainLeftClick(event) || (target && target !== '_self') || !href.startsWith('/')) return;
        event.preventDefault();
        navigate(href);
      }}
    />
  );
}

/** Routes plain internal anchors that bypass the LinkProvider. */
export function useAnchorInterception() {
  useEffect(() => {
    const onClick = (event: globalThis.MouseEvent) => {
      if (event.defaultPrevented || !isPlainLeftClick(event)) return;
      const anchor = (event.target as Element | null)?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute('href') ?? '';
      if (!href.startsWith('/') || href.startsWith('//') || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      event.preventDefault();
      navigate(href);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

/** Matches "/projects/:id" against a path; returns the params or null. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('/').filter(Boolean);
  const rest = p[p.length - 1] === '*';
  if (rest ? s.length < p.length - 1 : s.length !== p.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    const seg = p[i] ?? '';
    if (seg === '*') {
      params['*'] = s.slice(i).join('/');
      break;
    }
    const value = s[i];
    if (value === undefined) return null;
    if (seg.startsWith(':')) params[seg.slice(1)] = decodeURIComponent(value);
    else if (seg !== value) return null;
  }
  return params;
}
