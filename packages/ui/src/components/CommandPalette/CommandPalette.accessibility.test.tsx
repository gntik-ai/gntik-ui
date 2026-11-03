import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CommandPaletteBasic from './examples/CommandPaletteBasic';

it('lets keyboard users tab into command results and back to search', async () => {
  const user = userEvent.setup();
  render(<CommandPaletteBasic />);
  await user.click(screen.getByRole('button', { name: /Search or run a command/ }));
  const input = await screen.findByRole('combobox');
  await waitFor(() => expect(input).toHaveFocus());

  await user.tab();
  expect(screen.getByRole('listbox')).toHaveFocus();
  await user.tab({ shift: true });
  expect(input).toHaveFocus();
});
