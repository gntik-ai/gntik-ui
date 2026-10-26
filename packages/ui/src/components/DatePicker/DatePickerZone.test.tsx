import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n/I18nProvider';
import { expectNoAxeViolations } from '../../test/a11y';
import { DatePicker } from './DatePicker';
import DatePickerUtc from './examples/DatePickerUtc';

describe('DatePicker zoned wall clock', () => {
  beforeAll(() => vi.stubEnv('TZ', 'Europe/Madrid'));
  afterAll(() => vi.unstubAllEnvs());
  afterEach(() => vi.useRealTimers());

  it('shows UTC text, time segments and an offset form value in a Madrid browser', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DatePicker
        aria-label="Run at"
        locale="en-US"
        timeZone="UTC"
        withTime
        defaultValue={new Date('2026-01-15T02:00:00Z')}
        name="runAt"
      />,
    );
    expect(screen.getByRole('combobox')).toHaveValue('Jan 15, 2026, 2:00 AM UTC');
    expect(container.querySelector('input[name="runAt"]')).toHaveValue('2026-01-15T02:00+00:00');
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('group', { name: 'Time (UTC)' })).toBeInTheDocument();
    expect(screen.getByRole('spinbutton', { name: 'Hours' })).toHaveTextContent('02');
    expect(screen.getByRole('spinbutton', { name: 'Minutes' })).toHaveTextContent('00');
  });

  it('picks a UTC day and types a wall time without shifting the emitted instant', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <DatePicker
        aria-label="Run at"
        locale="en-US"
        timeZone="UTC"
        withTime
        hourCycle={24}
        defaultValue={new Date('2026-01-15T02:00:00Z')}
        onValueChange={onValueChange}
        name="runAt"
      />,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('button', { name: 'Tuesday, January 20, 2026' }));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date('2026-01-20T02:00:00Z'));
    await user.click(screen.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('09');
    await user.click(screen.getByRole('spinbutton', { name: 'Minutes' }));
    await user.keyboard('30');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date('2026-01-20T09:30:00Z'));
    expect(container.querySelector('input[name="runAt"]')).toHaveValue('2026-01-20T09:30+00:00');
  });

  it('uses UTC calendar days for selection and bounds, and emits date-only midnight in UTC', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <DatePicker
        aria-label="Day"
        locale="en-US"
        timeZone="UTC"
        defaultValue={new Date('2026-03-02T23:30:00Z')}
        min={new Date('2026-03-02T23:00:00Z')}
        max={new Date('2026-03-03T23:00:00Z')}
        onValueChange={onValueChange}
        name="day"
      />,
    );
    await user.click(screen.getByRole('combobox'));
    const selected = await screen.findByRole('button', { name: 'Monday, March 2, 2026' });
    expect(selected.closest('[role=gridcell], td')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: 'Wednesday, March 4, 2026' })).toHaveAttribute('aria-disabled', 'true');
    await user.click(screen.getByRole('button', { name: 'Tuesday, March 3, 2026' }));
    expect(onValueChange).toHaveBeenLastCalledWith(new Date('2026-03-03T00:00:00Z'));
    expect(container.querySelector('input[name="day"]')).toHaveValue('2026-03-03');
  });

  it.each([
    ['2026-03-29T00:30:00Z', '2026-03-29T01:30:00Z'],
    ['2026-10-25T02:30:00Z', '2026-10-25T00:30:00Z'],
  ])('uses compatible DST disambiguation when editing %s to 02:30', async (initial, expected) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DatePicker
        aria-label="Run at"
        locale="en-US"
        timeZone="Europe/Madrid"
        withTime
        hourCycle={24}
        defaultValue={new Date(initial)}
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('02');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(expected));
  });

  it('marks today in Tokyo rather than the browser calendar day', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-01-15T23:30:00Z'));
    const user = userEvent.setup();
    render(<DatePicker aria-label="Day" locale="en-US" timeZone="Asia/Tokyo" />);
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('button', { name: 'Friday, January 16, 2026' })).toHaveAttribute(
      'aria-current',
      'date',
    );
    expect(screen.getByRole('button', { name: 'Thursday, January 15, 2026' })).not.toHaveAttribute('aria-current');
  });

  it.each([
    ['Europe/Madrid', false, '2026-03-03T03:00+01:00'],
    ['Europe/Madrid', true, '2026-03-03T03:00:17+01:00'],
    ['America/New_York', true, '2026-03-02T21:00:17-05:00'],
    ['Asia/Kathmandu', true, '2026-03-03T07:45:17+05:45'],
  ] as const)('submits zoned wall time in %s (seconds: %s)', (timeZone, withSeconds, expected) => {
    const { container } = render(
      <DatePicker
        aria-label="Run at"
        locale="en-US"
        timeZone={timeZone}
        withTime
        withSeconds={withSeconds}
        value={new Date('2026-03-03T02:00:17Z')}
        name="runAt"
      />,
    );
    expect(container.querySelector('input[name="runAt"]')).toHaveValue(expected);
  });

  it('inherits the provider zone and translates its label, with explicit hiding and override', async () => {
    const user = userEvent.setup();
    const view = (props = {}) => (
      <I18nProvider locale="es" timeZone="UTC">
        <DatePicker aria-label="Run at" withTime value={new Date('2026-01-15T02:00:00Z')} {...props} />
      </I18nProvider>
    );
    const { rerender } = render(view());
    expect(screen.getByRole('combobox')).toHaveValue('15 ene 2026, 2:00 UTC');
    await user.click(screen.getByRole('combobox'));
    expect(await screen.findByRole('group', { name: 'Hora (UTC)' })).toBeInTheDocument();
    rerender(view({ hideTimeZone: true }));
    expect(screen.getByRole('combobox')).toHaveValue('15 ene 2026, 2:00');
    expect(screen.getByRole('group', { name: 'Hora' })).toBeInTheDocument();
    rerender(view({ timeZone: 'system' }));
    expect(screen.getByRole('combobox')).toHaveValue('15 ene 2026, 3:00');
  });

  it.each(['Not/AZone', 'system', undefined])('keeps local text, edits and form values for %s', async (timeZone) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <DatePicker
        aria-label="Run at"
        locale="en-US"
        timeZone={timeZone}
        withTime
        hourCycle={24}
        defaultValue={new Date('2026-01-15T02:00:00Z')}
        onValueChange={onValueChange}
        name="runAt"
      />,
    );
    expect(screen.getByRole('combobox')).toHaveValue('Jan 15, 2026, 03:00');
    await user.click(screen.getByRole('combobox'));
    await user.click(await screen.findByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('09');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date('2026-01-15T08:00:00Z'));
    expect(container.querySelector('input[name="runAt"]')).toHaveValue('2026-01-15T09:00');
  });

  it('retains custom format options while injecting the effective zone', () => {
    const { rerender } = render(
      <DatePicker
        aria-label="Run at"
        locale="en-US"
        timeZone="UTC"
        withTime
        value={new Date('2026-01-15T02:00:00Z')}
        formatOptions={{ hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' }}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveValue('02:00 AM UTC');
    rerender(
      <DatePicker
        aria-label="Day"
        locale="en-US"
        timeZone="UTC"
        value={new Date('2026-01-15T02:00:00Z')}
        formatOptions={{ dateStyle: 'medium' }}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveValue('Jan 15, 2026 UTC');
  });

  it('shows a single zone for long time styles and removes it with hideTimeZone', () => {
    const view = (hideTimeZone = false) => (
      <DatePicker
        aria-label="Run at"
        locale="en-US"
        timeZone="UTC"
        withTime
        hideTimeZone={hideTimeZone}
        value={new Date('2026-01-15T02:00:00Z')}
        formatOptions={{ timeStyle: 'long' }}
      />
    );
    const { rerender } = render(view());
    expect(screen.getByRole('combobox')).toHaveValue('2:00:00 AM UTC');
    rerender(view(true));
    expect(screen.getByRole('combobox')).toHaveValue('2:00:00 AM');
  });

  it.each(['dark', 'light', 'high_contrast'])('UTC example is axe clean closed and open in %s', async (theme) => {
    document.documentElement.className = theme === 'light' ? '' : theme;
    const user = userEvent.setup();
    render(<DatePickerUtc />);
    await expectNoAxeViolations();
    for (const name of ['Run at', 'Run at without zone labels', 'UTC date']) {
      await user.click(screen.getByRole('combobox', { name }));
      await screen.findByRole('dialog');
      await expectNoAxeViolations();
      await user.keyboard('{Escape}');
    }
  });
});
