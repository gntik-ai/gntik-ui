import { act, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { readLocalStorageValue, useLocalStorage, useSessionStorage, type UseStorageOptions } from '../index';

it('reads the default and shares a persisted value with another component in this document', () => {
  const first = renderHook(() => useLocalStorage('runs:density', 'comfortable'));
  const second = renderHook(() => useLocalStorage('runs:density', 'comfortable'));
  expect(first.result.current[0]).toBe('comfortable');
  act(() => first.result.current[1]('compact'));
  expect(localStorage.getItem('runs:density')).toBe('"compact"');
  expect(first.result.current[0]).toBe('compact');
  expect(second.result.current[0]).toBe('compact');
});

it('reads the new key when the argument changes', () => {
  localStorage.setItem('keys:first', '"compact"');
  localStorage.setItem('keys:second', '"spacious"');
  const { result, rerender } = renderHook(({ storageKey }) => useLocalStorage(storageKey, 'comfortable'), {
    initialProps: { storageKey: 'keys:first' },
  });
  expect(result.current[0]).toBe('compact');
  rerender({ storageKey: 'keys:second' });
  expect(result.current[0]).toBe('spacious');
});

it('renders and hydrates the default without server storage access, then restores the stored value', async () => {
  localStorage.setItem('ssr:density', '"compact"');
  const get = vi.spyOn(Storage.prototype, 'getItem');
  function Density() {
    const [value] = useLocalStorage('ssr:density', 'comfortable');
    return <output>{value}</output>;
  }
  const container = document.createElement('div');
  container.innerHTML = renderToString(<Density />);
  expect(container.textContent).toBe('comfortable');
  expect(get).not.toHaveBeenCalled();
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const recoverable = vi.fn();
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, <Density />, { onRecoverableError: recoverable });
    });
    expect(container.textContent).toBe('compact');
    expect(error).not.toHaveBeenCalled();
    expect(recoverable).not.toHaveBeenCalled();
  } finally {
    await act(async () => root?.unmount());
    error.mockRestore();
    get.mockRestore();
  }
});

it('handles a denied storage property and uses memory for later updates', () => {
  const denied = new DOMException('Blocked storage', 'SecurityError');
  const storage = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
    throw denied;
  });
  try {
    const onError = vi.fn();
    const { result } = renderHook(() => useLocalStorage('denied:property', 'comfortable', { onError }));
    expect(result.current[0]).toBe('comfortable');
    act(() => result.current[1]('compact'));
    expect(result.current[0]).toBe('compact');
    expect(onError).toHaveBeenCalledWith(denied);
    expect(readLocalStorageValue('denied:property', 'comfortable', { onError })).toBe('comfortable');
  } finally {
    storage.mockRestore();
  }
});

it('retains a new value after a quota failure even when the previous value can still be read', () => {
  localStorage.setItem('quota:density', '"comfortable"');
  const quota = new DOMException('Full storage', 'QuotaExceededError');
  const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw quota;
  });
  try {
    const onError = vi.fn();
    const { result, rerender } = renderHook(() => useLocalStorage('quota:density', 'spacious', { onError }));
    act(() => result.current[1]('compact'));
    rerender();
    expect(result.current[0]).toBe('compact');
    expect(localStorage.getItem('quota:density')).toBe('"comfortable"');
    expect(onError).toHaveBeenCalledWith(quota);
  } finally {
    set.mockRestore();
  }
});

it.each<[string, UseStorageOptions<string>]>([
  ['{', {}],
  [
    '"compact"',
    {
      deserialize: () => {
        throw new Error('Invalid encoding');
      },
    },
  ],
  ['42', { validate: (value): value is string => typeof value === 'string' }],
])('returns the default without overwriting invalid stored data: %s', (raw, options) => {
  localStorage.setItem('invalid:density', raw);
  const { result } = renderHook(() => useLocalStorage('invalid:density', 'comfortable', options));
  expect(result.current[0]).toBe('comfortable');
  expect(localStorage.getItem('invalid:density')).toBe(raw);
});

it('reads once outside React with the same codecs, validation and safe fallback', () => {
  localStorage.setItem('reader:density', 'compact');
  expect(readLocalStorageValue('reader:density', 'comfortable', { deserialize: (raw) => raw })).toBe('compact');
  expect(readLocalStorageValue('reader:density', 'comfortable')).toBe('comfortable');
  expect(localStorage.getItem('reader:density')).toBe('compact');
  localStorage.setItem('reader:density', '42');
  expect(
    readLocalStorageValue('reader:density', 'comfortable', {
      validate: (value): value is string => typeof value === 'string',
    }),
  ).toBe('comfortable');
});

it('keeps object identity across renders with inline defaults and validation until the raw text changes', () => {
  localStorage.setItem('identity:settings', '{"density":"compact"}');
  const { result, rerender } = renderHook(() =>
    useLocalStorage(
      'identity:settings',
      { density: 'comfortable' },
      {
        validate: (value): value is { density: string } =>
          typeof value === 'object' && value !== null && 'density' in value,
      },
    ),
  );
  const initial = result.current[0];
  rerender();
  expect(result.current[0]).toBe(initial);
  act(() =>
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'identity:settings',
        newValue: '{"density":"spacious"}',
      }),
    ),
  );
  expect(result.current[0]).toEqual({ density: 'spacious' });
  expect(result.current[0]).not.toBe(initial);
});

it('shares session state within the document but ignores storage events and localStorage', () => {
  sessionStorage.setItem('session:density', '"compact"');
  localStorage.setItem('session:density', '"spacious"');
  const first = renderHook(() => useSessionStorage('session:density', 'comfortable'));
  const second = renderHook(() => useSessionStorage('session:density', 'comfortable'));
  const local = renderHook(() => useLocalStorage('session:density', 'comfortable'));
  expect(first.result.current[0]).toBe('compact');
  expect(local.result.current[0]).toBe('spacious');
  act(() =>
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'session:density',
        newValue: '"other document"',
        storageArea: sessionStorage,
      }),
    ),
  );
  expect(first.result.current[0]).toBe('compact');
  expect(local.result.current[0]).toBe('spacious');
  act(() => first.result.current[1]('comfortable'));
  expect(second.result.current[0]).toBe('comfortable');
  expect(sessionStorage.getItem('session:density')).toBe('"comfortable"');
  expect(local.result.current[0]).toBe('spacious');
  sessionStorage.clear();
});

it('applies cross-tab writes and clear while sync:false ignores them on the same key', () => {
  const synced = renderHook(() => useLocalStorage('tabs:density', 'comfortable'));
  const isolated = renderHook(() => useLocalStorage('tabs:density', 'comfortable', { sync: false }));
  act(() =>
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'tabs:density',
        newValue: '"spacious"',
        storageArea: localStorage,
      }),
    ),
  );
  expect(synced.result.current[0]).toBe('spacious');
  expect(isolated.result.current[0]).toBe('comfortable');
  act(() => window.dispatchEvent(new StorageEvent('storage', { key: null, storageArea: localStorage })));
  expect(synced.result.current[0]).toBe('comfortable');
  act(() => isolated.result.current[1]('compact'));
  expect(synced.result.current[0]).toBe('compact');
});

it('applies both updaters in one handler and removes the persisted value', () => {
  const { result } = renderHook(() => useLocalStorage('counter:batch', 0));
  act(() => {
    result.current[1]((n) => n + 1);
    result.current[1]((n) => n + 1);
  });
  expect(result.current[0]).toBe(2);
  expect(localStorage.getItem('counter:batch')).toBe('2');
  act(() => result.current[2]());
  expect(result.current[0]).toBe(0);
  expect(localStorage.getItem('counter:batch')).toBeNull();
});

it('starts a newly mounted sync:false consumer at the latest value without updating an existing isolated consumer', () => {
  const shared = renderHook(() => useLocalStorage('late:density', 'comfortable'));
  const earlier = renderHook(() => useLocalStorage('late:density', 'comfortable', { sync: false }));
  act(() => window.dispatchEvent(new StorageEvent('storage', { key: 'late:density', newValue: '"spacious"' })));
  expect(shared.result.current[0]).toBe('spacious');
  const later = renderHook(() => useLocalStorage('late:density', 'comfortable', { sync: false }));
  expect(later.result.current[0]).toBe('spacious');
  earlier.rerender();
  expect(earlier.result.current[0]).toBe('comfortable');
  act(() => shared.result.current[1]('compact'));
  expect(earlier.result.current[0]).toBe('compact');
  expect(later.result.current[0]).toBe('compact');
});

it('keeps updates in memory and reports denied reads and quota errors', () => {
  const denied = new DOMException('Blocked storage', 'SecurityError');
  const quota = new DOMException('Full storage', 'QuotaExceededError');
  const onError = vi.fn();
  const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw denied;
  });
  const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw quota;
  });
  try {
    const { result } = renderHook(() => useLocalStorage('errors:density', 'comfortable', { onError }));
    expect(result.current[0]).toBe('comfortable');
    expect(onError).toHaveBeenCalledWith(denied);
    act(() => result.current[1]('compact'));
    expect(result.current[0]).toBe('compact');
    expect(onError).toHaveBeenCalledWith(quota);
  } finally {
    get.mockRestore();
    set.mockRestore();
  }
});
