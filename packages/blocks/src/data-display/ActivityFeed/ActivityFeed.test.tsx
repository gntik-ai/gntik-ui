import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ActivityFeed, groupActivityByDay, type ActivityItem } from './ActivityFeed';

const now = new Date(2026, 9, 3, 15, 0);
const items: ActivityItem[] = [
  { id: '1', actor: { name: 'Ana Lopez' }, action: 'deployed', target: 'orders-api', at: new Date(2026, 9, 3, 14, 0) },
  { id: '2', actor: { name: 'Sam Carter' }, action: 'invited', target: 'lee@example.com', at: new Date(2026, 9, 3, 9, 0) },
  { id: '3', actor: { name: 'Lee Wong' }, action: 'paused', target: 'nightly-export', at: new Date(2026, 9, 2, 18, 0) },
  { id: '4', actor: { name: 'Priya Nair' }, action: 'created the project', target: 'Checkout', at: new Date(2026, 8, 28, 10, 0) },
];

describe('ActivityFeed', () => {
  it('renders the default feed', async () => {
    const { container } = render(<ActivityFeed />);
    expect(screen.getByRole('region', { name: 'Recent activity' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('groups items by day', () => {
    const groups = groupActivityByDay(items, now, 'en-US');
    expect(groups.map((g) => [g.label, g.items.length])).toEqual([
      ['Today', 2],
      ['Yesterday', 1],
      ['Monday, Sep 28', 1],
    ]);
    render(<ActivityFeed items={items} now={now} locale="en-US" />);
    expect(screen.getByRole('list', { name: 'Today' }).children).toHaveLength(2);
    expect(screen.getByRole('list', { name: 'Yesterday' }).children).toHaveLength(1);
  });

  it('loads more on demand', async () => {
    const onLoadMore = vi.fn();
    render(<ActivityFeed items={items} now={now} onLoadMore={onLoadMore} />);
    await userEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(onLoadMore).toHaveBeenCalled();
  });
});
