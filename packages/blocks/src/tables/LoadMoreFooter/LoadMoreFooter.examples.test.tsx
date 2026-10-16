import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CursorExample from './examples/cursor';
import FlagExample from './examples/flag';
import CardsExample from './examples/cards';
import ExhaustedExample from './examples/exhausted';

describe('LoadMoreFooter consumer examples', () => {
  it('keeps a settled error visible without retry in the exhausted example', () => {
    render(<ExhaustedExample />);
    expect(screen.getByRole('heading', { name: 'Request failed' })).toBeVisible();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText(/40 items loaded/)).toBeVisible();
  });

  it.each([
    ['table', CursorExample],
    ['cards', CardsExample],
  ] as const)('appends the next cursor batch in the %s example', async (_name, Example) => {
    render(<Example />);
    expect(screen.getByText('Record 1')).toBeVisible();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Load more' }));
    expect(await screen.findByText('Record 3')).toBeVisible();
    expect(screen.getByText('Record 1')).toBeVisible();
    const footer = screen.getByRole('group', { name: 'Load more items' });
    expect(within(footer).queryByRole('button')).toBeNull();
    expect(screen.getByText(/4 items loaded/)).toHaveFocus();
  });

  it('appends a flag-mode batch and uses the root exhaustion target', async () => {
    render(<FlagExample />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Load more' }));
    expect(await screen.findByText(/4 items loaded/)).toBeVisible();
    expect(screen.getByRole('group')).toHaveFocus();
  });
});
