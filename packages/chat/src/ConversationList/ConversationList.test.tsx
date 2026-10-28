import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConversationList } from './ConversationList';

const now = new Date(2026, 2, 10, 12);
const items = [
  { id: 'a', title: 'Budget review', updatedAt: new Date(2026, 2, 10, 9) },
  { id: 'b', title: 'Project plan', updatedAt: new Date(2026, 2, 9, 18) },
  { id: 'c', title: 'Release notes', updatedAt: new Date(2026, 2, 6, 10) },
  { id: 'd', title: 'Earlier discussion', updatedAt: new Date(2026, 1, 1, 10) },
];

describe('ConversationList grouping', () => {
  it('groups local calendar days in recency order, omitting empty groups', () => {
    const { rerender } = render(<ConversationList items={items} now={now} />);
    expect(screen.getAllByRole('heading').map((el) => el.textContent)).toEqual([
      'Today',
      'Yesterday',
      'Previous 7 days',
      'Older',
    ]);
    const nav = screen.getByRole('navigation', { name: 'Conversations' });
    expect(
      within(nav)
        .getAllByRole('button')
        .filter((el) => !el.hasAttribute('aria-haspopup'))
        .map((el) => el.textContent),
    ).toEqual([
      'Today',
      expect.stringContaining('Budget review'),
      'Yesterday',
      expect.stringContaining('Project plan'),
      'Previous 7 days',
      expect.stringContaining('Release notes'),
      'Older',
      expect.stringContaining('Earlier discussion'),
    ]);
    rerender(<ConversationList items={items.slice(0, 1)} now={now} />);
    expect(screen.getAllByRole('heading').map((el) => el.textContent)).toEqual(['Today']);
  });

  it('keeps input order without grouping and groups by custom keys', () => {
    const { rerender } = render(<ConversationList items={[items[2]!, items[0]!]} groupBy={false} now={now} />);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(
      screen
        .getAllByRole('button')
        .filter((el) => !el.hasAttribute('aria-haspopup'))
        .map((el) => el.textContent),
    ).toEqual([expect.stringContaining('Release notes'), expect.stringContaining('Budget review')]);
    rerender(
      <ConversationList
        items={items}
        groupBy={(item) => (item.id === 'a' || item.id === 'c' ? 'Work' : 'Other')}
        now={now}
      />,
    );
    expect(screen.getAllByRole('heading').map((el) => el.textContent)).toEqual(['Work', 'Other']);
    expect(
      screen
        .getAllByRole('button')
        .filter((el) => !el.hasAttribute('aria-haspopup'))
        .map((el) => el.textContent),
    ).toEqual([
      'Work',
      expect.stringContaining('Budget review'),
      expect.stringContaining('Release notes'),
      'Other',
      expect.stringContaining('Project plan'),
      expect.stringContaining('Earlier discussion'),
    ]);
  });
});

// Disclosure state is observed only through the rendered headings and rows.
describe('ConversationList disclosures', () => {
  it('toggles uncontrolled groups and notifies controlled owners without mutating their state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <ConversationList
        items={items}
        now={now}
        defaultCollapsedGroups={['yesterday']}
        onCollapsedGroupsChange={onChange}
      />,
    );
    expect(screen.queryByRole('button', { name: /^Project plan/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Yesterday' }));
    expect(screen.getByRole('button', { name: 'Yesterday' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /^Project plan/ })).toBeVisible();
    expect(onChange).toHaveBeenLastCalledWith([]);
    rerender(
      <ConversationList items={items} now={now} collapsedGroups={['today']} onCollapsedGroupsChange={onChange} />,
    );
    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.queryByRole('button', { name: /^Budget review/ })).toBeNull();
    rerender(<ConversationList items={items} now={now} collapsedGroups={[]} onCollapsedGroupsChange={onChange} />);
    expect(screen.getByRole('button', { name: /^Budget review/ })).toBeVisible();
  });
});

describe('ConversationList keyboard and selection', () => {
  it('has one Tab stop and moves across headings, skipping collapsed and disabled rows', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ConversationList
          items={items.map((item) => ({ ...item, disabled: item.id === 'c' }))}
          now={now}
          activeId="a"
          defaultCollapsedGroups={['yesterday']}
        />
        <button>After</button>
      </>,
    );
    const nav = screen.getByRole('navigation');
    expect([...nav.querySelectorAll<HTMLElement>('button, a, input')].filter((el) => el.tabIndex === 0)).toHaveLength(
      1,
    );
    await user.tab();
    expect(screen.getByRole('button', { name: /^Budget review/ })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Yesterday' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Previous 7 days' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Older' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('button', { name: /^Earlier discussion/ })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('button', { name: 'Today' })).toHaveFocus();
    await user.keyboard('{ArrowDown}{ArrowUp}');
    expect(screen.getByRole('button', { name: 'Today' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('activates exactly once for click, Enter and Space and never activates disabled rows', async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    render(
      <ConversationList
        items={[items[0]!, { ...items[1]!, disabled: true }]}
        groupBy={false}
        onActiveChange={onActiveChange}
      />,
    );
    const row = screen.getByRole('button', { name: /^Budget review/ });
    await user.click(row);
    expect(onActiveChange.mock.calls).toEqual([['a']]);
    expect(row).toHaveAttribute('aria-current', 'true');
    expect(row.className).toContain('aria-[current=true]:bg-accent');
    await user.keyboard('{Enter} ');
    expect(onActiveChange.mock.calls).toEqual([['a'], ['a'], ['a']]);
    await user.click(screen.getByRole('button', { name: /^Project plan/ }));
    expect(onActiveChange).toHaveBeenCalledTimes(3);
  });

  it('renders opt-in links and reports controlled selection exactly once per activation', async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    const { rerender } = render(
      <ConversationList
        items={items}
        groupBy={false}
        activeId="b"
        onActiveChange={onActiveChange}
        getHref={(item) => `#${item.id}`}
      />,
    );
    const row = screen.getByRole('link', { name: /^Budget review/ });
    expect(row).toHaveAttribute('href', '#a');
    expect(screen.getByRole('link', { current: true })).toHaveTextContent('Project plan');
    await user.click(row);
    await user.keyboard('{Enter} ');
    expect(onActiveChange.mock.calls).toEqual([['a'], ['a'], ['a']]);
    expect(screen.getByRole('link', { current: true })).toHaveTextContent('Project plan');
    rerender(<ConversationList items={items} groupBy={false} activeId="a" getHref={(item) => `#${item.id}`} />);
    expect(screen.getByRole('link', { current: true })).toHaveTextContent('Budget review');
  });

  it('starts at the first enabled row when there is no active conversation', async () => {
    render(
      <ConversationList items={[{ ...items[0]!, disabled: true }, items[1]!]} groupBy={false} defaultActiveId={null} />,
    );
    await userEvent.tab();
    expect(screen.getByRole('button', { name: /^Project plan/ })).toHaveFocus();
  });
});
