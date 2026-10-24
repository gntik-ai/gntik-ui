import { act, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCopy } from './useCopy';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('useCopy clipboard results', () => {
  it.each(['resolved', 'rejected', 'missing', 'missing-writeText'] as const)(
    'reports a %s write and resets after 1600ms',
    async (outcome) => {
      const writeText =
        outcome === 'resolved'
          ? vi.fn().mockResolvedValue(undefined)
          : vi.fn().mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
      vi.stubGlobal('navigator', {
        clipboard: outcome === 'missing' ? undefined : outcome === 'missing-writeText' ? {} : { writeText },
      });
      const { result } = renderHook(() => useCopy(), { wrapper: StrictMode });
      expect(result.current.status).toBe('idle');
      expect(result.current.copied).toBe(false);
      await act(() => result.current.copy('Reply'));
      expect(result.current.status).toBe(outcome === 'resolved' ? 'copied' : 'failed');
      expect(result.current.copied).toBe(outcome === 'resolved');
      act(() => vi.advanceTimersByTime(1599));
      expect(result.current.status).toBe(outcome === 'resolved' ? 'copied' : 'failed');
      act(() => vi.advanceTimersByTime(1));
      expect(result.current.status).toBe('idle');
      expect(result.current.copied).toBe(false);
    },
  );

  it('cancels the previous reset while a new write is pending, then uses resetMs', async () => {
    let finish!: () => void;
    const writeText = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockImplementationOnce(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      );
    vi.stubGlobal('navigator', { clipboard: { writeText } });
    const { result } = renderHook(() => useCopy(200));
    await act(() => result.current.copy('First'));
    act(() => vi.advanceTimersByTime(100));
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.copy('Second');
    });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current.status).toBe('copied');
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => {
      finish();
      await pending;
    });
    act(() => vi.advanceTimersByTime(199));
    expect(result.current.status).toBe('copied');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.status).toBe('idle');
    expect(writeText.mock.calls).toEqual([['First'], ['Second']]);
  });

  it.each(['resolved', 'rejected'] as const)(
    'does not schedule a reset when a pending write is %s after unmount',
    async (outcome) => {
      let finish!: () => void;
      let deny!: (error: Error) => void;
      const writeText = vi.fn(
        () =>
          new Promise<void>((resolve, reject) => {
            finish = resolve;
            deny = reject;
          }),
      );
      vi.stubGlobal('navigator', { clipboard: { writeText } });
      const { result, unmount } = renderHook(() => useCopy());
      let pending!: Promise<void>;
      act(() => {
        pending = result.current.copy('Reply');
      });
      unmount();
      await act(async () => {
        if (outcome === 'resolved') finish();
        else deny(new DOMException('Denied', 'NotAllowedError'));
        await pending;
      });
      expect(vi.getTimerCount()).toBe(0);
    },
  );

  it('clears an active reset on unmount', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    const { result, unmount } = renderHook(() => useCopy());
    await act(() => result.current.copy('Reply'));
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
