import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConversationList } from './ConversationList';

const items = [{ id: 'a', title: 'Budget review', updatedAt: new Date(2026, 2, 10, 9) }];

describe('ConversationList row menus', () => {
  it('leaves the nav with Tab after opening another row’s actions with the pointer', async () => {
    const user = userEvent.setup();
    render(
      <>
        <ConversationList
          items={[...items, { ...items[0]!, id: 'b', title: 'Project plan' }]}
          groupBy={false}
          activeId="b"
          onRename={vi.fn()}
        />
        <button>After</button>
      </>,
    );
    const trigger = screen.getByRole('button', { name: 'More actions for Budget review' });
    await user.click(trigger);
    await screen.findByRole('menu');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('keeps the actions trigger a sibling outside the tab order, and returns focus with Left or Escape', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const onCustom = vi.fn();
    render(
      <ConversationList
        items={items}
        groupBy={false}
        onRename={vi.fn()}
        onDelete={onDelete}
        itemActions={() => [{ label: 'Export', onSelect: onCustom }]}
      />,
    );
    const row = screen.getByRole('button', { name: /^Budget review/ });
    const trigger = screen.getByRole('button', { name: 'More actions for Budget review' });
    expect(trigger.parentElement).toBe(row.parentElement);
    expect(trigger.tabIndex).toBe(-1);
    await user.tab();
    await user.keyboard('{ArrowRight}');
    expect(trigger).toHaveFocus();
    await user.keyboard('{ArrowLeft}');
    expect(row).toHaveFocus();
    await user.keyboard('{ArrowRight}{Escape}');
    expect(row).toHaveFocus();
    await user.click(trigger);
    await screen.findByRole('menu');
    expect(screen.getAllByRole('menuitem').map((el) => el.textContent)).toEqual(['Rename', 'Delete', 'Export']);
    expect(screen.getByRole('menuitem', { name: 'Delete' }).className).toContain('text-destructive-text');
    await user.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledExactlyOnceWith('a');
    await user.click(trigger);
    await screen.findByRole('menu');
    await user.click(screen.getByRole('menuitem', { name: 'Export' }));
    expect(onCustom).toHaveBeenCalledTimes(1);
  });

  it('includes only supported handlers and mirrors the focus keys in RTL', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider locale="en" dir="rtl">
        <ConversationList items={items} groupBy={false} itemActions={() => [{ label: 'Export' }]} />
      </I18nProvider>,
    );
    const row = screen.getByRole('button', { name: /^Budget review/ });
    const trigger = screen.getByRole('button', { name: 'More actions for Budget review' });
    await user.tab();
    await user.keyboard('{ArrowLeft}');
    expect(trigger).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(row).toHaveFocus();
    await user.click(trigger);
    await screen.findByRole('menu');
    expect(screen.getAllByRole('menuitem').map((el) => el.textContent)).toEqual(['Export']);
  });
});

describe('ConversationList inline rename', () => {
  it.each(['F2', 'menu'])(
    'selects the existing title via %s, trims the new title, and restores focus',
    async (method) => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      const onActiveChange = vi.fn();
      render(<ConversationList items={items} groupBy={false} onRename={onRename} onActiveChange={onActiveChange} />);
      await user.tab();
      if (method === 'F2') await user.keyboard('{F2}');
      else {
        await user.click(screen.getByRole('button', { name: 'More actions for Budget review' }));
        await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));
      }
      const input = await screen.findByRole('textbox', { name: 'Rename' });
      await waitFor(() => expect(input).toHaveFocus());
      expect((input as HTMLInputElement).selectionStart).toBe(0);
      expect((input as HTMLInputElement).selectionEnd).toBe('Budget review'.length);
      await user.keyboard('  Q3 budget  {Enter}');
      expect(onRename).toHaveBeenCalledExactlyOnceWith('a', 'Q3 budget');
      await waitFor(() => expect(screen.getByRole('button', { name: /^Budget review/ })).toHaveFocus());
      expect(onActiveChange).not.toHaveBeenCalled();
    },
  );

  it.each(['{Enter}', '{Backspace}   {Enter}', 'Other title{Escape}'])(
    'cancels empty, unchanged or escaped edits: %s',
    async (keys) => {
      const user = userEvent.setup();
      const onRename = vi.fn();
      render(<ConversationList items={items} groupBy={false} onRename={onRename} />);
      await user.tab();
      await user.keyboard('{F2}');
      await waitFor(() => expect(screen.getByRole('textbox')).toHaveFocus());
      await user.keyboard(keys);
      expect(onRename).not.toHaveBeenCalled();
      await waitFor(() => expect(screen.getByRole('button', { name: /^Budget review/ })).toHaveFocus());
    },
  );

  it('does not rename disabled rows or rows without a rename handler', async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();
    const { rerender } = render(<ConversationList items={items} groupBy={false} />);
    await user.tab();
    await user.keyboard('{F2}');
    expect(screen.queryByRole('textbox')).toBeNull();
    rerender(<ConversationList items={[{ ...items[0]!, disabled: true }]} groupBy={false} onRename={onRename} />);
    await user.click(screen.getByRole('button', { name: /^Budget review/ }));
    await user.keyboard('{F2}');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(onRename).not.toHaveBeenCalled();
  });
});
