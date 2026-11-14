import { useState } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, FieldLabel } from '../Field';
import { I18nProvider } from '../../i18n/I18nProvider';
import type { DateRange } from '../Calendar/calendar-utils';
import { DateRangePicker, type DateRangePickerProps } from './DateRangePicker';

const today = new Date(2026, 2, 11);

function renderRange(props: DateRangePickerProps = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <Field>
      <FieldLabel>Audit window</FieldLabel>
      <DateRangePicker editable locale="en-US" today={today} onValueChange={onValueChange} {...props} />
    </Field>,
  );
  return { user, onValueChange };
}

const seg = (name: string) => screen.getByRole('spinbutton', { name });
const paste = (name: string, text: string) => fireEvent.paste(seg(name), { clipboardData: { getData: () => text } });
const clearSegments = async (
  user: ReturnType<typeof userEvent.setup>,
  side: string,
  parts = ['Month', 'Day', 'Year'],
) => {
  for (const part of parts) {
    await user.click(seg(`${side}, ${part}`));
    await user.keyboard('{Backspace}');
  }
};

describe('DateRangePicker editable', () => {
  it('names the two ends Start date and End date inside one labelled group', () => {
    renderRange();
    expect(screen.getByRole('group', { name: 'Audit window' })).toBeInTheDocument();
    expect(screen.getAllByRole('spinbutton').map((s) => s.getAttribute('aria-label'))).toEqual([
      'Start date, Month',
      'Start date, Day',
      'Start date, Year',
      'End date, Month',
      'End date, Day',
      'End date, Year',
    ]);
    expect(screen.getByRole('button', { name: 'Choose date' })).toHaveAttribute('aria-haspopup', 'dialog');
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('names the ends in Spanish', () => {
    render(
      <I18nProvider locale="es-ES">
        <DateRangePicker editable locale="es-ES" />
      </I18nProvider>,
    );
    expect(seg('Fecha de inicio, Día')).toBeInTheDocument();
    expect(seg('Fecha de fin, Año')).toBeInTheDocument();
  });

  it('emits a valid typed pair once', async () => {
    const { user, onValueChange } = renderRange();
    await user.click(seg('Start date, Month'));
    await user.keyboard('03102026');
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard('03202026');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith({ start: new Date(2026, 2, 10), end: new Date(2026, 2, 20) });
  });

  it('marks an end before the start invalid and does not emit it', async () => {
    const { user, onValueChange } = renderRange({ defaultValue: { start: new Date(2026, 2, 10), end: null } });
    await user.click(seg('End date, Month'));
    await user.keyboard('03052026');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('group', { name: 'Audit window' })).toHaveAttribute('aria-invalid', 'true');
    expect(seg('End date, Month')).toHaveAttribute('aria-invalid', 'true');
  });

  it('compares years 0-99 as years, not as 1900s', async () => {
    const { user, onValueChange } = renderRange();
    await user.click(seg('Start date, Month'));
    await user.keyboard('01010050');
    await user.keyboard('01010040');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('group', { name: 'Audit window' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not emit while only the day of an end is cleared, and emits nulls once all segments are cleared', async () => {
    const { user, onValueChange } = renderRange({
      defaultValue: { start: new Date(2026, 2, 10), end: new Date(2026, 2, 20) },
    });
    await clearSegments(user, 'Start date', ['Day']);
    expect(onValueChange).not.toHaveBeenCalled();
    await clearSegments(user, 'End date', ['Day']);
    expect(onValueChange).not.toHaveBeenCalled();
    await clearSegments(user, 'Start date', ['Month', 'Year']);
    expect(onValueChange).not.toHaveBeenCalled();
    await clearSegments(user, 'End date', ['Month']);
    expect(onValueChange).not.toHaveBeenCalled();
    await clearSegments(user, 'End date', ['Year']);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith({ start: null, end: null });
  });

  it('does not emit a pair with one end cleared entirely', async () => {
    const { user, onValueChange } = renderRange({
      defaultValue: { start: new Date(2026, 2, 10), end: new Date(2026, 2, 20) },
    });
    await clearSegments(user, 'End date');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('passes the typed start as rangeStart when validating the end, then emits the rejected pair as invalid', async () => {
    const isDateDisabled = vi.fn(
      (date: Date, context: { rangeStart: Date | null }) =>
        !!context.rangeStart && date.getTime() - context.rangeStart.getTime() > 5 * 86_400_000,
    );
    const { user, onValueChange } = renderRange({ isDateDisabled });
    await user.click(seg('Start date, Month'));
    await user.keyboard('03012026');
    await user.keyboard('03202026');
    expect(isDateDisabled).toHaveBeenCalledWith(new Date(2026, 2, 20), { rangeStart: new Date(2026, 2, 1) });
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith({ start: new Date(2026, 2, 1), end: new Date(2026, 2, 20) });
    expect(screen.getByRole('group', { name: 'Audit window' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('opens the calendar on the typed range and a pick rewrites the segments, closes and focuses the button', async () => {
    const { user, onValueChange } = renderRange({
      defaultValue: { start: new Date(2026, 2, 10), end: new Date(2026, 2, 20) },
    });
    await user.click(seg('Start date, Day'));
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getAllByText(/2026/).length).toBeGreaterThan(0);
    await user.click(within(dialog).getByRole('button', { name: 'Tuesday, March 3, 2026' }));
    await user.click(within(dialog).getByRole('button', { name: 'Thursday, March 5, 2026' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(onValueChange).toHaveBeenLastCalledWith({ start: new Date(2026, 2, 3), end: new Date(2026, 2, 5) });
    expect(screen.getAllByRole('spinbutton').map((s) => s.textContent)).toEqual([
      '03',
      '03',
      '2026',
      '03',
      '05',
      '2026',
    ]);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Choose date' })).toHaveFocus());
  });

  it('pastes an ISO date into the start and emits nothing until the pair is complete', () => {
    const { onValueChange } = renderRange();
    paste('Start date, Day', '2026-03-10');
    expect(onValueChange).not.toHaveBeenCalled();
    paste('End date, Day', '2026-03-12');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith({ start: new Date(2026, 2, 10), end: new Date(2026, 2, 12) });
  });

  it('inherits a disabled Field and an invalid Field', async () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Field disabled>
        <FieldLabel>Audit window</FieldLabel>
        <DateRangePicker editable locale="en-US" open today={today} onValueChange={onValueChange} />
      </Field>,
    );
    screen.getAllByRole('spinbutton').forEach((s) => expect(s).toHaveAttribute('aria-disabled', 'true'));
    expect(screen.getByRole('button', { name: 'Choose date' })).toBeDisabled();
    const user = userEvent.setup();
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Tuesday, March 3, 2026' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Thursday, March 5, 2026' }));
    expect(onValueChange).not.toHaveBeenCalled();
    rerender(
      <Field invalid>
        <FieldLabel>Audit window</FieldLabel>
        <DateRangePicker
          editable
          locale="en-US"
          today={today}
          defaultValue={{ start: new Date(2026, 2, 1), end: null }}
        />
      </Field>,
    );
    expect(screen.getByRole('group', { name: 'Audit window' })).toHaveAttribute('aria-invalid', 'true');
    await user.click(seg('Start date, Day'));
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('group', { name: 'Audit window' })).toHaveAttribute('aria-invalid', 'true');
    screen.getAllByRole('spinbutton').forEach((s) => expect(s).toHaveAttribute('aria-invalid', 'true'));
  });

  it('submits both typed dates through the hidden inputs', () => {
    const { onValueChange } = renderRange({ name: 'window' });
    paste('Start date, Day', '2026-03-10');
    paste('End date, Day', '2026-03-12');
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(document.querySelector('input[name="window-start"]')).toHaveValue('2026-03-10');
    expect(document.querySelector('input[name="window-end"]')).toHaveValue('2026-03-12');
  });

  it('refreshes the segments when a controlled value returns to a value that was typed earlier', async () => {
    const march = { start: new Date(2026, 2, 10), end: new Date(2026, 2, 20) };
    const april = { start: new Date(2026, 3, 1), end: new Date(2026, 3, 5) };
    function Harness() {
      const [value, setValue] = useState<DateRange>({ start: null, end: null });
      return (
        <Field>
          <FieldLabel>Audit window</FieldLabel>
          <DateRangePicker editable locale="en-US" today={today} name="window" value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue(april)}>
            Set April
          </button>
          <button type="button" onClick={() => setValue(march)}>
            Set March
          </button>
        </Field>
      );
    }
    const user = userEvent.setup();
    render(<Harness />);
    paste('Start date, Day', '2026-03-10');
    paste('End date, Day', '2026-03-20');
    await user.click(screen.getByRole('button', { name: 'Set April' }));
    expect(seg('Start date, Month')).toHaveTextContent('04');
    expect(document.querySelector('input[name="window-start"]')).toHaveValue('2026-04-01');
    await user.click(screen.getByRole('button', { name: 'Set March' }));
    expect(seg('Start date, Month')).toHaveTextContent('03');
    expect(seg('End date, Day')).toHaveTextContent('20');
    expect(document.querySelector('input[name="window-start"]')).toHaveValue('2026-03-10');
  });

  it('previews a typed start in the calendar before the end is typed', async () => {
    const { user, onValueChange } = renderRange();
    await user.click(seg('Start date, Month'));
    await user.keyboard('10012026');
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Choose date' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'Thursday, October 1, 2026' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Wednesday, March 11, 2026' })).not.toBeInTheDocument();
  });

  it('shows a typed range with years below 100 in its own year in the calendar', async () => {
    const { user } = renderRange();
    await user.click(seg('Start date, Month'));
    await user.keyboard('03010050');
    await user.keyboard('03200050');
    await user.click(screen.getByRole('button', { name: 'Choose date' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('February 50')).toBeInTheDocument();
    expect(within(dialog).queryByText(/19\d\d/)).not.toBeInTheDocument();
  });
});
