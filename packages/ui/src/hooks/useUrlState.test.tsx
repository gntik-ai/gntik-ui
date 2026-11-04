import { act, cleanup, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { UrlStateProvider, type UrlStateAdapter, useUrlState, urlParam } from './useUrlState';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it('infers typed values from a shared link without writing history', () => {
  history.replaceState(null, '', '/?q=api&status=failed&status=running&page=3');
  const replace = vi.spyOn(history, 'replaceState');
  const push = vi.spyOn(history, 'pushState');
  const { result } = renderHook(() =>
    useUrlState({
      q: urlParam.string(),
      status: urlParam.array(urlParam.string()),
      page: urlParam.integer(1, { history: 'push', min: 1 }),
    }),
  );
  const value: { q: string; status: string[]; page: number } = result.current[0];
  expect(value).toEqual({ q: 'api', status: ['failed', 'running'], page: 3 });
  expect(replace).not.toHaveBeenCalled();
  expect(push).not.toHaveBeenCalled();
});

it.each(['abc', '-2', '1e3', '3.5', ''])(
  'reads invalid page %s and failed custom values as defaults, dropping invalid array items',
  (page) => {
    history.replaceState(
      null,
      '',
      `/?page=${page}&custom=bad&status=failed&status=unknown&status=running&enabled=false&tab=bad`,
    );
    const replace = vi.spyOn(history, 'replaceState');
    const { result } = renderHook(() =>
      useUrlState({
        page: urlParam.integer(1, { min: 1 }),
        custom: urlParam.custom({
          default: 'safe',
          parse: () => {
            throw new Error('Invalid');
          },
          serialize: String,
        }),
        status: urlParam.array(urlParam.enum(['failed', 'running'], 'running')),
        enabled: urlParam.boolean(true),
        tab: urlParam.enum(['all', 'recent'], 'all'),
      }),
    );
    expect(result.current[0]).toEqual({
      page: 1,
      custom: 'safe',
      status: ['failed', 'running'],
      enabled: false,
      tab: 'all',
    });
    expect(replace).not.toHaveBeenCalled();
  },
);

it('shares pending values immediately, coalesces patches and omits defaults while preserving foreign params and hash', () => {
  vi.useFakeTimers();
  history.replaceState({ kept: true }, '', '/list?q=api&utm_source=x#details');
  const replace = vi.spyOn(history, 'replaceState');
  const push = vi.spyOn(history, 'pushState');
  const schema = { q: urlParam.string(), page: urlParam.integer(1) };
  const a = renderHook(() => useUrlState(schema));
  const b = renderHook(() => useUrlState(schema));
  act(() => {
    a.result.current[1]({ q: '' });
    b.result.current[1]((prev) => ({ page: prev.page + 1 }));
  });
  expect(a.result.current[0]).toEqual({ q: '', page: 2 });
  expect(b.result.current[0]).toEqual(a.result.current[0]);
  expect(replace).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(50));
  expect(replace).toHaveBeenCalledTimes(1);
  expect(push).not.toHaveBeenCalled();
  expect(location.pathname + location.search + location.hash).toBe('/list?utm_source=x&page=2#details');
  expect(history.state).toEqual({ kept: true });
  act(() => a.result.current[1]({ q: '', page: 2 }));
  act(() => vi.advanceTimersByTime(50));
  expect(replace).toHaveBeenCalledTimes(1);
});

it('uses call then key then replace history precedence and latches one push in a batch', () => {
  vi.useFakeTimers();
  history.replaceState(null, '', '/?page=3');
  const push = vi.spyOn(history, 'pushState');
  const replace = vi.spyOn(history, 'replaceState');
  const { result } = renderHook(() =>
    useUrlState({ q: urlParam.string(), page: urlParam.integer(1, { history: 'push' }) }),
  );
  act(() => {
    result.current[1]({ page: 4 });
    result.current[1]({ q: 'api' });
  });
  act(() => vi.advanceTimersByTime(50));
  expect(push).toHaveBeenCalledTimes(1);
  expect(replace).not.toHaveBeenCalled();
  act(() => result.current[1]({ page: 5 }, { history: 'replace' }));
  act(() => vi.advanceTimersByTime(50));
  expect(replace).toHaveBeenCalledTimes(1);
  act(() => result.current[1]({ q: 'logs' }, { history: 'push' }));
  act(() => vi.advanceTimersByTime(50));
  expect(push).toHaveBeenCalledTimes(2);
});

it('drops a delayed write after moving to another route', () => {
  vi.useFakeTimers();
  history.replaceState(null, '', '/old?q=api');
  const { result } = renderHook(() => useUrlState({ q: urlParam.string() }));
  act(() => result.current[1]({ q: 'pending' }));
  history.replaceState(null, '', '/new?q=other');
  const replace = vi.spyOn(history, 'replaceState');
  act(() => vi.advanceTimersByTime(50));
  expect(location.pathname + location.search).toBe('/new?q=other');
  expect(result.current[0].q).toBe('other');
  expect(replace).not.toHaveBeenCalled();
});

it('replaces while typing and every consumer sees each value before the write lands', () => {
  vi.useFakeTimers();
  history.replaceState(null, '', '/');
  const replace = vi.spyOn(history, 'replaceState');
  const push = vi.spyOn(history, 'pushState');
  const a = renderHook(() => useUrlState({ q: urlParam.string() }));
  const b = renderHook(() => useUrlState({ q: urlParam.string() }));
  for (const q of ['d', 'de', 'dep', 'depl', 'deplo', 'deploy']) {
    act(() => a.result.current[1]({ q }));
    expect(a.result.current[0].q).toBe(q);
    expect(b.result.current[0].q).toBe(q);
    expect(new URLSearchParams(location.search).get('q')).not.toBe(q);
    act(() => vi.advanceTimersByTime(50));
  }
  expect(push).not.toHaveBeenCalled();
  expect(replace.mock.calls.length).toBeLessThanOrEqual(6);
  expect(new URLSearchParams(location.search).get('q')).toBe('deploy');
});

it('restores every consumer on Back and discards a pending write on popstate', async () => {
  history.replaceState(null, '', '/?page=3');
  const schema = { page: urlParam.integer(1, { history: 'push' }) };
  const a = renderHook(() => useUrlState(schema, { throttleMs: 0 }));
  const b = renderHook(() => useUrlState(schema));
  await act(async () => {
    a.result.current[1]({ page: 4 });
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  expect(a.result.current[0].page).toBe(4);
  await act(async () => {
    const popped = new Promise<void>((resolve) => window.addEventListener('popstate', () => resolve(), { once: true }));
    history.back();
    await popped;
  });
  expect(a.result.current[0].page).toBe(3);
  expect(b.result.current[0].page).toBe(3);
  vi.useFakeTimers();
  act(() => a.result.current[1]({ page: 5 }));
  act(() => window.dispatchEvent(new PopStateEvent('popstate')));
  const replace = vi.spyOn(history, 'replaceState');
  const push = vi.spyOn(history, 'pushState');
  act(() => vi.runAllTimers());
  expect(a.result.current[0].page).toBe(3);
  expect(replace).not.toHaveBeenCalled();
  expect(push).not.toHaveBeenCalled();
});

it.each(['replaceState', 'pushState'] as const)('keeps failed %s writes in shared memory', (method) => {
  vi.useFakeTimers();
  history.replaceState(null, '', '/');
  vi.spyOn(history, method).mockImplementation(() => {
    throw new DOMException('Rate limit', 'SecurityError');
  });
  const a = renderHook(() => useUrlState({ q: urlParam.string() }));
  const b = renderHook(() => useUrlState({ q: urlParam.string() }));
  act(() => a.result.current[1]({ q: 'retained' }, { history: method === 'pushState' ? 'push' : 'replace' }));
  act(() => vi.advanceTimersByTime(50));
  expect(a.result.current[0].q).toBe('retained');
  expect(b.result.current[0].q).toBe('retained');
  expect(location.search).toBe('');
});

it('cancels writes when its last subscriber leaves and cleans up the listener', () => {
  vi.useFakeTimers();
  history.replaceState(null, '', '/');
  const remove = vi.spyOn(window, 'removeEventListener');
  const replace = vi.spyOn(history, 'replaceState');
  const { result, unmount } = renderHook(() => useUrlState({ q: urlParam.string() }));
  act(() => result.current[1]({ q: 'discard' }));
  unmount();
  act(() => vi.runAllTimers());
  expect(replace).not.toHaveBeenCalled();
  expect(remove.mock.calls.some(([name]) => name === 'popstate')).toBe(true);
});

function memoryAdapter(initial: string): UrlStateAdapter {
  let search = initial;
  const listeners = new Set<() => void>();
  return {
    getSearch: () => search,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setSearch(next) {
      search = next;
      listeners.forEach((listener) => listener());
    },
  };
}

it('uses only the memoized adapter, honors option over provider, and keeps prefixes isolated', () => {
  vi.useFakeTimers();
  const adapter = memoryAdapter('?a.q=logs&b.q=other');
  const unused = memoryAdapter('?a.q=wrong');
  const add = vi.spyOn(window, 'addEventListener');
  const replace = vi.spyOn(history, 'replaceState');
  const push = vi.spyOn(history, 'pushState');
  const a = renderHook(() => useUrlState({ q: urlParam.string() }, { adapter, prefix: 'a.' }), {
    wrapper: ({ children }) => <UrlStateProvider adapter={unused}>{children}</UrlStateProvider>,
  });
  const b = renderHook(() => useUrlState({ q: urlParam.string() }, { prefix: 'b.' }), {
    wrapper: ({ children }) => <UrlStateProvider adapter={adapter}>{children}</UrlStateProvider>,
  });
  expect(a.result.current[0].q).toBe('logs');
  act(() => a.result.current[1]({ q: 'errors' }));
  act(() => vi.advanceTimersByTime(50));
  expect(new URLSearchParams(adapter.getSearch()).get('a.q')).toBe('errors');
  expect(b.result.current[0].q).toBe('other');
  expect(replace).not.toHaveBeenCalled();
  expect(push).not.toHaveBeenCalled();
  expect(add.mock.calls.some(([name]) => name === 'popstate')).toBe(false);
});

it('keeps value identity with inline schemas until search changes; compares object defaults by serialization', () => {
  vi.useFakeTimers();
  const adapter = memoryAdapter('?q=first&q=second&count=2');
  const { result, rerender } = renderHook(() =>
    useUrlState(
      {
        q: urlParam.string(),
        count: urlParam.custom({
          default: { n: 1 },
          parse: (raw) => ({ n: Number(raw) }),
          serialize: (value) => String(value.n),
        }),
      },
      { adapter },
    ),
  );
  const initial = result.current[0];
  expect(initial.q).toBe('first');
  rerender();
  expect(result.current[0]).toBe(initial);
  act(() => result.current[1]({ q: 'single', count: { n: 1 } }));
  act(() => vi.advanceTimersByTime(50));
  expect(adapter.getSearch()).toBe('?q=single');
  expect(result.current[0]).not.toBe(initial);
});

it('removes the last parameter without leaving a question mark', () => {
  vi.useFakeTimers();
  history.replaceState(null, '', '/list?q=api#details');
  const { result } = renderHook(() => useUrlState({ q: urlParam.string() }));
  act(() => result.current[1]({ q: '' }));
  act(() => vi.advanceTimersByTime(50));
  expect(location.pathname + location.search + location.hash).toBe('/list#details');
});

it('renders defaults on the server and hydrates a deep link without mismatches', async () => {
  history.replaceState(null, '', '/?q=api');
  const seen: string[] = [];
  function Example() {
    const [value] = useUrlState({ q: urlParam.string('default') });
    seen.push(value.q);
    return <span>{value.q}</span>;
  }
  const container = document.createElement('div');
  container.innerHTML = renderToString(<Example />);
  expect(container.textContent).toBe('default');
  const recover = vi.fn();
  const root = hydrateRoot(container, <Example />, { onRecoverableError: recover });
  await act(async () => {});
  expect(container.textContent).toBe('api');
  expect(seen.slice(0, 2)).toEqual(['default', 'default']);
  expect(recover).not.toHaveBeenCalled();
  act(() => root.unmount());
  function Custom() {
    const [value] = useUrlState({ q: urlParam.string() }, { adapter: memoryAdapter('?q=custom') });
    return <span>{value.q}</span>;
  }
  expect(renderToString(<Custom />)).toContain('custom');
});

it('makes no history call for an unchanged value even when a foreign param has noncanonical encoding', () => {
  vi.useFakeTimers();
  history.replaceState(null, '', '/?q=api&utm_source=a%20b');
  const replace = vi.spyOn(history, 'replaceState');
  const { result } = renderHook(() => useUrlState({ q: urlParam.string() }));
  act(() => result.current[1]({ q: 'api' }));
  act(() => vi.advanceTimersByTime(50));
  expect(replace).not.toHaveBeenCalled();
});

it('does not write when a batch returns to its original search', () => {
  vi.useFakeTimers();
  history.replaceState(null, '', '/?q=api');
  const replace = vi.spyOn(history, 'replaceState');
  const { result } = renderHook(() => useUrlState({ q: urlParam.string() }));
  act(() => {
    result.current[1]({ q: 'temporary' });
    result.current[1]({ q: 'api' });
  });
  act(() => vi.advanceTimersByTime(50));
  expect(replace).not.toHaveBeenCalled();
});
