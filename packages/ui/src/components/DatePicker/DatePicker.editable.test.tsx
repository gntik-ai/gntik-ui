import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, FieldLabel } from '../Field';
import { DatePicker } from './DatePicker';

it('types one date in a labelled group and opens on the typed day without replacing the trigger', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <Field>
      <FieldLabel>Expires on</FieldLabel>
      <DatePicker editable locale="en-US" onValueChange={change} />
    </Field>,
  );
  const group = screen.getByRole('group', { name: 'Expires on' });
  expect(
    within(group)
      .getAllByRole('spinbutton')
      .map((s) => s.getAttribute('aria-label')),
  ).toEqual(['Month', 'Day', 'Year']);
  const month = screen.getByRole('spinbutton', { name: 'Month' });
  const choose = screen.getByRole('button', { name: 'Choose date' });
  await user.click(month);
  await user.keyboard('10012026');
  expect(change).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1));
  expect(screen.getByRole('spinbutton', { name: 'Month' })).toBe(month);
  await user.click(choose);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Thursday, October 1, 2026' })).toHaveFocus());
  expect(choose).toHaveAttribute('aria-expanded', 'true');
});

export function paste(segment: HTMLElement, text: string) {
  fireEvent.paste(segment, { clipboardData: { getData: () => text } });
}

it('waits for an explicit period, emits once, and accepts a 12-hour paste', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(<DatePicker editable withTime hourCycle={12} locale="en-US" onValueChange={change} />);
  await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
  await user.keyboard('100120260230');
  expect(change).not.toHaveBeenCalled();
  await user.keyboard('p');
  expect(change).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1, 14, 30));
  change.mockClear();
  paste(screen.getByRole('spinbutton', { name: 'Day' }), '2026-10-02');
  expect(change).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 2));
});

it('shows a literal small year and returns focus after an Alt+ArrowDown calendar pick with time', async () => {
  const user = userEvent.setup();
  render(<DatePicker editable withTime hourCycle={24} locale="en-US" />);
  const day = screen.getByRole('spinbutton', { name: 'Day' });
  paste(day, '0099-03-01T14:30');
  await user.click(day);
  await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
  await user.click(await screen.findByRole('button', { name: 'Tuesday, March 3, 99' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.getByRole('spinbutton', { name: 'Year' })).toHaveAttribute('aria-valuenow', '99');
  expect(day).toHaveAttribute('aria-valuenow', '3');
  expect(screen.getByRole('button', { name: 'Choose date' })).toHaveFocus();
});

it('inherits Field invalid and disabled states, including the popup Clear action', async () => {
  const clear = vi.fn();
  const change = vi.fn();
  const { rerender } = render(
    <Field invalid>
      <FieldLabel>Due</FieldLabel>
      <DatePicker editable defaultValue={new Date(2026, 2, 1)} onValueChange={change} />
    </Field>,
  );
  const group = screen.getByRole('group', { name: 'Due' });
  expect(group).toHaveAttribute('aria-invalid', 'true');
  expect(group).toHaveAttribute('data-invalid');
  paste(screen.getByRole('spinbutton', { name: 'Day' }), '2026-03-02');
  expect(group).toHaveAttribute('aria-invalid', 'true');
  rerender(
    <Field disabled>
      <FieldLabel>Due</FieldLabel>
      <DatePicker editable open clearable defaultValue={new Date(2026, 2, 1)} onClear={clear} />
    </Field>,
  );
  expect(screen.getByRole('button', { name: 'Choose date' })).toBeDisabled();
  for (const segment of screen.getAllByRole('spinbutton')) expect(segment).toHaveAttribute('aria-disabled', 'true');
  const action = await screen.findByRole('button', { name: 'Clear' });
  expect(action).toBeDisabled();
  fireEvent.click(action);
  expect(clear).not.toHaveBeenCalled();
});

it('edits UTC wall time without passing through host DST and rebuilds drafts when the zone changes', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { rerender } = render(
    <DatePicker editable withTime hourCycle={24} timeZone="UTC" locale="en-US" onValueChange={change} />,
  );
  await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
  await user.keyboard('030820260230');
  expect(change).toHaveBeenCalledExactlyOnceWith(new Date('2026-03-08T02:30:00Z'));
  rerender(
    <DatePicker
      editable
      withTime
      hourCycle={24}
      timeZone="America/Los_Angeles"
      locale="en-US"
      value={new Date('2026-03-08T02:30:00Z')}
    />,
  );
  expect(screen.getByRole('spinbutton', { name: 'Hours' })).toHaveAttribute('aria-valuenow', '18');
  expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveAttribute('aria-valuenow', '7');
});

it('keeps an open trigger and focused segment in place across external updates and returns to a previous typed value', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { rerender } = render(
    <DatePicker editable locale="en-US" defaultValue={new Date(2026, 9, 1)} onValueChange={change} />,
  );
  const day = screen.getByRole('spinbutton', { name: 'Day' });
  const choose = screen.getByRole('button', { name: 'Choose date' });
  await user.click(choose);
  await screen.findByRole('dialog');
  await user.click(day);
  paste(day, '2026-10-03');
  expect(day).toHaveFocus();
  expect(screen.getByRole('button', { name: 'Choose date' })).toBe(choose);
  expect(choose).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('button', { name: 'Saturday, October 3, 2026' })).toHaveAttribute('tabindex', '0');
  rerender(<DatePicker editable locale="en-US" value={new Date(2026, 10, 2)} />);
  expect(day).toHaveAttribute('aria-valuenow', '2');
  rerender(<DatePicker editable locale="en-US" value={new Date(2026, 9, 3)} />);
  expect(day).toHaveAttribute('aria-valuenow', '3');
  expect(day).toHaveFocus();
});

it('rebuilds an incomplete draft in place after a timezone change', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<DatePicker editable timeZone="UTC" locale="en-US" />);
  const month = screen.getByRole('spinbutton', { name: 'Month' });
  await user.click(month);
  await user.keyboard('10');
  rerender(<DatePicker editable timeZone="America/Los_Angeles" locale="en-US" />);
  expect(screen.getByRole('spinbutton', { name: 'Month' })).toBe(month);
  expect(month).toHaveAttribute('aria-valuetext', 'Empty');
});

it('uses Spanish segment order', () => {
  render(<DatePicker editable locale="es-ES" />);
  expect(screen.getAllByRole('spinbutton').map((s) => s.getAttribute('aria-label'))).toEqual(['Day', 'Month', 'Year']);
});

it.each([{ max: new Date(2026, 0, 1) }, { min: new Date(2027, 0, 1) }, { isDateDisabled: () => true }])(
  'emits a constrained date, marks the group invalid, and clears a segment (%j)',
  async (bounds) => {
    const user = userEvent.setup();
    const change = vi.fn();
    render(<DatePicker editable locale="en-US" {...bounds} onValueChange={change} />);
    const day = screen.getByRole('spinbutton', { name: 'Day' });
    paste(day, '2026-10-01');
    expect(change).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1));
    expect(screen.getByRole('group', { name: 'Date' })).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('group', { name: 'Date' })).toHaveClass('data-invalid:border-destructive/70');
    await user.click(day);
    await user.keyboard('{Backspace}');
    expect(change).toHaveBeenLastCalledWith(null);
  },
);

it('restores rejected controlled values repeatedly while preserving focus, hidden value, and preview', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const { container } = render(
    <DatePicker editable locale="en-US" value={new Date(2026, 2, 3)} onValueChange={change} name="date" />,
  );
  const day = screen.getByRole('spinbutton', { name: 'Day' });
  await user.click(day);
  for (let i = 0; i < 3; i++) {
    await user.keyboard('{ArrowUp}');
    expect(day).toHaveFocus();
    expect(day).toHaveAttribute('aria-valuenow', '3');
    expect(screen.getByRole('spinbutton', { name: 'Day' })).toBe(day);
    expect(container.querySelector('input[name="date"]')).toHaveValue('2026-03-03');
  }
  expect(change).toHaveBeenCalledTimes(3);
  paste(day, '2027-10-01');
  await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Tuesday, March 3, 2026' })).toHaveFocus());
});

it('preserves a flushed month and applies defaultMonth only before the first edit', async () => {
  const user = userEvent.setup();
  const changeMonth = vi.fn();
  render(<DatePicker editable locale="en-US" defaultMonth={new Date(2025, 4, 1)} onMonthChange={changeMonth} />);
  const choose = screen.getByRole('button', { name: 'Choose date' });
  await user.click(choose);
  expect(await screen.findByRole('grid', { name: 'May 2025' })).toBeInTheDocument();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  await user.click(choose);
  expect(await screen.findByRole('grid', { name: 'May 2025' })).toBeInTheDocument();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  const month = screen.getByRole('spinbutton', { name: 'Month' });
  await user.click(month);
  await user.keyboard('10012026');
  expect(changeMonth).toHaveBeenLastCalledWith(new Date(2026, 9, 1));
  await user.click(month);
  await user.keyboard('1{Alt>}{ArrowDown}{/Alt}');
  expect(await screen.findByRole('grid', { name: 'January 2026' })).toBeInTheDocument();
  expect(choose).toHaveAttribute('aria-expanded', 'true');
});

it.each([false, true])(
  'rewrites segments and restores button focus on a calendar pick (withTime=%s)',
  async (withTime) => {
    const user = userEvent.setup();
    render(<DatePicker editable withTime={withTime} locale="en-US" defaultValue={new Date(2026, 2, 1)} />);
    const choose = screen.getByRole('button', { name: 'Choose date' });
    const day = screen.getByRole('spinbutton', { name: 'Day' });
    await user.click(choose);
    await user.click(await screen.findByRole('button', { name: 'Tuesday, March 3, 2026' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(day).toHaveTextContent('03');
    expect(screen.getByRole('spinbutton', { name: 'Month' })).toHaveTextContent('03');
    expect(choose).toHaveFocus();
  },
);

it('keeps a small year when selecting a popup time', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <DatePicker
      editable
      withTime
      hourCycle={24}
      locale="en-US"
      defaultValue={new Date('0099-03-01T14:30:00')}
      onValueChange={change}
    />,
  );
  await user.click(screen.getByRole('button', { name: 'Choose date' }));
  const popup = await screen.findByRole('dialog');
  await user.click(within(popup).getByRole('spinbutton', { name: 'Hours' }));
  await user.keyboard('{ArrowUp}');
  expect(change).toHaveBeenCalledExactlyOnceWith(new Date('0099-03-01T15:30:00'), { reason: 'time' });
});

it('requests a controlled calendar month when typing changes it', async () => {
  const user = userEvent.setup();
  const changeMonth = vi.fn();
  render(<DatePicker editable locale="en-US" value={null} month={new Date(2026, 2, 1)} onMonthChange={changeMonth} />);
  await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
  await user.keyboard('10012026');
  expect(changeMonth).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1));
});

it('blocks preset changes inside a disabled Field even when the popup is externally open', async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <Field disabled>
      <DatePicker
        editable
        open
        clearable
        defaultValue={new Date(2026, 2, 3)}
        onValueChange={change}
        presets={[{ id: 'none', label: 'No date', date: () => null }]}
      />
    </Field>,
  );
  await user.click(await screen.findByRole('button', { name: 'No date' }));
  expect(change).not.toHaveBeenCalled();
});
