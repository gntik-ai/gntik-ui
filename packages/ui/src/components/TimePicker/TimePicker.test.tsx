import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '../../i18n/I18nProvider';
import { Field, FieldDescription, FieldLabel } from '../Field';
import { TimePicker, type TimePickerProps } from './TimePicker';
import TimePickerBasic from './examples/TimePickerBasic';
import { localeHourCycle, parseTimeOfDay } from './time-utils';

function setup(props: Partial<TimePickerProps> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <Field>
      <FieldLabel>Start time</FieldLabel>
      <TimePicker hourCycle={24} onValueChange={onValueChange} {...props} />
      <FieldDescription>Local time.</FieldDescription>
    </Field>,
  );
  const seg = (name: string) => screen.getByRole('spinbutton', { name });
  return { user, onValueChange, seg, group: screen.getByRole('group', { name: 'Start time' }) };
}

describe('TimePicker', () => {
  it('is a labelled, described group of spinbuttons', () => {
    const { group, seg } = setup({ defaultValue: '09:05' });
    expect(group).toHaveAccessibleDescription('Local time.');
    expect(seg('Hours')).toHaveAttribute('aria-valuenow', '9');
    expect(seg('Hours')).toHaveAttribute('aria-valuetext', '09');
    expect(seg('Minutes')).toHaveAttribute('aria-valuemax', '59');
    expect(screen.queryByRole('spinbutton', { name: 'AM/PM' })).not.toBeInTheDocument();
  });

  it('Tab moves between segments; ArrowUp/ArrowDown spin with wrap-around', async () => {
    const { user, seg, onValueChange } = setup({ defaultValue: '23:58' });
    await user.tab();
    expect(seg('Hours')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith('00:58');
    await user.tab();
    expect(seg('Minutes')).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith('00:00');
    await user.keyboard('{ArrowDown}');
    expect(onValueChange).toHaveBeenLastCalledWith('00:59');
  });

  it('minutes step by `step`; Home / End set the bounds', async () => {
    const { user, seg, onValueChange } = setup({ defaultValue: '10:07', step: 15 });
    await user.click(seg('Minutes'));
    await user.keyboard('{ArrowUp}');
    expect(onValueChange).toHaveBeenLastCalledWith('10:15');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(onValueChange).toHaveBeenLastCalledWith('10:45');
    await user.keyboard('{Home}');
    expect(onValueChange).toHaveBeenLastCalledWith('10:00');
    await user.keyboard('{End}');
    expect(onValueChange).toHaveBeenLastCalledWith('10:45');
  });

  it('digits type and auto-advance; Backspace clears; ArrowLeft/ArrowRight move', async () => {
    const { user, seg, onValueChange } = setup({ withSeconds: true });
    await user.click(seg('Hours'));
    await user.keyboard('0');
    expect(seg('Hours')).toHaveFocus();
    await user.keyboard('8');
    expect(seg('Minutes')).toHaveFocus();
    await user.keyboard('7');
    expect(seg('Seconds')).toHaveFocus();
    expect(seg('Minutes')).toHaveAttribute('aria-valuetext', '07');
    await user.keyboard('30');
    expect(onValueChange).toHaveBeenLastCalledWith('08:07:30');
    await user.keyboard('{ArrowLeft}');
    expect(seg('Minutes')).toHaveFocus();
    await user.keyboard('{Backspace}');
    expect(seg('Minutes')).toHaveAttribute('aria-valuetext', 'Empty');
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    await user.keyboard('{ArrowRight}');
    expect(seg('Seconds')).toHaveFocus();
  });

  it('12-hour clock: A / P pick the period, the value stays 24-hour', async () => {
    const { user, seg, onValueChange } = setup({ hourCycle: 12, locale: 'en-US', defaultValue: '09:30' });
    expect(seg('Hours')).toHaveAttribute('aria-valuetext', '09');
    expect(seg('AM/PM')).toHaveAttribute('aria-valuetext', 'AM');
    await user.click(seg('AM/PM'));
    await user.keyboard('p');
    expect(onValueChange).toHaveBeenLastCalledWith('21:30');
    await user.keyboard('a');
    expect(onValueChange).toHaveBeenLastCalledWith('09:30');
    await user.click(seg('Hours'));
    await user.keyboard('{End}');
    expect(onValueChange).toHaveBeenLastCalledWith('00:30');
  });

  it('controlled: keeps a partial draft while the parent holds null', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Controlled() {
      const [v, setV] = useState<string | null>(null);
      return (
        <TimePicker
          aria-label="At"
          hourCycle={24}
          value={v}
          onValueChange={(next) => {
            setV(next);
            onValueChange(next);
          }}
        />
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('9');
    expect(screen.getByRole('spinbutton', { name: 'Hours' })).toHaveAttribute('aria-valuetext', '09');
    expect(screen.getByRole('spinbutton', { name: 'Minutes' })).toHaveFocus();
    expect(onValueChange).not.toHaveBeenCalled();
    await user.keyboard('45');
    expect(onValueChange).toHaveBeenLastCalledWith('09:45');
    expect(screen.getByRole('spinbutton', { name: 'Minutes' })).toHaveAttribute('aria-valuetext', '45');
  });

  it('min / max mark out-of-range values invalid; the hidden input submits the value', () => {
    const { container } = render(<TimePicker aria-label="At" hourCycle={24} defaultValue="07:00" min="08:00" name="at" />);
    expect(screen.getByRole('spinbutton', { name: 'Hours' })).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelector('input[name="at"]')).toHaveValue('07:00');
  });

  it('labels follow the I18nProvider catalog', () => {
    render(
      <I18nProvider locale="es">
        <TimePicker hourCycle={24} />
      </I18nProvider>,
    );
    expect(screen.getByRole('spinbutton', { name: 'Horas' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Hora' })).toBeInTheDocument();
  });

  it('helpers', () => {
    expect(parseTimeOfDay('7:05')).toEqual({ hours: 7, minutes: 5, seconds: 0 });
    expect(parseTimeOfDay('24:00')).toBeNull();
    expect(localeHourCycle('en-US')).toBe(12);
    expect(localeHourCycle('en-GB')).toBe(24);
  });

  it('TimePickerBasic has no axe violations', async () => {
    render(<TimePickerBasic />);
    await expectNoAxeViolations();
  });
});
