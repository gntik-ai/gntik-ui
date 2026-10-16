import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import { LoadMoreFooter } from './LoadMoreFooter';

describe('LoadMoreFooter availability', () => {
  it.each([
    ['c1', undefined, true],
    ['c1', true, true],
    ['c1', false, false],
    ['', true, false],
    ['', undefined, false],
    [null, true, false],
    [undefined, true, true],
    [undefined, false, false],
    [undefined, undefined, false],
  ] as const)('nextCursor=%s hasMore=%s available=%s', (nextCursor, hasMore, available) => {
    render(<LoadMoreFooter nextCursor={nextCursor} hasMore={hasMore} loadedCount={37} />);
    expect(screen.queryAllByRole('button')).toHaveLength(available ? 1 : 0);
    const root = screen.getByRole('group', { name: 'Load more items' });
    expect(root).toHaveAttribute('tabindex', '-1');
    expect(screen.getByText(/37 items loaded/)).toHaveAttribute('tabindex', '-1');
    expect(root).not.toHaveTextContent(/total|page|of \d/i);
    expect(screen.queryByText('More items available.')).toBe(
      available ? screen.getByText('More items available.') : null,
    );
  });

  it('renders meaningful English defaults without props', () => {
    render(<LoadMoreFooter />);
    expect(screen.getByRole('button', { name: 'Load more' })).toBeVisible();
    expect(screen.getByText(/20 items loaded/)).toBeVisible();
  });
});

describe('LoadMoreFooter loading', () => {
  it.each(['cursor', 'flag'])('loads exactly once and retains focus while loading in %s mode', async (mode) => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    const props = { nextCursor: mode === 'cursor' ? 'c1' : undefined, hasMore: true, onLoadMore };
    const { rerender } = render(<LoadMoreFooter {...props} />);
    const button = screen.getByRole('button', { name: 'Load more' });
    await user.click(button);
    expect(onLoadMore.mock.calls).toEqual(mode === 'cursor' ? [['c1']] : [[]]);
    rerender(<LoadMoreFooter {...props} loading />);
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAccessibleName('Loading…');
    expect(button.querySelector('svg')).not.toBeNull();
    expect(screen.getByRole('group')).toHaveAttribute('aria-busy', 'true');
    await user.click(button);
    await user.keyboard('{Enter} ');
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    expect(button).toHaveFocus();
  });
});

describe('LoadMoreFooter failures and focus', () => {
  it.each([true, false])(
    'retries the recorded cursor and returns focus after success (onRetry=%s)',
    async (explicitRetry) => {
      const user = userEvent.setup();
      const onLoadMore = vi.fn();
      const onRetry = vi.fn();
      const props = { nextCursor: 'c1', onLoadMore, onRetry: explicitRetry ? onRetry : undefined };
      const { rerender } = render(<LoadMoreFooter {...props} />);
      await user.click(screen.getByRole('button'));
      rerender(<LoadMoreFooter {...props} loading />);
      rerender(<LoadMoreFooter {...props} nextCursor="c2" error="Request failed" />);
      const retry = screen.getByRole('button', { name: 'Try again' });
      expect(retry).toHaveFocus();
      expect(screen.getByRole('heading', { name: 'Request failed' })).toBeVisible();
      expect(screen.queryByText(/503|req_|Contact support|Details|Your data/)).toBeNull();
      await user.click(retry);
      expect((explicitRetry ? onRetry : onLoadMore).mock.calls).toEqual(explicitRetry ? [['c1']] : [['c1'], ['c1']]);
      rerender(<LoadMoreFooter {...props} error="Request failed" loading />);
      expect(retry).toHaveFocus();
      expect(retry).toHaveAttribute('aria-disabled', 'true');
      await user.click(retry);
      await user.keyboard('{Enter} ');
      expect(explicitRetry ? onRetry : onLoadMore).toHaveBeenCalledTimes(explicitRetry ? 1 : 2);
      rerender(<LoadMoreFooter {...props} nextCursor="c2" error="" loading={false} />);
      expect(screen.getByRole('button', { name: 'Load more' })).toHaveFocus();
    },
  );

  it.each([true, false])(
    'retains the same flag button with a visible error and no cursor argument (onRetry=%s)',
    async (explicitRetry) => {
      const user = userEvent.setup();
      const onLoadMore = vi.fn();
      const onRetry = vi.fn();
      const props = { hasMore: true, onLoadMore, onRetry: explicitRetry ? onRetry : undefined };
      const { rerender } = render(<LoadMoreFooter {...props} />);
      const button = screen.getByRole('button');
      await user.click(button);
      rerender(<LoadMoreFooter {...props} loading />);
      rerender(<LoadMoreFooter {...props} error="Request failed" />);
      expect(screen.getByRole('button', { name: 'Try again' })).toBe(button);
      expect(button).toHaveFocus();
      expect(button).toHaveAccessibleDescription('Request failed');
      expect(within(screen.getByRole('group')).getByText('Request failed')).toBeVisible();
      expect(screen.queryByRole('heading')).toBeNull();
      await user.click(button);
      expect((explicitRetry ? onRetry : onLoadMore).mock.calls).toEqual(explicitRetry ? [[]] : [[], []]);
    },
  );

  it('uses the current cursor when no attempt was recorded', async () => {
    const onRetry = vi.fn();
    render(<LoadMoreFooter nextCursor="c2" error="Request failed" onRetry={onRetry} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry.mock.calls).toEqual([['c2']]);
  });

  it.each(['cursor', 'flag'])('exhaustion overrides an error and removes every control in %s mode', async (mode) => {
    const props = { nextCursor: mode === 'cursor' ? 'c1' : undefined, hasMore: true, loadedCount: 37 };
    const { rerender } = render(<LoadMoreFooter {...props} />);
    await userEvent.setup().click(screen.getByRole('button'));
    rerender(<LoadMoreFooter {...props} loading />);
    rerender(<LoadMoreFooter {...props} hasMore={false} error="Request failed" />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByText(/37 items loaded/)).toHaveFocus();
    expect(within(screen.getByRole('group')).getByText('Request failed')).toBeVisible();
  });

  it.each(['summary', 'root'] as const)('focuses %s after an exhausted successful retry', async (target) => {
    const props = { nextCursor: 'c1', error: 'Request failed', exhaustedFocusTarget: target };
    const { rerender } = render(<LoadMoreFooter {...props} />);
    await userEvent.setup().click(screen.getByRole('button'));
    rerender(<LoadMoreFooter {...props} loading />);
    rerender(<LoadMoreFooter {...props} hasMore={false} error="" />);
    expect(target === 'root' ? screen.getByRole('group') : screen.getByText(/items loaded/)).toHaveFocus();
  });

  it.each(['cursor', 'flag'])(
    'moves a focused retry to the root on an exhausted failed attempt in %s mode',
    async (mode) => {
      const props = {
        nextCursor: mode === 'cursor' ? 'c1' : undefined,
        hasMore: true,
        error: 'E1',
        exhaustedFocusTarget: 'root' as const,
      };
      const { rerender } = render(<LoadMoreFooter {...props} />);
      await userEvent.setup().click(screen.getByRole('button'));
      rerender(<LoadMoreFooter {...props} loading />);
      rerender(<LoadMoreFooter {...props} hasMore={false} />);
      expect(screen.queryAllByRole('button')).toHaveLength(0);
      expect(screen.getByRole('group')).toHaveFocus();
    },
  );

  it('never takes focus from elsewhere on any control transition', () => {
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    const { rerender } = render(<LoadMoreFooter nextCursor="c1" />);
    rerender(<LoadMoreFooter nextCursor="c1" error="Request failed" />);
    expect(outside).toHaveFocus();
    rerender(<LoadMoreFooter nextCursor="c2" />);
    expect(outside).toHaveFocus();
    rerender(<LoadMoreFooter nextCursor={null} />);
    expect(outside).toHaveFocus();
    outside.remove();
  });
});
