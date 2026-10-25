import { prefersReducedMotion, observeReducedMotion } from '@gntik-ai/tokens/runtime';
import { mockMediaQueries } from '../test/media-query';

afterEach(() => {
  document.documentElement.removeAttribute('data-motion');
  vi.unstubAllGlobals();
});

it('reads motion scopes on the element, its ancestors and html, preserving OS reduce', () => {
  const media = mockMediaQueries();
  const scope = document.createElement('div');
  const child = document.createElement('span');
  scope.append(child);
  document.body.append(scope);
  expect(prefersReducedMotion(child)).toBe(false);
  child.dataset.motion = 'reduce';
  expect(prefersReducedMotion(child)).toBe(true);
  child.removeAttribute('data-motion');
  scope.dataset.motion = 'reduce';
  expect(prefersReducedMotion(child)).toBe(true);
  expect(prefersReducedMotion()).toBe(false);
  scope.removeAttribute('data-motion');
  document.documentElement.dataset.motion = 'reduce';
  expect(prefersReducedMotion(child)).toBe(true);
  document.documentElement.removeAttribute('data-motion');
  media.change(1280, true);
  expect(prefersReducedMotion(child)).toBe(true);
  scope.remove();
});

it('observes attribute and OS changes, and releases both subscriptions', async () => {
  const media = mockMediaQueries();
  const scope = document.createElement('div');
  const child = document.createElement('span');
  scope.append(child);
  document.body.append(scope);
  const values: boolean[] = [];
  const unsubscribe = observeReducedMotion((value) => values.push(value), child);
  scope.dataset.motion = 'reduce';
  await Promise.resolve();
  expect(values.at(-1)).toBe(true);
  scope.removeAttribute('data-motion');
  await Promise.resolve();
  expect(values.at(-1)).toBe(false);
  media.change(1280, true);
  expect(values.at(-1)).toBe(true);
  unsubscribe();
  const count = values.length;
  scope.dataset.motion = 'reduce';
  media.change(1280, false);
  await Promise.resolve();
  expect(values).toHaveLength(count);
  expect(media.lists.every(({ listeners }) => listeners.size === 0)).toBe(true);
  scope.remove();
});

it('is safe on the server', () => {
  vi.stubGlobal('document', undefined);
  vi.stubGlobal('window', undefined);
  expect(prefersReducedMotion()).toBe(false);
  expect(() => observeReducedMotion(() => {})()).not.toThrow();
  vi.unstubAllGlobals();
});
