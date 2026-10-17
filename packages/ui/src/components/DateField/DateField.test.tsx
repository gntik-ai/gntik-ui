import { useState } from 'react';
import { Field, FieldDescription, FieldLabel } from '../Field';
import userEvent from '@testing-library/user-event';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nProvider } from '../../i18n/I18nProvider';
import { DateField, type DateFieldProps } from './DateField';

describe('DateField', () => {
  it.each([
    ['en-US', ['Month', 'Day', 'Year'], 'Date'],
    ['es-ES', ['Día', 'Mes', 'Año'], 'Fecha'],
    ['sv-SE', ['Year', 'Month', 'Day'], 'Date'],
  ])('uses locale order and translated names in %s', (locale, names, label) => {
    render(
      <I18nProvider locale={locale}>
        <DateField />
      </I18nProvider>,
    );
    const group = screen.getByRole('group', { name: label });
    expect(screen.getAllByRole('group')).toHaveLength(1);
    expect(screen.getAllByRole('spinbutton').map((s) => s.getAttribute('aria-label'))).toEqual(names);
    expect(group.querySelectorAll('[data-literal]')).not.toHaveLength(0);
    group
      .querySelectorAll('[data-literal]')
      .forEach((literal) => expect(literal).toHaveAttribute('aria-hidden', 'true'));
  });
  it('types a Spanish date, advancing day to month to year and reporting once', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <I18nProvider locale="es-ES">
        <DateField onValueChange={onValueChange} />
      </I18nProvider>,
    );
    await user.click(screen.getByRole('spinbutton', { name: 'Día' }));
    await user.keyboard('01');
    expect(screen.getByRole('spinbutton', { name: 'Mes' })).toHaveFocus();
    await user.keyboard('10');
    expect(screen.getByRole('spinbutton', { name: 'Año' })).toHaveFocus();
    await user.keyboard('2026');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1));
  });
  it('pads typed digits, advances only at a full segment, and supports navigation and clearing', async () => {
    const user = userEvent.setup();
    render(<DateField locale="es-ES" />);
    const day = screen.getByRole('spinbutton', { name: 'Day' });
    const month = screen.getByRole('spinbutton', { name: 'Month' });
    await user.click(day);
    await user.keyboard('3');
    expect(day).toHaveFocus();
    await user.keyboard('{Backspace}4');
    expect(day).toHaveTextContent('04');
    expect(month).toHaveFocus();
    await user.keyboard('2');
    expect(month).toHaveTextContent('02');
    expect(screen.getByRole('spinbutton', { name: 'Year' })).toHaveFocus();
    await user.keyboard('{ArrowLeft}{Delete}');
    expect(month).toHaveFocus();
    expect(month).toHaveAttribute('aria-valuetext', 'Empty');
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('spinbutton', { name: 'Year' })).toHaveFocus();
  });

  it.each([
    [2028, 29],
    [2027, 28],
  ])('spins within the month and uses leap year bounds in %s', async (year, last) => {
    const user = userEvent.setup();
    const { rerender } = render(<DateField defaultValue={new Date(year, 0, 31)} />);
    let day = screen.getByRole('spinbutton', { name: 'Day' });
    await user.click(day);
    await user.keyboard('{ArrowUp}');
    expect(day).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByRole('spinbutton', { name: 'Month' })).toHaveAttribute('aria-valuenow', '1');
    await user.keyboard('{ArrowDown}');
    expect(day).toHaveAttribute('aria-valuenow', '31');
    rerender(<DateField defaultValue={new Date(year, 1, 1)} key="february" />);
    day = screen.getByRole('spinbutton', { name: 'Day' });
    await user.click(day);
    await user.keyboard('{End}');
    expect(day).toHaveAttribute('aria-valuenow', String(last));
    await user.keyboard('{Home}');
    expect(day).toHaveAttribute('aria-valuenow', '1');
    await user.click(screen.getByRole('spinbutton', { name: 'Year' }));
    await user.keyboard('{Delete}');
    await user.click(day);
    await user.keyboard('{End}');
    expect(day).toHaveAttribute('aria-valuenow', '31');
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('{Delete}');
    await user.click(day);
    await user.keyboard('{End}');
    expect(day).toHaveAttribute('aria-valuenow', '31');
  });
  it.each([
    ['31022026', null, true],
    ['29022028', new Date(2028, 1, 29), false],
  ])('reports calendar validity for %s', async (digits, expected, invalid) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DateField locale="es-ES" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('spinbutton', { name: 'Day' }));
    await user.keyboard(digits);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(expected);
    for (const segment of screen.getAllByRole('spinbutton')) {
      if (invalid) expect(segment).toHaveAttribute('aria-invalid', 'true');
      else expect(segment).not.toHaveAttribute('aria-invalid', 'true');
    }
    expect(screen.getByRole('group').hasAttribute('data-invalid')).toBe(invalid);
  });

  it.each<Partial<DateFieldProps>>([
    { min: new Date(2026, 0, 1) },
    { max: new Date(2025, 0, 1) },
    { isDateDisabled: () => true },
    { invalid: true },
  ])('reports dates rejected by constraints and marks every segment invalid (%j)', async (props) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DateField locale="es-ES" {...props} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('spinbutton', { name: 'Day' }));
    await user.keyboard('31122025');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2025, 11, 31));
    expect(screen.getByRole('group')).toHaveAttribute('data-invalid');
    screen.getAllByRole('spinbutton').forEach((s) => expect(s).toHaveAttribute('aria-invalid', 'true'));
  });
  it.each(['2026-10-01', '2026-10-01T14:30', '2026-10-01T14:30:15', '10/01/2026', '10.01.2026', '10-01-2026'])(
    'pastes %s into any segment and submits a date',
    async (text) => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(<DateField locale="en-US" name="from" onValueChange={onValueChange} />);
      for (const segment of screen.getAllByRole('spinbutton')) {
        fireEvent.paste(segment, { clipboardData: { getData: () => text } });
        expect(segment).not.toHaveAttribute('aria-valuetext', 'Empty');
      }
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1));
      expect(container.querySelector('input[name="from"]')).toHaveValue('2026-10-01');
      fireEvent.paste(screen.getByRole('spinbutton', { name: 'Day' }), {
        clipboardData: { getData: () => 'next friday' },
      });
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(container.querySelector('input[name="from"]')).toHaveValue('2026-10-01');
      await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
      await user.keyboard('{Delete}');
      expect(container.querySelector('input[name="from"]')).toHaveValue('');
      expect(onValueChange).toHaveBeenLastCalledWith(null);
    },
  );

  it('keeps small years literal and submits them with four digits', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<DateField locale="es-ES" name="date" onValueChange={onValueChange} />);
    await user.click(screen.getByRole('spinbutton', { name: 'Day' }));
    await user.keyboard('010126');
    expect(onValueChange).not.toHaveBeenCalled();
    await user.tab();
    const expected = new Date(0);
    expected.setHours(0, 0, 0, 0);
    expected.setFullYear(26, 0, 1);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(expected);
    expect(container.querySelector('input[name="date"]')).toHaveValue('0026-01-01');
  });
  it.each([
    ['hour', '2026-10-01T14:00', ['Month', 'Day', 'Year', 'Hours']],
    ['minute', '2026-10-01T14:30', ['Month', 'Day', 'Year', 'Hours', 'Minutes']],
    ['second', '2026-10-01T14:30:15', ['Month', 'Day', 'Year', 'Hours', 'Minutes', 'Seconds']],
  ] as const)('supports %s granularity and its submitted format', async (granularity, expected, names) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <DateField locale="en-US" granularity={granularity} hourCycle={24} name="from" onValueChange={onValueChange} />,
    );
    expect(screen.getAllByRole('spinbutton').map((s) => s.getAttribute('aria-label'))).toEqual(names);
    fireEvent.paste(screen.getByRole('spinbutton', { name: 'Year' }), {
      clipboardData: { getData: () => '2026-10-01T14:30:15' },
    });
    expect(container.querySelector('input[name="from"]')).toHaveValue(expected);
    expect(onValueChange).toHaveBeenLastCalledWith(
      new Date(2026, 9, 1, 14, granularity === 'hour' ? 0 : 30, granularity === 'second' ? 15 : 0),
    );
    await user.click(screen.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('{Delete}');
    expect(container.querySelector('input[name="from"]')).toHaveValue('');
  });

  it('uses locale hour cycle and A/P edits on the period segment', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <DateField
        granularity="minute"
        locale="en-US"
        defaultValue={new Date(2026, 9, 1, 14, 30)}
        name="at"
        onValueChange={onValueChange}
      />,
    );
    const period = screen.getByRole('spinbutton', { name: 'AM/PM' });
    expect(period).toHaveTextContent('PM');
    expect(screen.getByRole('spinbutton', { name: 'Hours' })).toHaveAttribute('aria-valuenow', '2');
    await user.click(period);
    await user.keyboard('a');
    expect(container.querySelector('input[name="at"]')).toHaveValue('2026-10-01T02:30');
    await user.keyboard('p');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 9, 1, 14, 30));
  });
  it('inherits Field labelling and description, honours aria overrides and disabled state', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <Field>
        <FieldLabel>Scheduled</FieldLabel>
        <DateField />
        <FieldDescription>Local date.</FieldDescription>
      </Field>,
    );
    expect(screen.getByRole('group', { name: 'Scheduled' })).toHaveAccessibleDescription('Local date.');
    rerender(
      <Field disabled>
        <FieldLabel>Scheduled</FieldLabel>
        <DateField onValueChange={onValueChange} />
      </Field>,
    );
    for (const segment of screen.getAllByRole('spinbutton')) {
      expect(segment).toHaveAttribute('aria-disabled', 'true');
      expect(segment).toHaveAttribute('tabindex', '-1');
      fireEvent.keyDown(segment, { key: 'ArrowUp' });
      fireEvent.paste(segment, { clipboardData: { getData: () => '2026-10-01' } });
    }
    await user.tab();
    expect(screen.getAllByRole('spinbutton')).not.toContain(document.activeElement);
    expect(onValueChange).not.toHaveBeenCalled();
    rerender(<DateField id="scheduled" aria-label="Override" aria-describedby="help" />);
    expect(screen.getByRole('group', { name: 'Override' })).toHaveAttribute('id', 'scheduled');
    expect(screen.getByRole('group')).toHaveAttribute('aria-describedby', 'help');
  });

  it('readOnly blocks editing and paste while preserving Tab and arrow navigation', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<DateField readOnly locale="en-US" defaultValue={new Date(2026, 9, 1)} onValueChange={onValueChange} />);
    const [month, day, year] = screen.getAllByRole('spinbutton');
    await user.tab();
    expect(month).toHaveFocus();
    await user.keyboard('4{ArrowUp}{ArrowDown}{Home}{End}{Delete}{Backspace}');
    fireEvent.paste(month!, { clipboardData: { getData: () => '2027-12-31' } });
    expect(month).toHaveAttribute('aria-readonly', 'true');
    expect(month).toHaveAttribute('aria-valuenow', '10');
    await user.keyboard('{ArrowRight}');
    expect(day).toHaveFocus();
    await user.tab();
    expect(year).toHaveFocus();
    await user.tab({ shift: true });
    expect(day).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('keeps drafts with a controlled null and does not reset a typing buffer on an echo', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Controlled() {
      const [date, setDate] = useState<Date | null>(null);
      return (
        <DateField
          locale="es-ES"
          value={date}
          onValueChange={(next) => {
            setDate(next);
            onValueChange(next);
          }}
        />
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole('spinbutton', { name: 'Day' }));
    await user.keyboard('01102026');
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 9, 1));
    await user.click(screen.getByRole('spinbutton', { name: 'Month' }));
    await user.keyboard('11');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 10, 1));
  });

  it('an external value replaces the draft and starts a new typing buffer', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(<DateField locale="es-ES" value={null} onValueChange={onValueChange} />);
    await user.click(screen.getByRole('spinbutton', { name: 'Year' }));
    await user.keyboard('20');
    rerender(<DateField locale="es-ES" value={new Date(2026, 9, 1)} onValueChange={onValueChange} />);
    expect(screen.getByRole('spinbutton', { name: 'Year' })).toHaveAttribute('aria-valuenow', '2026');
    await user.keyboard('2028');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2028, 9, 1));
  });

  it('supports optional leading zeros and ISO order fallback for an invalid locale', () => {
    const { rerender } = render(<DateField locale="en-US" defaultValue={new Date(2026, 0, 1)} />);
    expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveTextContent(/^1$/);
    rerender(<DateField locale="en-US" defaultValue={new Date(2026, 0, 1)} forceLeadingZeros />);
    expect(screen.getByRole('spinbutton', { name: 'Day' })).toHaveTextContent(/^01$/);
    rerender(<DateField locale="invalid_locale" />);
    expect(screen.getAllByRole('spinbutton').map((s) => s.getAttribute('aria-label'))).toEqual([
      'Year',
      'Month',
      'Day',
    ]);
  });
});
