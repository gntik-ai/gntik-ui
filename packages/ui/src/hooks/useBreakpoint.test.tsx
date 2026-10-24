import { act } from 'react';
import { cleanup, renderHook } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { mockMediaQueries } from '../test/media-query';
import { useBreakpoint, useBreakpointValue, type Breakpoint } from './useBreakpoint';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('returns the largest matching breakpoint as the viewport changes', () => {
  const media = mockMediaQueries(500);
  const { result } = renderHook(() => useBreakpoint());
  expect(result.current).toBe('base');
  act(() => media.change(800));
  expect(result.current).toBe('md');
  act(() => media.change(1100));
  expect(result.current).toBe('lg');
  act(() => media.change(1600));
  expect(result.current).toBe('2xl');
});

it('resolves values mobile-first and leaves undefined gaps below the first value', () => {
  const media = mockMediaQueries(800);
  const { result } = renderHook(() => ({
    layout: useBreakpointValue({ base: 'drawer', lg: 'inline' }),
    count: useBreakpointValue({ md: 2 }),
  }));
  expect(result.current).toEqual({ layout: 'drawer', count: 2 });
  act(() => media.change(1300));
  expect(result.current).toEqual({ layout: 'inline', count: 2 });
  act(() => media.change(500));
  expect(result.current).toEqual({ layout: 'drawer', count: undefined });
});

it('returns base or the requested fallback without matchMedia', () => {
  vi.stubGlobal('matchMedia', undefined);
  const { result } = renderHook(() => [useBreakpoint(), useBreakpoint({ fallback: 'xl' })]);
  expect(result.current).toEqual(['base', 'xl']);
});

function Current({ fallback }: { fallback?: Breakpoint }) {
  const breakpoint = useBreakpoint({ fallback });
  const value = useBreakpointValue({ base: 'drawer', lg: 'inline' }, { fallback });
  return (
    <output>
      {breakpoint}:{value}
    </output>
  );
}

it('uses the fallback on the server and hydrates without mismatches', async () => {
  const media = mockMediaQueries(800);
  expect(renderToString(<Current />)).toContain('base');
  const container = document.createElement('div');
  container.innerHTML = renderToString(<Current fallback="lg" />);
  expect(container.textContent).toBe('lg:inline');
  expect(media.matchMedia).not.toHaveBeenCalled();
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const recoverable = vi.fn();
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, <Current fallback="lg" />, { onRecoverableError: recoverable });
    });
    expect(container.textContent).toBe('md:drawer');
    expect(error).not.toHaveBeenCalled();
    expect(recoverable).not.toHaveBeenCalled();
  } finally {
    await act(async () => root?.unmount());
    error.mockRestore();
  }
});
