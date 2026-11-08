import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n/I18nProvider';
import { addDays } from '../Calendar/calendar-utils';
import { expectNoAxeViolations } from '../../test/a11y';
import DatePickerExpiryPresets from './examples/DatePickerExpiryPresets';
import { DatePicker, type DatePickerChangeDetails } from './DatePicker';
import { type DatePreset } from './date-presets';

const today = new Date(2026, 2, 1);
const presets: DatePreset[] = [
  { id: 'in-7', label: 'In 7 days', date: (t) => addDays(t, 7) },
  { id: 'in-30', label: 'In 30 days', date: (t) => addDays(t, 30) },
  { id: 'never', label: 'No expiry', date: () => null },
];

const markup = (el: HTMLElement) => el.innerHTML.replace(/ (id|for|aria-labelledby|aria-controls)="[^"]*"/g, '');
const preset = (name: string) => screen.getByRole('button', { name });

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('combobox'));
  return screen.findByRole('dialog');
}

describe('DatePicker presets', () => {
  it('In 30 days sets the value with preset details, closes and focuses the field', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker aria-label="Expiry" locale="en-US" today={today} presets={presets} onValueChange={onValueChange} />,
    );
    await open(user);
    await user.click(preset('In 30 days'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 31), { reason: 'preset', presetId: 'in-30' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByRole('combobox')).toHaveValue('Mar 31, 2026');
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveFocus());
  });

  it('reports calendar and time reasons, and still accepts one-argument handlers', async () => {
    const user = userEvent.setup();
    const calls: Array<[Date | null, DatePickerChangeDetails | undefined]> = [];
    const oneArg: (date: Date | null) => void = vi.fn();
    const { rerender } = render(
      <DatePicker
        aria-label="At"
        locale="en-US"
        today={today}
        withTime
        hourCycle={24}
        defaultValue={new Date(2026, 2, 1, 14, 30)}
        onValueChange={(d, details) => calls.push([d, details])}
      />,
    );
    await open(user);
    await user.click(screen.getByRole('button', { name: 'Tuesday, March 3, 2026' }));
    expect(calls.at(-1)).toEqual([new Date(2026, 2, 3, 14, 30), { reason: 'calendar' }]);
    await user.click(screen.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('{ArrowUp}');
    expect(calls.at(-1)).toEqual([new Date(2026, 2, 3, 15, 30), { reason: 'time' }]);
    rerender(<DatePicker aria-label="At" onValueChange={oneArg} />);
  });

  it('disables presets beyond max, before min or rejected by isDateDisabled', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="Expiry"
        locale="en-US"
        today={today}
        max={new Date(2026, 2, 15)}
        isDateDisabled={(d) => d.getDate() === 8}
        presets={[...presets, { id: 'past', label: 'Yesterday', date: (t) => addDays(t, -1) }]}
        min={today}
        onValueChange={onValueChange}
      />,
    );
    await open(user);
    expect(preset('In 7 days')).toBeDisabled();
    expect(preset('In 30 days')).toBeDisabled();
    expect(preset('Yesterday')).toBeDisabled();
    expect(preset('No expiry')).toBeEnabled();
    await user.click(preset('In 30 days'));
    preset('In 30 days').focus();
    await user.keyboard('{Enter} ');
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('presses the preset whose day is the value; both null presses the null preset', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        aria-label="Expiry"
        locale="en-US"
        today={today}
        presets={presets}
        defaultValue={new Date(2026, 2, 31, 9, 0)}
      />,
    );
    await open(user);
    expect(preset('In 30 days')).toHaveAttribute('aria-pressed', 'true');
    expect(preset('In 7 days')).toHaveAttribute('aria-pressed', 'false');
    expect(preset('No expiry')).toHaveAttribute('aria-pressed', 'false');
  });

  it('a null preset clears the value, shows the placeholder, empties the hidden input and is pressed', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <DatePicker
        aria-label="Expiry"
        locale="en-US"
        today={today}
        presets={presets}
        defaultValue={new Date(2026, 4, 1)}
        onValueChange={onValueChange}
        name="expiry"
        placeholder="Never"
      />,
    );
    expect(container.querySelector('input[name="expiry"]')).toHaveValue('2026-05-01');
    await open(user);
    await user.click(preset('No expiry'));
    expect(onValueChange).toHaveBeenLastCalledWith(null, { reason: 'preset', presetId: 'never' });
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', 'Never');
    expect(container.querySelector('input[name="expiry"]')).toHaveValue('');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await open(user);
    expect(preset('No expiry')).toHaveAttribute('aria-pressed', 'true');
  });

  it('with withTime keeps the time (00:00 when empty) and leaves the popup open until Done', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="At"
        locale="en-US"
        today={today}
        withTime
        hourCycle={24}
        presets={presets}
        defaultValue={new Date(2026, 2, 1, 14, 30)}
        onValueChange={onValueChange}
      />,
    );
    await open(user);
    await user.click(preset('In 30 days'));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 31, 14, 30), {
      reason: 'preset',
      presetId: 'in-30',
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Done' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('with withTime and an empty value the preset sets 00:00', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="At"
        locale="en-US"
        today={today}
        withTime
        presets={presets}
        onValueChange={onValueChange}
      />,
    );
    await open(user);
    await user.click(preset('In 7 days'));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 8, 0, 0), { reason: 'preset', presetId: 'in-7' });
  });

  it('names the group in English and Spanish, focuses the day on open and Shift+Tab reaches the presets', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<DatePicker aria-label="Expiry" locale="en-US" today={today} presets={presets} />);
    const dialog = await open(user);
    const group = within(dialog).getByRole('group', { name: 'Quick dates' });
    expect(within(group).getAllByRole('button')).toHaveLength(3);
    await waitFor(() => expect(within(dialog).getByRole('button', { name: 'Sunday, March 1, 2026' })).toHaveFocus());
    for (let i = 0; i < 6 && !group.contains(document.activeElement); i += 1) await user.tab({ shift: true });
    expect(preset('No expiry')).toHaveFocus();
    await user.keyboard('{Escape}');
    unmount();

    render(
      <I18nProvider locale="es">
        <DatePicker aria-label="Caducidad" today={today} presets={presets} />
      </I18nProvider>,
    );
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('group', { name: 'Fechas rápidas' })).toBeInTheDocument();
  });

  it('renders no presets group when presets is unset or empty', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<DatePicker aria-label="Expiry" locale="en-US" today={today} />);
    await open(user);
    expect(screen.queryByRole('group', { name: 'Quick dates' })).not.toBeInTheDocument();
    const before = markup(screen.getByRole('dialog'));
    await user.keyboard('{Escape}');
    unmount();
    render(<DatePicker aria-label="Expiry" locale="en-US" today={today} presets={[]} />);
    await open(user);
    expect(markup(screen.getByRole('dialog'))).toBe(before);
  });

  describe('in a non-system zone', () => {
    beforeAll(() => vi.stubEnv('TZ', 'Europe/Madrid'));
    afterAll(() => vi.unstubAllEnvs());

    it('computes from the UTC calendar day and emits UTC midnight', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const { container } = render(
        <DatePicker
          aria-label="Expiry"
          locale="en-US"
          timeZone="UTC"
          today={new Date('2026-03-01T23:30:00Z')}
          presets={presets}
          onValueChange={onValueChange}
          name="expiry"
        />,
      );
      await open(user);
      await user.click(preset('In 30 days'));
      expect(onValueChange).toHaveBeenLastCalledWith(new Date('2026-03-31T00:00:00Z'), {
        reason: 'preset',
        presetId: 'in-30',
      });
      expect(container.querySelector('input[name="expiry"]')).toHaveValue('2026-03-31');
    });
  });

  it('the expiry example has no axe violations closed or open and fills the field from a preset', async () => {
    const user = userEvent.setup();
    const { container } = render(<DatePickerExpiryPresets />);
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole('combobox'));
    const dialog = await screen.findByRole('dialog');
    expect(
      within(dialog).getAllByRole('button', { name: /^(In 7 days|In 30 days|End of quarter|No expiry)$/ }),
    ).toHaveLength(4);
    await expectNoAxeViolations(document.body);
    await user.click(preset('End of quarter'));
    expect(screen.getByRole('combobox')).toHaveValue('Mar 31, 2026');
  });
});
