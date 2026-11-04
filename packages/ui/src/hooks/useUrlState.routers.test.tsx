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
function routerRecipe(kind: 'React Router' | 'Next.js', commitMs: number) {
  let location = { pathname: '/list', search: '', hash: '', state: null };
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
  const navigate = (next: { pathname: string; search: string; hash: string }) => {
    setTimeout(() => commit({ ...location, ...next }), commitMs);
  };
  const routerNavigate = (href: string) => {
    const next = new URL(href, 'https://example.test');
    navigate({ pathname: next.pathname, search: next.search, hash: next.hash });
  };
  const router = { push: routerNavigate, replace: routerNavigate };
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
    useNavigate: () => (next: Parameters<typeof navigate>[0]) => navigate(next),
    usePathname: () => useLocation().pathname,
    useSearchParams: () => new URLSearchParams(useLocation().search),
    useRouter: () => router,
  };
  const Provider = new Function(...Object.keys(bindings), `${code}\nreturn ${name};`)(
    ...Object.values(bindings),
  ) as React.ComponentType<{ children: React.ReactNode }>;
  return { Provider, getSearch: () => location.search, commit };
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
