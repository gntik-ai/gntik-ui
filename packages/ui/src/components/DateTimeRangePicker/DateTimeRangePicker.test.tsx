import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { DateTimeRangePicker, type DateTimeRangePickerProps } from './DateTimeRangePicker';
import DateTimeRangePickerBasic from './examples/DateTimeRangePickerBasic';
import { relativeTimeRangeLabel, resolveTimeRange, timeRangeError } from './time-range';

const now = new Date(2026, 2, 11, 12, 0);

function setup(props: Partial<DateTimeRangePickerProps> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<DateTimeRangePicker aria-label="Window" locale="en-US" hourCycle={24} now={now} onValueChange={onValueChange} {...props} />);
  return { user, onValueChange, field: screen.getByRole('combobox', { name: 'Window' }) };
}

describe('DateTimeRangePicker', () => {
  it('Enter opens with focus on the active preset; a preset applies and closes', async () => {
    const { user, field, onValueChange } = setup({ defaultValue: { mode: 'relative', amount: 1, unit: 'hour' } });
    expect(field).toHaveValue('Last hour');
    await user.tab();
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Last hour' })).toHaveFocus());
    expect(within(dialog).getByRole('button', { name: 'Last hour' })).toHaveAttribute('aria-pressed', 'true');
    await user.tab({ shift: true });
    expect(within(dialog).getByRole('button', { name: 'Last 15 minutes' })).toHaveFocus();
    await user.keyboard(' ');
    expect(onValueChange).toHaveBeenLastCalledWith({ mode: 'relative', amount: 15, unit: 'minute' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(field).toHaveValue('Last 15 minutes');
    await waitFor(() => expect(field).toHaveFocus());
  });

  it('relative mode: Last N + unit, then Apply', async () => {
    const { user, field, onValueChange } = setup();
    await user.click(field);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'Relative' })).toHaveAttribute('aria-pressed', 'true');
    const amount = within(dialog).getByRole('textbox', { name: 'Amount' });
    await user.clear(amount);
    await user.type(amount, '6');
    await user.click(within(dialog).getByRole('button', { name: 'Apply' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ mode: 'relative', amount: 6, unit: 'hour' });
    expect(field).toHaveValue('Last 6 hours');
  });

  it('ArrowRight in the mode switch; absolute mode validates end after start', async () => {
    const { user, field, onValueChange } = setup();
    await user.click(field);
    const dialog = await screen.findByRole('dialog');
    within(dialog).getByRole('button', { name: 'Relative' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(within(dialog).getByRole('button', { name: 'Absolute' })).toHaveFocus();
    await user.keyboard('{Enter}');
    const apply = within(dialog).getByRole('button', { name: 'Apply' });
    expect(apply).toBeDisabled();
    await user.click(within(dialog).getByRole('button', { name: 'Tuesday, March 10, 2026' }));
    await user.click(within(dialog).getByRole('button', { name: 'Tuesday, March 10, 2026' }));
    const startHours = within(within(dialog).getByRole('group', { name: 'Start time' })).getByRole('spinbutton', { name: 'Hours' });
    const endHours = within(within(dialog).getByRole('group', { name: 'End time' })).getByRole('spinbutton', { name: 'Hours' });
    await user.click(startHours);
    await user.keyboard('18');
    await user.click(endHours);
    await user.keyboard('09');
    await user.click(within(within(dialog).getByRole('group', { name: 'End time' })).getByRole('spinbutton', { name: 'Minutes' }));
    await user.keyboard('00');
    expect(within(dialog).getByText('The end must be after the start.')).toBeInTheDocument();
    expect(apply).toBeDisabled();
    await user.click(endHours);
    await user.keyboard('20');
    expect(within(dialog).queryByText('The end must be after the start.')).not.toBeInTheDocument();
    await user.click(apply);
    expect(onValueChange).toHaveBeenLastCalledWith({ mode: 'absolute', start: new Date(2026, 2, 10, 18, 0), end: new Date(2026, 2, 10, 20, 0) });
    expect((field as HTMLInputElement).value).toMatch(/^Mar 10, 2026, 18:00\s–\s20:00$/);
  });

  it('Custom range switches to absolute mode and focuses the calendar; Escape closes without applying', async () => {
    const { user, field, onValueChange } = setup();
    await user.click(field);
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Custom range' }));
    expect(within(dialog).getByRole('button', { name: 'Absolute' })).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Wednesday, March 11, 2026' })).toHaveFocus());
    await user.keyboard('{ArrowLeft}');
    expect(within(dialog).getByRole('button', { name: 'Tuesday, March 10, 2026' })).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('helpers', () => {
    const r = resolveTimeRange({ mode: 'relative', amount: 7, unit: 'day' }, now);
    expect(r.end).toBe(now);
    expect(now.getTime() - r.start.getTime()).toBe(7 * 86_400_000);
    expect(timeRangeError(now, now)).toBe('endBeforeStart');
    expect(timeRangeError(null, now)).toBe('incomplete');
    expect(relativeTimeRangeLabel(30, 'day', (k, v) => `${k}:${v?.count}`)).toBe('timeRange.lastDays:30');
  });

  it('DateTimeRangePickerBasic has no axe violations, closed and open', async () => {
    const user = userEvent.setup();
    render(<DateTimeRangePickerBasic />);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('combobox', { name: 'Incident period' }));
    await screen.findByRole('dialog');
    await expectNoAxeViolations();
  });
});
