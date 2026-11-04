import type { HookDoc } from '../doc';

export const doc: HookDoc = {
  name: 'useUrlState',
  status: 'stable',
  also: ['urlParam', 'UrlStateProvider'],
  description:
    'Typed URL query state shared across hooks: [values, setValues]. setValues merges a patch or updater immediately, ignoring undefined entries; throttleMs (50 by default) batches history writes. urlParam.string(default?, options?), integer(default?, { min, max, history }), boolean(default?, options?), enum(values, default, options?), array(item, options?) and custom({ parse, serialize, default, history }) infer values without casts. string() defaults to empty text, integer() to 1, boolean() to false and array() to []. Invalid scalars use defaults; invalid array items are dropped. Scalars read the first repeated key. Parsing never rewrites the URL. A write removes all copies of the changed key, omits serialized defaults, preserves foreign keys and hashes and skips unchanged searches. Arrays inherit item history unless their own option overrides it. History precedence is call option, then key option, then replace; any push in a batch makes one push. prefix namespaces keys. Keep schemas/codecs consistent per prefixed key; values retain identity until the search changes. Popstate discards pending writes; unmount cancels the last subscriber’s write and browser writes never land on a different pathname. History SecurityError is caught and values stay in memory until navigation. Keep keys and values short to limit URL length. Memoize custom adapters and use UrlStateProvider or options.adapter (the option wins). With a router, use a router adapter so its hooks stay current; recipes below notify on router navigation, preserve path/hash and update their own readable snapshot synchronously. An acknowledgement must preserve the latest requested snapshot; older commits must not reset it. External navigation updates the snapshot and notifies subscribers. The recipes track outstanding requests to distinguish acknowledgements from navigation, removing superseded requests through each acknowledged write. The live preview uses an isolated memory adapter.',
  server:
    'The default browser adapter returns defaults on the server and initial hydration, then restores the URL; deep-linked lists may briefly show unfiltered rows. Custom adapters return getSearch() on the server: supply the same initial search for hydration. The memory example starts with an empty query (shown as `Empty`) and page `1`.',
  signature: `useUrlState(schema, { prefix?, throttleMs?: 50, adapter? }): [values, setValues]
setValues({ q: 'api' }, { history: 'replace' })
setValues(previous => ({ page: previous.page + 1 }))

// React Router recipe (imports belong to the app, not the kit).
import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { UrlStateProvider, type UrlStateAdapter } from '@gntik-ai/ui/hooks';
function RouterUrlState({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  useLayoutEffect(() => { navigateRef.current = navigate; }, [navigate]);
  const current = useRef(location);
  const listeners = useRef(new Set<() => void>());
  const writes = useRef<Array<{ pathname: string; search: string }>>([]);
  const adapter = useMemo<UrlStateAdapter>(() => ({
    getSearch: () => current.current.search,
    subscribe(listener) {
      listeners.current.add(listener);
      return () => { listeners.current.delete(listener); };
    },
    setSearch(search, mode) {
      const { pathname, hash, state } = current.current;
      writes.current.push({ pathname, search });
      current.current = { ...current.current, search };
      navigateRef.current({ pathname, search, hash }, { replace: mode === 'replace', state });
    },
  }), []);
  useLayoutEffect(() => {
    const own = writes.current.findIndex(write =>
      write.pathname === location.pathname && write.search === location.search);
    // A newer commit also retires requests the router superseded.
    if (own >= 0) writes.current.splice(0, own + 1);
    else {
      writes.current = [];
      current.current = location;
    }
    listeners.current.forEach(listener => listener());
  }, [location]);
  return <UrlStateProvider adapter={adapter}>{children}</UrlStateProvider>;
}

// Next.js App Router recipe: put this client provider under Suspense when
// useSearchParams needs it. Server and client must receive the same query.
'use client';
import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { UrlStateProvider, type UrlStateAdapter } from '@gntik-ai/ui/hooks';
function NextUrlState({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams().toString();
  const search = params ? '?' + params : '';
  const current = useRef({ pathname, search });
  const listeners = useRef(new Set<() => void>());
  const writes = useRef<Array<{ pathname: string; search: string }>>([]);
  const adapter = useMemo<UrlStateAdapter>(() => ({
    getSearch: () => current.current.search,
    subscribe(listener) {
      listeners.current.add(listener);
      return () => { listeners.current.delete(listener); };
    },
    setSearch(next, mode) {
      writes.current.push({ pathname: current.current.pathname, search: next });
      current.current = { ...current.current, search: next };
      router[mode](current.current.pathname + next + window.location.hash, { scroll: false });
    },
  }), [router]);
  useEffect(() => {
    const own = writes.current.findIndex(write =>
      write.pathname === pathname && write.search === search);
    // A newer commit also retires requests the router superseded.
    if (own >= 0) writes.current.splice(0, own + 1);
    else {
      writes.current = [];
      current.current = { pathname, search };
    }
    listeners.current.forEach(listener => listener());
  }, [pathname, search]);
  return <UrlStateProvider adapter={adapter}>{children}</UrlStateProvider>;
}`,
};
