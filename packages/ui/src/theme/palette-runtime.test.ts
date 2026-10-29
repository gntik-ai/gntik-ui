import { currentPalette, observeTheme } from '@gntik-ai/tokens/runtime';
import { waitFor } from '@testing-library/react';

afterEach(() => document.documentElement.removeAttribute('data-palette'));

it('reports the nearest palette and notifies on live palette changes, then unsubscribes', async () => {
  const root = document.documentElement;
  root.removeAttribute('data-palette');
  expect(currentPalette()).toBe('green');
  const navy = document.createElement('div');
  const child = document.createElement('div');
  navy.appendChild(child);
  document.body.appendChild(navy);
  navy.dataset.palette = 'navy';
  const changed = vi.fn();
  const unsubscribe = observeTheme(changed, child);
  expect(currentPalette(child)).toBe('navy');
  navy.dataset.palette = 'green';
  await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
  expect(currentPalette(child)).toBe('green');
  root.dataset.palette = 'navy';
  await waitFor(() => expect(changed).toHaveBeenCalledTimes(2));
  unsubscribe();
  navy.dataset.palette = 'navy';
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(changed).toHaveBeenCalledTimes(2);
  navy.remove();
});
