import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n/I18nProvider';
import { expectNoAxeViolations } from '../../test/a11y';
import { DateTimeRangePicker } from './DateTimeRangePicker';
import DateTimeRangePickerUtc from './examples/DateTimeRangePickerUtc';

const now = new Date('2026-01-15T23:30:00Z');

describe('DateTimeRangePicker zoned absolute times', () => {
  beforeAll(() => vi.stubEnv('TZ', 'Europe/Madrid'));
  afterAll(() => vi.unstubAllEnvs());

  it('displays and edits both absolute endpoints in UTC, retaining ISO form values', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <DateTimeRangePicker
        aria-label="Window"
        locale="en-US"
        timeZone="UTC"
        hourCycle={24}
        name="window"
        now={now}
        onValueChange={onValueChange}
        defaultValue={{
          mode: 'absolute',
          start: new Date('2026-01-15T02:00:00Z'),
          end: new Date('2026-01-15T04:00:00Z'),
        }}
      />,
    );
    expect((screen.getByRole('combobox', { name: 'Window' }) as HTMLInputElement).value).toMatch(
      /Jan 15, 2026, 02:00\s–\s04:00 UTC/,
    );
    await user.click(screen.getByRole('combobox', { name: 'Window' }));
    const start = await screen.findByRole('group', { name: 'Start time (UTC)' });
    const end = screen.getByRole('group', { name: 'End time (UTC)' });
    expect(within(start).getByRole('spinbutton', { name: 'Hours' })).toHaveTextContent('02');
    expect(within(end).getByRole('spinbutton', { name: 'Hours' })).toHaveTextContent('04');
    await user.click(screen.getByRole('button', { name: 'Tuesday, January 20, 2026' }));
    await user.click(screen.getByRole('button', { name: 'Tuesday, January 20, 2026' }));
    await user.click(within(start).getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('09');
    await user.click(within(start).getByRole('spinbutton', { name: 'Minutes' }));
    await user.keyboard('30');
    await user.click(within(end).getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('10');
    await user.click(within(end).getByRole('spinbutton', { name: 'Minutes' }));
    await user.keyboard('45');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onValueChange).toHaveBeenLastCalledWith({
      mode: 'absolute',
      start: new Date('2026-01-20T09:30:00Z'),
      end: new Date('2026-01-20T10:45:00Z'),
    });
    expect(container.querySelector('input[name="window-start"]')).toHaveValue('2026-01-20T09:30:00.000Z');
    expect(container.querySelector('input[name="window-end"]')).toHaveValue('2026-01-20T10:45:00.000Z');
  });

  it.each([undefined, 'UTC', 'Asia/Tokyo'])('keeps relative preset instants unchanged in %s', async (timeZone) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <DateTimeRangePicker
        aria-label="Window"
        locale="en-US"
        timeZone={timeZone}
        now={now}
        name="window"
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Window' }));
    await user.click(await screen.findByRole('button', { name: 'Last 15 minutes' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ mode: 'relative', amount: 15, unit: 'minute' });
    expect(screen.getByRole('combobox', { name: 'Window' })).toHaveValue('Last 15 minutes');
    expect(container.querySelector('input[name="window-start"]')).toHaveValue('2026-01-15T23:15:00.000Z');
    expect(container.querySelector('input[name="window-end"]')).toHaveValue('2026-01-15T23:30:00.000Z');
  });

  it.each([
    ['2026-03-29T00:30:00Z', '2026-03-29T03:00:00Z', '2026-03-29T01:30:00Z'],
    ['2026-10-25T02:30:00Z', '2026-10-25T04:00:00Z', '2026-10-25T00:30:00Z'],
  ])('applies a compatible Madrid DST edit starting at %s', async (initial, end, expected) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateTimeRangePicker
        aria-label="Window"
        locale="en-US"
        timeZone="Europe/Madrid"
        hideTimeZone
        hourCycle={24}
        now={now}
        onValueChange={onValueChange}
        defaultValue={{ mode: 'absolute', start: new Date(initial), end: new Date(end) }}
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Window' }));
    const start = await screen.findByRole('group', { name: 'Start time' });
    await user.click(within(start).getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('02');
    await user.click(within(start).getByRole('spinbutton', { name: 'Minutes' }));
    await user.keyboard('30');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onValueChange).toHaveBeenLastCalledWith({ mode: 'absolute', start: new Date(expected), end: new Date(end) });
  });

  it('uses provider zones, translates labels and hides them on request', async () => {
    const user = userEvent.setup();
    const view = (hideTimeZone = false) => (
      <I18nProvider locale="es" timeZone="UTC">
        <DateTimeRangePicker
          aria-label="Window"
          hourCycle={24}
          now={now}
          hideTimeZone={hideTimeZone}
          defaultValue={{
            mode: 'absolute',
            start: new Date('2026-01-15T02:00:00Z'),
            end: new Date('2026-01-15T04:00:00Z'),
          }}
        />
      </I18nProvider>
    );
    const { rerender } = render(view());
    expect((screen.getByRole('combobox', { name: 'Window' }) as HTMLInputElement).value).toContain('UTC');
    await user.click(screen.getByRole('combobox', { name: 'Window' }));
    expect(await screen.findByRole('group', { name: 'Hora de inicio (UTC)' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Hora de fin (UTC)' })).toBeInTheDocument();
    rerender(view(true));
    expect((screen.getByRole('combobox', { name: 'Window' }) as HTMLInputElement).value).not.toContain('UTC');
    expect(screen.getByRole('group', { name: 'Hora de inicio' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Hora de fin' })).toBeInTheDocument();
  });

  it('falls back to browser-zone editing for an invalid override', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <I18nProvider locale="en-US" timeZone="UTC">
        <DateTimeRangePicker
          aria-label="Window"
          timeZone="Not/AZone"
          hourCycle={24}
          now={now}
          onValueChange={onValueChange}
          defaultValue={{
            mode: 'absolute',
            start: new Date('2026-01-15T02:00:00Z'),
            end: new Date('2026-01-15T04:00:00Z'),
          }}
        />
      </I18nProvider>,
    );
    expect((screen.getByRole('combobox', { name: 'Window' }) as HTMLInputElement).value).toMatch(/03:00\s–\s05:00$/);
    await user.click(screen.getByRole('combobox', { name: 'Window' }));
    const start = await screen.findByRole('group', { name: 'Start time' });
    await user.click(within(start).getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('04');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onValueChange).toHaveBeenLastCalledWith({
      mode: 'absolute',
      start: new Date('2026-01-15T03:00:00Z'),
      end: new Date('2026-01-15T04:00:00Z'),
    });
  });

  it('uses zoned range days, bounds and today at the browser date boundary', async () => {
    const user = userEvent.setup();
    render(
      <DateTimeRangePicker
        aria-label="Window"
        locale="en-US"
        timeZone="UTC"
        now={now}
        min={new Date('2026-01-15T23:00:00Z')}
        max={new Date('2026-01-16T23:00:00Z')}
        defaultValue={{ mode: 'absolute', start: now, end: new Date('2026-01-16T00:30:00Z') }}
      />,
    );
    await user.click(screen.getByRole('combobox', { name: 'Window' }));
    const day = await screen.findByRole('button', { name: 'Thursday, January 15, 2026' });
    expect(day).toHaveAttribute('aria-current', 'date');
    expect(day.closest('td')).toHaveAttribute('aria-selected', 'true');
    expect(day).not.toHaveAttribute('aria-disabled');
    expect(screen.getByRole('button', { name: 'Saturday, January 17, 2026' })).toHaveAttribute('aria-disabled', 'true');
  });

  it.each(['dark', 'light', 'high_contrast'])('UTC example is axe clean closed and open in %s', async (theme) => {
    document.documentElement.className = theme === 'light' ? '' : theme;
    const user = userEvent.setup();
    render(<DateTimeRangePickerUtc />);
    await expectNoAxeViolations();
    for (const name of ['UTC window', 'Window without zone labels']) {
      await user.click(screen.getByRole('combobox', { name }));
      await screen.findByRole('dialog');
      await expectNoAxeViolations();
      await user.keyboard('{Escape}');
    }
  });
});
