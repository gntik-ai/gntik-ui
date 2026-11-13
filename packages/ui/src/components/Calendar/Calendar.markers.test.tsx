import { useState, type ReactNode } from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n/I18nProvider';
import { expectNoAxeViolations } from '../../test/a11y';
import { Calendar, type CalendarDayMarker, type CalendarDayState, type CalendarProps } from './Calendar';
import CalendarMarkers from './examples/CalendarMarkers';

const today = new Date(2026, 2, 11);
const dayButton = (iso: string) =>
  document.querySelector<HTMLButtonElement>(`[data-day="${iso}"]`) as HTMLButtonElement;
const dots = (button: HTMLElement) => Array.from(button.querySelectorAll<HTMLElement>('[data-marker]'));

function markersFor(map: Record<string, CalendarDayMarker[]>) {
  return vi.fn((date: Date) => {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return map[iso];
  });
}

function renderCalendar(extra: Partial<CalendarProps> = {}) {
  return render(<Calendar locale="en-US" weekStartsOn={1} today={today} {...(extra as object)} />);
}

describe('Calendar day markers', () => {
  it('draws one aria-hidden tone dot and extends the accessible name', () => {
    renderCalendar({ getDayMarkers: markersFor({ '2026-03-03': [{ label: '2 failed runs', tone: 'destructive' }] }) });
    const button = screen.getByRole('button', { name: 'Tuesday, March 3, 2026, 2 failed runs' });
    expect(button).toBe(dayButton('2026-03-03'));
    const found = dots(button);
    expect(found).toHaveLength(1);
    expect(found[0]).toHaveAttribute('aria-hidden', 'true');
    expect(found[0]).toHaveClass('bg-destructive');
    expect(document.querySelectorAll('[data-marker]')).toHaveLength(1);
  });

  it('caps the dots at three but names every marker in order; default tone is primary', () => {
    renderCalendar({
      getDayMarkers: markersFor({
        '2026-03-04': [
          { label: 'A' },
          { label: 'B', tone: 'success' },
          { label: 'C', tone: 'warning' },
          { label: 'D', tone: 'info' },
        ],
      }),
    });
    const button = screen.getByRole('button', { name: 'Wednesday, March 4, 2026, A, B, C, D' });
    const found = dots(button);
    expect(found).toHaveLength(3);
    expect(found[0]).toHaveClass('bg-primary');
    expect(found[1]).toHaveClass('bg-success');
    expect(found[2]).toHaveClass('bg-warning');
  });

  it('maps neutral to muted-foreground', () => {
    renderCalendar({ getDayMarkers: markersFor({ '2026-03-05': [{ label: 'Quiet', tone: 'neutral' }] }) });
    expect(dots(dayButton('2026-03-05'))[0]).toHaveClass('bg-muted-foreground');
  });

  it('uses bg-primary-foreground on the selected day, including range endpoints', () => {
    const getDayMarkers = markersFor({
      '2026-03-03': [{ label: 'Run', tone: 'destructive' }],
      '2026-03-06': [{ label: 'Run', tone: 'success' }],
      '2026-03-09': [{ label: 'Run', tone: 'success' }],
    });
    const { unmount } = renderCalendar({ getDayMarkers, defaultValue: new Date(2026, 2, 3) });
    const selected = dots(dayButton('2026-03-03'))[0];
    expect(selected).toHaveClass('bg-primary-foreground');
    expect(selected).not.toHaveClass('bg-destructive');
    expect(dots(dayButton('2026-03-06'))[0]).toHaveClass('bg-success');
    unmount();
    renderCalendar({
      getDayMarkers,
      mode: 'range',
      defaultValue: { start: new Date(2026, 2, 3), end: new Date(2026, 2, 9) },
    });
    expect(dots(dayButton('2026-03-03'))[0]).toHaveClass('bg-primary-foreground');
    expect(dots(dayButton('2026-03-09'))[0]).toHaveClass('bg-primary-foreground');
    expect(dots(dayButton('2026-03-06'))[0]).toHaveClass('bg-success');
  });

  it('shows no dots on outside days and never asks for their markers', () => {
    const getDayMarkers = vi.fn<(date: Date) => CalendarDayMarker[]>(() => [{ label: 'Run' }]);
    renderCalendar({ getDayMarkers, showOutsideDays: true });
    const asked = getDayMarkers.mock.calls.map(([d]) => d.getMonth());
    expect(asked.length).toBeGreaterThan(0);
    expect(new Set(asked)).toEqual(new Set([2]));
    expect(getDayMarkers).toHaveBeenCalledTimes(31);
    expect(document.querySelectorAll('[data-marker]')).toHaveLength(31);
  });

  it('puts the highlighted primary dot before getDayMarkers dots and names it', () => {
    renderCalendar({
      highlightedDates: [new Date(2026, 2, 10)],
      getDayMarkers: markersFor({ '2026-03-10': [{ label: 'Deploy', tone: 'success' }] }),
    });
    const button = screen.getByRole('button', { name: 'Tuesday, March 10, 2026, Highlighted, Deploy' });
    const found = dots(button);
    expect(found).toHaveLength(2);
    expect(found[0]).toHaveClass('bg-primary');
    expect(found[1]).toHaveClass('bg-success');
    expect(document.querySelectorAll('[data-marker]')).toHaveLength(2);
  });

  it('lets highlightedLabel replace the default label', () => {
    renderCalendar({ highlightedDates: [new Date(2026, 2, 10)], highlightedLabel: 'Maintenance' });
    expect(screen.getByRole('button', { name: 'Tuesday, March 10, 2026, Maintenance' })).toBeInTheDocument();
  });

  it('translates the highlighted label in es', () => {
    render(
      <I18nProvider locale="es-ES">
        <Calendar weekStartsOn={1} today={today} highlightedDates={[new Date(2026, 2, 10)]} />
      </I18nProvider>,
    );
    expect(dayButton('2026-03-10').getAttribute('aria-label')).toMatch(/, Destacado$/);
  });

  it('leaves the day button untouched when no new prop is set', () => {
    renderCalendar();
    const button = dayButton('2026-03-03');
    expect(button.getAttribute('aria-label')).toBe('Tuesday, March 3, 2026');
    expect(button.innerHTML).toBe('3');
    expect(document.querySelectorAll('[aria-busy]')).toHaveLength(0);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('Calendar loading', () => {
  it('marks every grid busy, shows one status, draws no dots and skips getDayMarkers', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const getDayMarkers = vi.fn<(date: Date) => CalendarDayMarker[]>(() => [{ label: 'Run' }]);
    renderCalendar({
      loading: true,
      numberOfMonths: 2,
      getDayMarkers,
      highlightedDates: [new Date(2026, 2, 10)],
      onValueChange,
    });
    const grids = screen.getAllByRole('grid');
    expect(grids).toHaveLength(2);
    for (const grid of grids) expect(grid).toHaveAttribute('aria-busy', 'true');
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    expect(document.querySelectorAll('svg[aria-hidden="true"].animate-spin')).toHaveLength(1);
    expect(document.querySelectorAll('[data-marker]')).toHaveLength(0);
    expect(getDayMarkers).not.toHaveBeenCalled();
    dayButton('2026-03-11').focus();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 12));
  });

  it('draws the dots when loading ends and keeps focus on the same day', () => {
    const getDayMarkers = markersFor({ '2026-03-12': [{ label: 'Run' }] });
    const { rerender } = renderCalendar({ loading: true, getDayMarkers });
    dayButton('2026-03-12').focus();
    rerender(<Calendar locale="en-US" weekStartsOn={1} today={today} loading={false} getDayMarkers={getDayMarkers} />);
    expect(dots(dayButton('2026-03-12'))).toHaveLength(1);
    expect(document.activeElement).toBe(dayButton('2026-03-12'));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(document.querySelectorAll('[aria-busy]')).toHaveLength(0);
  });

  it('does not rename the grid while loading', () => {
    renderCalendar({ loading: true });
    expect(screen.getByRole('grid', { name: 'March 2026' })).toBeInTheDocument();
  });
});

describe('Calendar renderDay', () => {
  it('replaces the number and dots inside an aria-hidden wrapper and keeps the button contract', () => {
    const renderDay = vi.fn<(date: Date, state: CalendarDayState) => ReactNode>((date) => (
      <b data-testid={`d${date.getDate()}`}>{date.getDate()}×3</b>
    ));
    renderCalendar({
      renderDay,
      getDayMarkers: markersFor({ '2026-03-03': [{ label: '3 runs', tone: 'success' }] }),
      defaultValue: new Date(2026, 2, 3),
    });
    const button = screen.getByRole('button', { name: 'Tuesday, March 3, 2026, 3 runs' });
    expect(button).toBe(dayButton('2026-03-03'));
    expect(button).toHaveAttribute('data-day', '2026-03-03');
    expect(button).toHaveAttribute('tabindex', '0');
    expect(dayButton('2026-03-11')).toHaveAttribute('tabindex', '-1');
    const hidden = within(button).getByTestId('d3').parentElement as HTMLElement;
    expect(hidden).toHaveAttribute('aria-hidden', 'true');
    expect(hidden.parentElement).toBe(button);
    expect(button.querySelectorAll('[data-marker]')).toHaveLength(0);
    const state = renderDay.mock.calls.find(([d]) => d.getDate() === 3)?.[1];
    expect(state).toEqual({
      selected: true,
      today: false,
      disabled: false,
      inRange: false,
      markers: [{ label: '3 runs', tone: 'success' }],
    });
  });

  it('is not called for outside days and keys still move focus and select', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const renderDay = vi.fn((date: Date) => <i>{date.getDate()}</i>);
    renderCalendar({ renderDay, showOutsideDays: true, onValueChange });
    expect(renderDay).toHaveBeenCalledTimes(31);
    dayButton('2026-03-11').focus();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(dayButton('2026-03-12')).toHaveFocus();
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 12));
  });
});

describe('Calendar markers example', () => {
  it('has no axe violations', async () => {
    render(<CalendarMarkers />);
    expect(screen.getAllByRole('grid')).toHaveLength(2);
    await expectNoAxeViolations();
  });

  it('simulates a month load: busy, then markers for the new month', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<CalendarMarkers />);
    await user.click(screen.getAllByRole('button', { name: 'Next month' })[0] as HTMLElement);
    expect(screen.getByRole('grid', { name: 'April 2026' })).toHaveAttribute('aria-busy', 'true');
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(screen.getByRole('grid', { name: 'April 2026' })).not.toHaveAttribute('aria-busy');
    expect(document.querySelectorAll('[data-marker]').length).toBeGreaterThan(0);
    vi.useRealTimers();
  });
});

function Controlled() {
  const [loading, setLoading] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setLoading(false)}>
        done
      </button>
      <Calendar loading={loading} today={today} locale="en-US" />
    </>
  );
}

describe('Calendar loading toggle', () => {
  it('keeps day buttons mounted across a loading toggle', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const before = dayButton('2026-03-11');
    await user.click(screen.getByRole('button', { name: 'done' }));
    expect(dayButton('2026-03-11')).toBe(before);
  });
});
