import * as React from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { transpileModule, JsxEmit, ScriptTarget } from 'typescript';
import { UrlStateProvider, useUrlState, urlParam } from './useUrlState';
import { doc } from './useUrlState.doc';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// Execute the documented providers, mocking only the router boundary. Commits can arrive
// after another keystroke or after another navigation has already been requested.
function routerRecipe(kind: 'React Router' | 'Next.js', commitMs: number, supersede = false) {
  let location = { pathname: '/list', search: '', hash: '', state: null };
  const entries = [location];
  let entry = 0;
  let navigation: ReturnType<typeof setTimeout> | undefined;
  const listeners = new Set<() => void>();
  function useLocation() {
    return React.useSyncExternalStore(
      (listener) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      () => location,
    );
  }
  function commit(next: typeof location) {
    location = next;
    listeners.forEach((listener) => listener());
  }
  const navigate = (next: { pathname: string; search: string; hash: string }, options?: { replace?: boolean }) => {
    if (supersede) clearTimeout(navigation);
    navigation = setTimeout(() => {
      const target = { ...location, ...next };
      if (options?.replace) entries[entry] = target;
      else {
        entries.splice(entry + 1);
        entries.push(target);
        entry++;
      }
      commit(target);
    }, commitMs);
  };
  const routerNavigate = (href: string, replace: boolean) => {
    const next = new URL(href, 'https://example.test');
    navigate({ pathname: next.pathname, search: next.search, hash: next.hash }, { replace });
  };
  const router = {
    push: (href: string) => routerNavigate(href, false),
    replace: (href: string) => routerNavigate(href, true),
  };
  const name = kind === 'React Router' ? 'RouterUrlState' : 'NextUrlState';
  const start = doc.signature.indexOf(`function ${name}(`);
  const end = kind === 'React Router' ? doc.signature.indexOf('// Next.js App Router recipe') : undefined;
  const code = transpileModule(doc.signature.slice(start, end), {
    compilerOptions: { jsx: JsxEmit.React, target: ScriptTarget.ES2022 },
    fileName: 'recipe.tsx',
  }).outputText;
  const bindings = {
    React,
    UrlStateProvider,
    useLayoutEffect: React.useLayoutEffect,
    useEffect: React.useEffect,
    useMemo: React.useMemo,
    useRef: React.useRef,
    useLocation,
    // Declarative React Router navigators can change identity after a commit.
    useNavigate:
      () =>
      (...args: Parameters<typeof navigate>) =>
        navigate(...args),
    usePathname: () => useLocation().pathname,
    useSearchParams: () => new URLSearchParams(useLocation().search),
    useRouter: () => router,
  };
  const Provider = new Function(...Object.keys(bindings), `${code}\nreturn ${name};`)(
    ...Object.values(bindings),
  ) as React.ComponentType<{ children: React.ReactNode }>;
  return {
    Provider,
    getSearch: () => location.search,
    commit,
    back() {
      const previous = entries[entry - 1];
      if (previous) {
        entry--;
        commit(previous);
      }
    },
  };
}

it.each([
  ['React Router', 80],
  ['React Router', 150],
  ['Next.js', 80],
  ['Next.js', 150],
] as const)('%s recipe keeps every keystroke across %i ms commits and still follows navigation', (kind, delay) => {
  vi.useFakeTimers();
  const router = routerRecipe(kind, delay);
  const { result } = renderHook(
    () => {
      const a = useUrlState({ q: urlParam.string() });
      const b = useUrlState({ q: urlParam.string() });
      return { a, b };
    },
    { wrapper: router.Provider },
  );
  for (const q of ['d', 'de', 'dep', 'depl', 'deplo', 'deploy']) {
    act(() => result.current.a[1]((previous) => ({ q: previous.q + q.slice(-1) })));
    // Let each router commit render before the next write, as separate browser tasks do.
    for (let elapsed = 0; elapsed < 100; elapsed += 10) act(() => vi.advanceTimersByTime(10));
    expect(result.current.a[0].q).toBe(q);
    expect(result.current.b[0].q).toBe(q);
  }
  act(() => vi.runAllTimers());
  expect(result.current.a[0].q).toBe('deploy');
  expect(result.current.b[0].q).toBe('deploy');
  expect(new URLSearchParams(router.getSearch()).get('q')).toBe('deploy');
  act(() => result.current.a[1]({ q: 'discard' }));
  act(() => router.commit({ pathname: '/other', search: '?q=restored', hash: '', state: null }));
  act(() => vi.runAllTimers());
  expect(result.current.a[0].q).toBe('restored');
  expect(result.current.b[0].q).toBe('restored');
  expect(router.getSearch()).toBe('?q=restored');
});

it.each(['React Router', 'Next.js'] as const)(
  '%s recipe cancels pending input on another route with the last acknowledged search',
  (kind) => {
    vi.useFakeTimers();
    const router = routerRecipe(kind, 80);
    const { result } = renderHook(() => useUrlState({ q: urlParam.string() }), { wrapper: router.Provider });
    for (const q of ['a', '']) {
      act(() => result.current[1]({ q }));
      act(() => vi.advanceTimersByTime(50));
      act(() => vi.advanceTimersByTime(80));
    }
    act(() => result.current[1]({ q: 'pending' }));
    act(() => router.commit({ pathname: '/other', search: '', hash: '', state: null }));
    act(() => vi.runAllTimers());
    expect(router.getSearch()).toBe('');
    expect(result.current[0].q).toBe('');
  },
);

it.each(['React Router', 'Next.js'] as const)(
  '%s recipe follows Back after an in-flight write was superseded',
  (kind) => {
    vi.useFakeTimers();
    const router = routerRecipe(kind, 150, true);
    const { result } = renderHook(
      () => {
        const schema = { q: urlParam.string(), page: urlParam.integer(1, { history: 'push' }) };
        return { a: useUrlState(schema), b: useUrlState(schema) };
      },
      { wrapper: router.Provider },
    );
    act(() => result.current.a[1]({ q: 'd' }));
    act(() => vi.advanceTimersByTime(50));
    act(() => result.current.a[1]({ q: 'de' }));
    act(() => vi.advanceTimersByTime(50));
    act(() => vi.advanceTimersByTime(150));
    expect(router.getSearch()).toBe('?q=de');
    act(() => result.current.a[1]({ q: 'd' }));
    act(() => vi.advanceTimersByTime(50));
    act(() => vi.advanceTimersByTime(150));
    act(() => result.current.a[1]({ page: 2 }));
    act(() => vi.advanceTimersByTime(50));
    act(() => vi.advanceTimersByTime(150));
    expect(result.current.a[0]).toEqual({ q: 'd', page: 2 });
    act(() => router.back());
    expect(router.getSearch()).toBe('?q=d');
    expect(result.current.a[0]).toEqual({ q: 'd', page: 1 });
    expect(result.current.b[0]).toEqual({ q: 'd', page: 1 });
  },
);
