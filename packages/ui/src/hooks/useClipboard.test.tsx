import { act, renderHook, cleanup, screen } from '@testing-library/react';
import { LiveAnnouncer } from '../components/LiveAnnouncer';
import { useClipboard } from './useClipboard';

function clipboard(writeText = vi.fn().mockResolvedValue(undefined), fallback = false) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  Object.defineProperty(document, 'execCommand', { configurable: true, value: vi.fn(() => fallback) });
  return writeText;
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

it('copies text and resets success after the default 2000ms', async () => {
  vi.useFakeTimers();
  const write = clipboard();
  const { result } = renderHook(() => useClipboard());
  let success: boolean | undefined;
  await act(async () => {
    success = await result.current.copy('abc');
  });
  expect(success).toBe(true);
  expect(write).toHaveBeenCalledWith('abc');
  expect(result.current).toMatchObject({ status: 'copied', copied: true, error: undefined });
  act(() => vi.advanceTimersByTime(1999));
  expect(result.current.copied).toBe(true);
  act(() => vi.advanceTimersByTime(1));
  expect(result.current).toMatchObject({ status: 'idle', copied: false, error: undefined });
});

it('uses the fallback and reports the original rejection once when both paths fail', async () => {
  const denied = new Error('denied');
  clipboard(vi.fn().mockRejectedValue(denied), true);
  const onCopy = vi.fn();
  const onError = vi.fn();
  const { result } = renderHook(() => useClipboard({ onCopy, onError }));
  await act(async () => {
    expect(await result.current.copy('abc')).toBe(true);
  });
  expect(document.execCommand).toHaveBeenCalledWith('copy');
  expect(onCopy).toHaveBeenCalledExactlyOnceWith('abc');
  clipboard(vi.fn().mockRejectedValue(denied));
  await act(async () => {
    expect(await result.current.copy('abc')).toBe(false);
  });
  expect(result.current).toMatchObject({ status: 'failed', copied: false, error: denied });
  expect(onError).toHaveBeenCalledExactlyOnceWith(denied);
});

it('resolves synchronous and asynchronous getters, including throws and rejections', async () => {
  const write = clipboard();
  const onError = vi.fn();
  const { result } = renderHook(() => useClipboard({ onError }));
  for (const getter of [() => 'sync', () => Promise.resolve('token')]) {
    await act(async () => {
      expect(await result.current.copy(getter)).toBe(true);
    });
  }
  expect(write.mock.calls).toEqual([['sync'], ['token']]);
  const error = new Error('getter');
  for (const getter of [
    () => {
      throw error;
    },
    () => Promise.reject(error),
  ]) {
    await act(async () => {
      expect(await result.current.copy(getter)).toBe(false);
    });
    expect(result.current).toMatchObject({ status: 'failed', copied: false, error });
  }
  expect(write).toHaveBeenCalledTimes(2);
  expect(onError).toHaveBeenCalledTimes(2);
});

it('restarts feedback, supports timeout zero, and reset invalidates in-flight copies', async () => {
  vi.useFakeTimers();
  clipboard();
  const { result, rerender } = renderHook(({ timeout }) => useClipboard({ timeout }), {
    initialProps: { timeout: 2000 },
  });
  await act(async () => {
    await result.current.copy('first');
  });
  act(() => vi.advanceTimersByTime(500));
  await act(async () => {
    await result.current.copy('second');
  });
  act(() => vi.advanceTimersByTime(1999));
  expect(result.current.copied).toBe(true);
  act(() => vi.advanceTimersByTime(1));
  expect(result.current.status).toBe('idle');
  rerender({ timeout: 0 });
  await act(async () => {
    await result.current.copy('sticky');
  });
  act(() => vi.advanceTimersByTime(10000));
  expect(result.current.copied).toBe(true);
  act(() => result.current.reset());
  expect(result.current.status).toBe('idle');
  let resolve!: (text: string) => void;
  let pending!: Promise<boolean>;
  act(() => {
    pending = result.current.copy(
      () =>
        new Promise<string>((r) => {
          resolve = r;
        }),
    );
  });
  act(() => result.current.reset());
  await act(async () => {
    resolve('late');
    await pending;
  });
  expect(result.current).toMatchObject({ status: 'idle', copied: false, error: undefined });
});

it('only the latest call changes feedback and unmount cancels feedback and callbacks', async () => {
  vi.useFakeTimers();
  clipboard();
  const onCopy = vi.fn();
  const { result, unmount } = renderHook(() => useClipboard({ onCopy }));
  let resolve!: (text: string) => void;
  let pending!: Promise<boolean>;
  act(() => {
    pending = result.current.copy(
      () =>
        new Promise<string>((r) => {
          resolve = r;
        }),
    );
  });
  clipboard(vi.fn().mockRejectedValue(new Error('denied')));
  await act(async () => {
    await result.current.copy('latest');
  });
  clipboard();
  await act(async () => {
    resolve('stale');
    expect(await pending).toBe(true);
  });
  expect(result.current.status).toBe('failed');
  expect(onCopy).toHaveBeenCalledExactlyOnceWith('stale');
  onCopy.mockClear();
  act(() => {
    pending = result.current.copy(
      () =>
        new Promise<string>((r) => {
          resolve = r;
        }),
    );
  });
  const errors = vi.spyOn(console, 'error');
  unmount();
  await act(async () => {
    resolve('unmounted');
    await pending;
    vi.runAllTimers();
  });
  expect(onCopy).not.toHaveBeenCalled();
  expect(errors).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

it('announces only when opted in inside LiveAnnouncer', async () => {
  clipboard();
  const { result, rerender } = renderHook(({ announce }) => useClipboard({ announce }), {
    wrapper: LiveAnnouncer,
    initialProps: { announce: false },
  });
  await act(async () => {
    await result.current.copy('silent');
  });
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  rerender({ announce: true });
  await act(async () => {
    await result.current.copy('abc');
  });
  expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard');
  clipboard(vi.fn().mockRejectedValue(new Error('denied')));
  await act(async () => {
    await result.current.copy('abc');
  });
  expect(document.querySelector('[aria-live="assertive"]')).toHaveTextContent('Copy failed');
});

it('copies without rendering a region outside LiveAnnouncer', async () => {
  clipboard();
  const { result } = renderHook(() => useClipboard({ announce: true }));
  await act(async () => {
    expect(await result.current.copy('abc')).toBe(true);
  });
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('clears failure feedback and error on expiry and on reset', async () => {
  vi.useFakeTimers();
  const error = new Error('denied');
  clipboard(vi.fn().mockRejectedValue(error));
  const { result } = renderHook(() => useClipboard());
  await act(async () => {
    await result.current.copy('abc');
  });
  expect(result.current.error).toBe(error);
  act(() => vi.advanceTimersByTime(2000));
  expect(result.current).toMatchObject({ status: 'idle', error: undefined, copied: false });
  await act(async () => {
    await result.current.copy('abc');
  });
  act(() => result.current.reset());
  expect(result.current).toMatchObject({ status: 'idle', error: undefined, copied: false });
});

it('clears a pending feedback timer on unmount', async () => {
  vi.useFakeTimers();
  clipboard();
  const { result, unmount } = renderHook(() => useClipboard());
  await act(async () => {
    await result.current.copy('abc');
  });
  expect(vi.getTimerCount()).toBe(1);
  const errors = vi.spyOn(console, 'error');
  unmount();
  expect(vi.getTimerCount()).toBe(0);
  act(() => vi.runAllTimers());
  expect(errors).not.toHaveBeenCalled();
});
