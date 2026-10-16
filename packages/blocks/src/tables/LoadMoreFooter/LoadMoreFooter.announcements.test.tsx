import { act, render } from '@testing-library/react';
import { LiveAnnouncer } from '@gntik-ai/ui';
import { StrictMode } from 'react';
import { LoadMoreFooter, type LoadMoreFooterProps } from './LoadMoreFooter';

function announcements(initial: LoadMoreFooterProps, outer = false) {
  const wrap = (props: LoadMoreFooterProps) => (
    <StrictMode>
      {outer ? (
        <LiveAnnouncer>
          <LoadMoreFooter {...props} />
        </LiveAnnouncer>
      ) : (
        <LoadMoreFooter {...props} />
      )}
    </StrictMode>
  );
  const { container, rerender } = render(wrap(initial));
  const region = container.querySelector('[aria-live="assertive"]');
  expect(region).not.toBeNull();
  expect(region).toHaveTextContent('');
  const messages: string[] = [];
  const observer = new MutationObserver(() => messages.push(region?.textContent?.trim() ?? ''));
  observer.observe(region!, { childList: true, characterData: true, subtree: true });
  return {
    container,
    messages,
    async update(props: LoadMoreFooterProps) {
      rerender(wrap(props));
      await act(async () => {});
    },
    disconnect: () => observer.disconnect(),
  };
}

describe('LoadMoreFooter announcements', () => {
  it.each([true, false])('announces new appended sequences only, with outer provider=%s', async (outer) => {
    const h = announcements({ hasMore: true, lastAppend: { seq: 1, count: 20 } }, outer);
    expect(h.container.querySelectorAll('[aria-live="polite"]')).toHaveLength(1);
    const polite = h.container.querySelector('[aria-live="polite"]');
    expect(polite?.textContent).toBe('');
    await h.update({ hasMore: true, lastAppend: { seq: 2, count: 3 } });
    expect(polite?.textContent).toBe('3 items added.');
    await h.update({ hasMore: true, lastAppend: { seq: 2, count: 3 } });
    expect(polite?.textContent).toBe('3 items added.');
    await h.update({ hasMore: true, lastAppend: { seq: 3, count: 0 } });
    await h.update({ hasMore: true, lastAppend: { seq: 3, count: 9 } });
    expect(polite?.textContent).toBe('3 items added.');
    await h.update({ hasMore: false, lastAppend: { seq: 4, count: 1 } });
    expect(polite?.textContent).toBe('1 item added.');
    h.disconnect();
  });

  it('announces a first append when lastAppend was initially absent', async () => {
    const h = announcements({ hasMore: true });
    await h.update({ hasMore: true, lastAppend: { seq: 1, count: 2 } });
    expect(h.container.querySelector('[aria-live="polite"]')?.textContent).toBe('2 items added.');
    h.disconnect();
  });

  it.each(['cursor', 'flag'])('announces an exhausted error exactly once in %s mode', async (mode) => {
    const props = { nextCursor: mode === 'cursor' ? 'c1' : undefined, hasMore: true };
    const h = announcements(props);
    await h.update({ ...props, loading: true });
    await h.update({ ...props, loading: false, hasMore: false, error: 'E1' });
    await h.update({ ...props, loading: false, hasMore: false, error: 'E1' });
    expect(h.messages).toEqual(['E1']);
    h.disconnect();
  });

  it('announces settled failures, including the same error again, but not retained errors on success', async () => {
    const h = announcements({ hasMore: true });
    await h.update({ hasMore: true, loading: true });
    await h.update({ hasMore: true, loading: false, error: 'E1' });
    expect(h.messages).toEqual(['E1']);
    await h.update({ hasMore: true, loading: true, error: 'E1' });
    await h.update({ hasMore: true, loading: false, error: '' });
    expect(h.messages).toEqual(['E1']);
    await h.update({ hasMore: true, loading: true, error: 'E1' });
    await h.update({ hasMore: true, loading: false, error: 'E1' });
    expect(h.messages).toEqual(['E1', 'E1']);
    h.disconnect();
  });

  it('ignores mount errors and changes while loading, then announces the final error on settle', async () => {
    const h = announcements({ nextCursor: 'c1', error: 'E1', loading: true });
    await h.update({ nextCursor: 'c1', error: 'E2', loading: true });
    expect(h.messages).toEqual([]);
    await h.update({ nextCursor: 'c1', error: 'E2', loading: false });
    await h.update({ nextCursor: 'c1', error: 'E2', loading: false });
    expect(h.messages).toEqual(['E2']);
    h.disconnect();
  });

  it('announces new non-empty idle errors, but not mount or identical values', async () => {
    const h = announcements({ hasMore: true, error: 'mount' });
    await h.update({ hasMore: true, error: 'mount' });
    await h.update({ hasMore: true });
    expect(h.messages).toEqual([]);
    await h.update({ hasMore: true, error: 'E1' });
    await h.update({ hasMore: true, error: 'E1' });
    await h.update({ hasMore: true, error: 'E2' });
    expect(h.messages).toEqual(['E1', 'E2']);
    h.disconnect();
  });
});
