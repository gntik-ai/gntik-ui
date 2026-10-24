import { act } from 'react';
import { cleanup, render, renderHook, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { mockMediaQueries } from '../test/media-query';
import { useMediaQuery, usePrefersReducedMotion } from './useMediaQuery';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Match({ query = '(min-width: 64rem)', fallback = false }) {
  return <output>{String(useMediaQuery(query, fallback))}</output>;
}

it('follows the query and change events', () => {
  const media = mockMediaQueries(1280);
  render(<Match />);
  expect(screen.getByRole('status')).toHaveTextContent('true');
  act(() => media.change(800));
  expect(screen.getByRole('status')).toHaveTextContent('false');
});

it('uses one browser list and listener for ten consumers, releasing the last subscription', () => {
  const media = mockMediaQueries();
  const consumers = (count: number) => Array.from({ length: count }, (_, i) => <Match key={i} />);
  const view = render(<>{consumers(10)}</>);
  expect(media.matchMedia).toHaveBeenCalledTimes(1);
  expect(media.lists[0]?.listeners.size).toBe(1);
  act(() => media.change(800));
  expect(screen.getAllByRole('status').map((el) => el.textContent)).toEqual(Array(10).fill('false'));
  view.rerender(<>{consumers(1)}</>);
  expect(media.lists[0]?.listeners.size).toBe(1);
  view.unmount();
  expect(media.lists[0]?.listeners.size).toBe(0);
});

it('switches query subscriptions when the query changes', () => {
  const media = mockMediaQueries(800);
  const view = render(<Match />);
  view.rerender(<Match query="(min-width: 40rem)" />);
  expect(screen.getByRole('status')).toHaveTextContent('true');
  expect(media.lists[0]?.listeners.size).toBe(0);
  expect(media.lists[1]?.listeners.size).toBe(1);
});

it('supports legacy MediaQueryList listeners', () => {
  const media = mockMediaQueries(1280, false, true);
  const view = render(<Match />);
  act(() => media.change(800));
  expect(screen.getByRole('status')).toHaveTextContent('false');
  view.unmount();
  expect(media.lists[0]?.listeners.size).toBe(0);
});

it('uses each caller fallback without matchMedia', () => {
  vi.stubGlobal('matchMedia', undefined);
  const { result } = renderHook(() => [useMediaQuery('screen'), useMediaQuery('screen', true)]);
  expect(result.current).toEqual([false, true]);
});

it('server-renders fallbacks without reading window', () => {
  vi.stubGlobal('window', undefined);
  expect(renderToString(<Match />)).toContain('false');
  expect(renderToString(<Match fallback />)).toContain('true');
});

it('hydrates the server fallback before switching to the client match', async () => {
  const media = mockMediaQueries();
  const container = document.createElement('div');
  container.innerHTML = renderToString(<Match />);
  expect(container.textContent).toBe('false');
  expect(media.matchMedia).not.toHaveBeenCalled();
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const recoverable = vi.fn();
  let root: ReturnType<typeof hydrateRoot> | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, <Match />, { onRecoverableError: recoverable });
    });
    expect(container.textContent).toBe('true');
    expect(error).not.toHaveBeenCalled();
    expect(recoverable).not.toHaveBeenCalled();
  } finally {
    await act(async () => root?.unmount());
    error.mockRestore();
  }
});

it('follows reduced motion and reports false on the server', () => {
  const media = mockMediaQueries(1280, true);
  function Preference() {
    return <output>{String(usePrefersReducedMotion())}</output>;
  }
  expect(renderToString(<Preference />)).toContain('false');
  render(<Preference />);
  expect(screen.getByRole('status')).toHaveTextContent('true');
  act(() => media.change(1280, false));
  expect(screen.getByRole('status')).toHaveTextContent('false');
});
