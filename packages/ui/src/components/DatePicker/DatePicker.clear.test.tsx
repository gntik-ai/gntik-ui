import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangePicker } from './DateRangePicker';
import { DatePicker } from './DatePicker';

const date = new Date(2026, 2, 20);
it.each(['button', '{Delete}', '{Backspace}'])('clears DatePicker through %s', async (action) => {
  const calls: unknown[] = [];
  const { container } = render(
    <DatePicker
      clearable
      aria-label="Expiry"
      defaultValue={date}
      name="expires"
      onValueChange={(v) => calls.push(v)}
      onClear={() => calls.push('clear')}
    />,
  );
  const field = screen.getByRole('combobox', { name: 'Expiry' });
  const button = screen.getByRole('button', { name: 'Clear Expiry' });
  expect(field.contains(button)).toBe(false);
  if (action === 'button') await userEvent.click(button);
  else {
    field.focus();
    await userEvent.keyboard(action);
  }
  expect(calls).toEqual([null, 'clear']);
  expect(field).toHaveValue('');
  expect(container.querySelector('input[name="expires"]')).toHaveValue('');
  expect(field).toHaveFocus();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it.each([false, true])('popup Clear closes DatePicker and restores focus, withTime=%s', async (withTime) => {
  const change = vi.fn();
  render(<DatePicker clearable withTime={withTime} aria-label="Expiry" defaultValue={date} onValueChange={change} />);
  const field = screen.getByRole('combobox');
  await userEvent.click(field);
  const dialog = await screen.findByRole('dialog');
  const clear = within(dialog).getByRole('button', { name: 'Clear' });
  if (withTime) expect(clear.parentElement).toBe(within(dialog).getByRole('button', { name: 'Done' }).parentElement);
  await userEvent.click(clear);
  expect(change).toHaveBeenLastCalledWith(null);
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await waitFor(() => expect(field).toHaveFocus());
});
it.each([{ defaultValue: null }, { disabled: true }, { readOnly: true }, { clearable: false }])(
  'hides DatePicker clear for %o',
  (props) => {
    render(<DatePicker clearable aria-label="Expiry" defaultValue={date} {...props} />);
    expect(screen.queryByRole('button', { name: 'Clear Expiry' })).not.toBeInTheDocument();
  },
);

it.each(['button', '{Delete}', '{Backspace}', 'popup'])('clears DateRangePicker through %s', async (action) => {
  const change = vi.fn();
  const { container } = render(
    <DateRangePicker
      clearable
      aria-label="Period"
      name="period"
      defaultValue={{ start: date, end: date }}
      onValueChange={change}
    />,
  );
  const field = screen.getByRole('combobox');
  if (action === 'popup') {
    await userEvent.click(field);
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Clear' }));
  } else if (action === 'button') await userEvent.click(screen.getByRole('button', { name: 'Clear Period' }));
  else {
    field.focus();
    await userEvent.keyboard(action);
  }
  expect(change).toHaveBeenLastCalledWith({ start: null, end: null });
  expect(field).toHaveValue('');
  expect(container.querySelector('input[name="period-start"]')).toHaveValue('');
  expect(container.querySelector('input[name="period-end"]')).toHaveValue('');
  await waitFor(() => expect(field).toHaveFocus());
});
