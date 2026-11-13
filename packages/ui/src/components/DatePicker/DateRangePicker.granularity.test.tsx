import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateRangePicker } from './DateRangePicker';

const today = new Date(2026, 2, 11);
const button = (name: string) => screen.getByRole('button', { name });
const normalised = (text: string) => text.replace(/\s/g, ' ');

async function open(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('combobox'));
  return screen.findByRole('dialog');
}

describe('DateRangePicker granularity', () => {
  it.each([
    ['June then January', ['Jun', 'Jan']],
    ['January then June', ['Jan', 'Jun']],
  ])('month, %s: one onValueChange from 2026-01-01 to 2026-06-30', async (_order, clicks) => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        aria-label="Period"
        granularity="month"
        locale="en-US"
        today={today}
        onValueChange={onValueChange}
      />,
    );
    await open(user);
    await user.click(button(clicks[0]!));
    expect(onValueChange).not.toHaveBeenCalled();
    await user.click(button(clicks[1]!));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith({ start: new Date(2026, 0, 1), end: new Date(2026, 5, 30) });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(normalised((screen.getByRole('combobox') as HTMLInputElement).value)).toBe('Jan – Jun 2026');
  });

  it('quarters: Q1 then Q2 give 2026-01-01 to 2026-06-30 and read "Q1 2026 – Q2 2026" (es: T1 – T2)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        aria-label="Periodo"
        granularity="quarter"
        locale="es-ES"
        today={today}
        onValueChange={onValueChange}
      />,
    );
    await open(user);
    await user.click(button('T1 2026'));
    await user.click(button('T2 2026'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith({ start: new Date(2026, 0, 1), end: new Date(2026, 5, 30) });
    expect(screen.getByRole('combobox')).toHaveValue('T1 2026 – T2 2026');
  });

  it('a range inside one quarter reads a single quarter label', () => {
    render(
      <DateRangePicker
        aria-label="Period"
        granularity="quarter"
        locale="en-US"
        defaultValue={{ start: new Date(2026, 0, 20), end: new Date(2026, 2, 3) }}
      />,
    );
    expect(screen.getByRole('combobox')).toHaveValue('Q1 2026');
  });

  it('years read as a year range', () => {
    render(
      <DateRangePicker
        aria-label="Period"
        granularity="year"
        locale="en-US"
        defaultValue={{ start: new Date(2024, 5, 1), end: new Date(2026, 1, 1) }}
      />,
    );
    expect(normalised((screen.getByRole('combobox') as HTMLInputElement).value)).toBe('2024 – 2026');
  });

  it('weeks with weekStartsOn=0 span Sunday to Saturday', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        aria-label="Weeks"
        granularity="week"
        weekStartsOn={0}
        locale="en-US"
        today={today}
        onValueChange={onValueChange}
      />,
    );
    await open(user);
    await user.click(button('Wednesday, March 4, 2026'));
    await user.click(button('Wednesday, March 11, 2026'));
    expect(onValueChange).toHaveBeenCalledWith({ start: new Date(2026, 2, 1), end: new Date(2026, 2, 14) });
    expect(normalised((screen.getByRole('combobox') as HTMLInputElement).value)).toBe('Mar 1 – 14, 2026');
  });

  it('after the first click, hovering previews whole months', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker aria-label="Period" granularity="month" locale="en-US" today={today} />);
    const dialog = await open(user);
    await user.click(button('Feb'));
    await user.hover(button('Apr'));
    const marked = within(dialog)
      .getAllByRole('gridcell')
      .filter((cell) => cell.hasAttribute('data-in-range'))
      .map((cell) => cell.textContent);
    expect(marked).toEqual(['Feb', 'Mar', 'Apr']);
  });

  it('min disables earlier months and emits nothing for them', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        aria-label="Period"
        granularity="month"
        locale="en-US"
        today={today}
        min={new Date(2026, 1, 15)}
        onValueChange={onValueChange}
      />,
    );
    await open(user);
    expect(button('Jan')).toHaveAttribute('aria-disabled', 'true');
    expect(button('Feb')).not.toHaveAttribute('aria-disabled');
    await user.click(button('Jan'));
    await user.click(button('Feb'));
    await user.click(button('Mar'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith({ start: new Date(2026, 1, 1), end: new Date(2026, 2, 31) });
  });

  it('submits the first and last day of the periods as <name>-start and <name>-end', () => {
    const { container } = render(
      <DateRangePicker
        aria-label="Period"
        granularity="month"
        name="usage"
        locale="en-US"
        defaultValue={{ start: new Date(2026, 0, 10), end: new Date(2026, 5, 3) }}
      />,
    );
    expect(container.querySelector('[name="usage-start"]')).toHaveValue('2026-01-01');
    expect(container.querySelector('[name="usage-end"]')).toHaveValue('2026-06-30');
  });

  it('hides the day presets unless presets is passed explicitly', async () => {
    const user = userEvent.setup();
    const { unmount } = render(
      <DateRangePicker aria-label="Period" granularity="month" locale="en-US" today={today} />,
    );
    const dialog = await open(user);
    expect(within(dialog).queryByRole('group', { name: 'Presets' })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Last 7 days' })).not.toBeInTheDocument();
    unmount();
    render(
      <DateRangePicker
        aria-label="Period"
        granularity="month"
        locale="en-US"
        today={today}
        presets={[
          {
            id: 'h1',
            label: 'First half',
            range: () => ({ start: new Date(2026, 0, 14), end: new Date(2026, 5, 20) }),
          },
        ]}
      />,
    );
    await user.click(screen.getByRole('combobox'));
    const reopened = await screen.findByRole('dialog');
    expect(within(reopened).getByRole('button', { name: 'First half' })).toBeInTheDocument();
    expect(within(reopened).queryByRole('button', { name: 'Last 7 days' })).not.toBeInTheDocument();
  });

  it('an explicit preset applies whole periods', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <DateRangePicker
        aria-label="Period"
        granularity="month"
        locale="en-US"
        today={today}
        onValueChange={onValueChange}
        presets={[
          {
            id: 'h1',
            label: 'First half',
            range: () => ({ start: new Date(2026, 0, 14), end: new Date(2026, 5, 20) }),
          },
        ]}
      />,
    );
    await open(user);
    await user.click(button('First half'));
    expect(onValueChange).toHaveBeenCalledWith({ start: new Date(2026, 0, 1), end: new Date(2026, 5, 30) });
  });

  it('keeps the two-month day calendar and default presets when granularity is unset', async () => {
    const user = userEvent.setup();
    render(<DateRangePicker aria-label="Period" locale="en-US" today={today} />);
    const dialog = await open(user);
    expect(within(dialog).getAllByRole('grid')).toHaveLength(2);
    expect(within(dialog).getByRole('button', { name: 'Last 7 days' })).toBeInTheDocument();
  });
});
