import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConversationList } from './ConversationList';

const now = new Date(2026, 2, 10, 12);
const items = [
  {
    id: 'a',
    title: 'Budget review',
    preview: 'Usage for this quarter',
    updatedAt: new Date(2026, 2, 10, 9),
    unread: 3,
  },
  { id: 'b', title: 'Project plan', updatedAt: new Date(2026, 2, 9, 18), unread: 0 },
  { id: 'c', title: 'Earlier discussion', updatedAt: new Date(2026, 1, 1, 10) },
];

describe('ConversationList content and incremental loading', () => {
  it.each([
    ['en', '3 unread messages'],
    ['es', '3 mensajes sin leer'],
  ])('labels unread counts in %s and hides zero counts', (locale, unreadLabel) => {
    render(
      <I18nProvider locale={locale}>
        <ConversationList items={items} groupBy={false} now={now} />
      </I18nProvider>,
    );
    expect(screen.getByLabelText(unreadLabel)).toHaveTextContent('3');
    expect(screen.getByLabelText(unreadLabel).className).toContain('bg-tone/(--badge-bg-alpha)');
    expect(screen.getByText('Usage for this quarter')).toBeVisible();
    expect(screen.queryByText('0')).toBeNull();
    expect(screen.getAllByText('3')).toHaveLength(1);
    const row = screen.getByRole('button', { name: /^Budget review/ });
    expect(
      within(row).getByText(new Intl.DateTimeFormat(locale, { timeStyle: 'short' }).format(items[0]!.updatedAt)),
    ).toBeVisible();
  });

  it('places New chat and its shortcut before the nav, and Load more afterwards, keeping loading focus', async () => {
    const user = userEvent.setup();
    const onNew = vi.fn();
    const onLoadMore = vi.fn();
    const props = { items, groupBy: false as const, now, onNew, newShortcut: '⌘N', hasMore: true, onLoadMore };
    const { rerender } = render(<ConversationList {...props} />);
    const nav = screen.getByRole('navigation');
    const start = screen.getByRole('button', { name: /New chat/ });
    const more = screen.getByRole('button', { name: 'Load more' });
    expect(nav.contains(start)).toBe(false);
    expect(nav.contains(more)).toBe(false);
    expect(start.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(nav.compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText('⌘N').tagName).toBe('KBD');
    await user.click(start);
    expect(onNew).toHaveBeenCalledTimes(1);
    await user.click(more);
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    rerender(<ConversationList {...props} loadingMore />);
    expect(more).toHaveFocus();
    expect(more).toHaveAttribute('aria-busy', 'true');
    expect(more).toHaveAttribute('aria-disabled', 'true');
    await user.click(more);
    await user.keyboard('{Enter} ');
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    rerender(<ConversationList items={items} />);
    expect(screen.queryByRole('button', { name: /New chat|Load more/ })).toBeNull();
  });

  it('renders the supplied empty state without empty groups', () => {
    render(<ConversationList items={[]} emptyState={<p>No saved discussions</p>} />);
    expect(screen.getByText('No saved discussions')).toBeVisible();
    expect(screen.queryByRole('heading')).toBeNull();
  });
});

it('uses chat fallbacks when the host UI catalog lacks the new keys', () => {
  render(
    <I18nProvider
      locale="en"
      messages={{
        'chat.conversations': 'chat.conversations',
        'chat.today': 'chat.today',
        'chat.unreadCount': 'chat.unreadCount',
        'chat.newChat': 'chat.newChat',
        'chat.loadMore': 'chat.loadMore',
        'chat.conversationActions': 'chat.conversationActions',
      }}
    >
      <ConversationList items={items.slice(0, 1)} now={now} onNew={() => {}} hasMore />
    </I18nProvider>,
  );
  expect(screen.getByRole('navigation', { name: 'Conversations' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'New chat' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Load more' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'More actions for Budget review' })).toBeInTheDocument();
  expect(screen.getByLabelText('3 unread messages')).toBeInTheDocument();
});
