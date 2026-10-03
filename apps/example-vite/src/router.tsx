import { useSyncExternalStore, type ComponentPropsWithRef, type MouseEvent } from 'react';

/**
 * A tiny history router: enough for the starter. Swap it for React Router / TanStack Router
 * when the product grows — only `RouterLink` (given to LinkProvider) and `navigate` change.
 */
const NAV_EVENT = 'app:navigate';

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAV_EVENT, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAV_EVENT, onChange);
  };
};

/** The current pathname (re-renders on navigation). */
export function usePath() {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}

export function navigate(to: string, { replace = false } = {}) {
  if (to === window.location.pathname + window.location.search) return;
  if (replace) window.history.replaceState(null, '', to);
  else window.history.pushState(null, '', to);
  window.scrollTo(0, 0);
  window.dispatchEvent(new Event(NAV_EVENT));
}

const isInternal = (href: string) => href.startsWith('/') && !href.startsWith('//');

/** Router link for the kit's LinkProvider: internal hrefs navigate on the client. */
export function RouterLink({ href = '', onClick, ...props }: ComponentPropsWithRef<'a'>) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (props.target && props.target !== '_self') return;
    if (!isInternal(href)) return;
    e.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={handle} {...props} />;
}

/** Matches `/projects/:id`-style patterns; returns the params or null. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    const part = p[i] ?? '';
    const seg = s[i] ?? '';
    if (part.startsWith(':')) params[part.slice(1)] = decodeURIComponent(seg);
    else if (part !== seg) return null;
  }
  return params;
}
