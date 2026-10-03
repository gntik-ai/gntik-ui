import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Field, FieldDescription, FieldLabel } from '../Field';
import { DatePicker } from './DatePicker';
import { DateRangePicker } from './DateRangePicker';
import DatePickerBasic from './examples/DatePickerBasic';
import DateRangePickerPresets from './examples/DateRangePickerPresets';
import DatePickerWithTime from './examples/DatePickerWithTime';

const today = new Date(2026, 2, 11);

function setup() {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <Field>
      <FieldLabel>Due date</FieldLabel>
      <DatePicker locale="en-US" weekStartsOn={1} today={today} defaultValue={new Date(2026, 2, 20)} onValueChange={onValueChange} />
      <FieldDescription>When the invoice is due.</FieldDescription>
    </Field>,
  );
  return { user, onValueChange, field: screen.getByRole('combobox', { name: 'Due date' }) };
}

describe('DatePicker', () => {
  it('shows the formatted date in a labelled, described field', () => {
    const { field } = setup();
    expect(field).toHaveValue('Mar 20, 2026');
    expect(field).toHaveAttribute('aria-haspopup', 'dialog');
    expect(field).toHaveAttribute('aria-expanded', 'false');
    expect(field).toHaveAccessibleDescription('When the invoice is due.');
  });

  it('Enter opens with focus on the selected day; picking a day closes and returns focus', async () => {
    const { user, field, onValueChange } = setup();
    await user.tab();
    expect(field).toHaveFocus();
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Friday, March 20, 2026' })).toHaveFocus());
    await user.keyboard('{ArrowRight}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 21));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(field).toHaveValue('Mar 21, 2026');
    await waitFor(() => expect(field).toHaveFocus());
  });

  it('Escape closes and returns focus to the field', async () => {
    const { user, field, onValueChange } = setup();
    await user.click(field);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(field).toHaveFocus());
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('range: presets apply and close; the calendar applies after the second day', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DateRangePicker aria-label="Period" locale="en-US" today={today} onValueChange={onValueChange} />);
    const field = screen.getByRole('combobox', { name: 'Period' });
    await user.click(field);
    await user.click(await screen.findByRole('button', { name: 'Last 7 days' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: new Date(2026, 2, 5), end: new Date(2026, 2, 11) });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect((field as HTMLInputElement).value).toMatch(/^Mar 5\s–\s11, 2026$/);

    await user.click(field);
    expect(await screen.findByRole('button', { name: 'Last 7 days' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Last month' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: new Date(2026, 1, 1), end: new Date(2026, 1, 28) });

    await user.click(field);
    await user.click(await screen.findByRole('button', { name: 'Custom' }));
    await user.click(screen.getByRole('button', { name: 'Monday, February 2, 2026' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tuesday, February 10, 2026' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: new Date(2026, 1, 2), end: new Date(2026, 1, 10) });
  });

  it('withTime: picking a day keeps the time and stays open; Tab reaches the time; Done closes', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <DatePicker withTime aria-label="Publish at" locale="en-US" hourCycle={24} today={today} defaultValue={new Date(2026, 2, 20, 14, 30)} onValueChange={onValueChange} name="at" />,
    );
    const field = screen.getByRole('combobox', { name: 'Publish at' });
    expect(field).toHaveValue('Mar 20, 2026, 14:30');
    expect(container.querySelector('input[name="at"]')).toHaveValue('2026-03-20T14:30');
    await user.click(field);
    const dialog = await screen.findByRole('dialog');
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Friday, March 20, 2026' })).toHaveFocus());
    await user.keyboard('{ArrowRight}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 21, 14, 30));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.tab();
    const hours = within(dialog).getByRole('spinbutton', { name: 'Hours' });
    expect(hours).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 21, 15, 30));
    await user.click(within(dialog).getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(field).toHaveValue('Mar 21, 2026, 15:30');
  });

  it.each([
    ['DatePickerWithTime', DatePickerWithTime, 'Publish at'],
    ['DatePickerBasic', DatePickerBasic, 'Release date'],
    ['DateRangePickerPresets', DateRangePickerPresets, 'Usage period'],
  ] as const)('%s has no axe violations, closed and open', async (_n, Example, name) => {
    const user = userEvent.setup();
    render(<Example />);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('combobox', { name }));
    await screen.findByRole('dialog');
    await expectNoAxeViolations();
  });
});
