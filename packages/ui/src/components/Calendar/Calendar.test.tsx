import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Calendar } from './Calendar';
import CalendarRange from './examples/CalendarRange';
import CalendarSingle from './examples/CalendarSingle';

const today = new Date(2026, 2, 11); // Wed 11 Mar 2026
const day = (name: string) => screen.getByRole('button', { name });

function setup(extra: Partial<Parameters<typeof Calendar>[0]> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<Calendar locale="en-US" weekStartsOn={1} today={today} onValueChange={onValueChange} {...(extra as object)} />);
  return { user, onValueChange };
}

describe('Calendar', () => {
  it('renders a labelled grid with Intl day labels, today marker and one tab stop', () => {
    setup();
    const grid = screen.getByRole('grid', { name: 'March 2026' });
    expect(within(grid).getAllByRole('columnheader')[0]).toHaveTextContent('M');
    const t = day('Wednesday, March 11, 2026');
    expect(t).toHaveAttribute('aria-current', 'date');
    expect(t).toHaveAttribute('tabindex', '0');
    expect(grid.querySelectorAll('button[tabindex="0"]')).toHaveLength(1);
  });

  it('ArrowLeft / ArrowRight move by day; ArrowUp / ArrowDown by week', async () => {
    const { user } = setup();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(day('Wednesday, March 11, 2026')).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(day('Thursday, March 12, 2026')).toHaveFocus();
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(day('Tuesday, March 10, 2026')).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(day('Tuesday, March 17, 2026')).toHaveFocus();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(day('Tuesday, March 3, 2026')).toHaveFocus();
    await user.keyboard('{ArrowUp}');
    expect(screen.getByRole('grid', { name: 'February 2026' })).toBeInTheDocument();
    expect(day('Tuesday, February 24, 2026')).toHaveFocus();
  });

  it('PageUp / PageDown move by month (Shift: year)', async () => {
    const { user } = setup();
    day('Wednesday, March 11, 2026').focus();
    await user.keyboard('{PageDown}');
    expect(screen.getByRole('grid', { name: 'April 2026' })).toBeInTheDocument();
    expect(day('Saturday, April 11, 2026')).toHaveFocus();
    await user.keyboard('{PageUp}{PageUp}');
    expect(day('Wednesday, February 11, 2026')).toHaveFocus();
    await user.keyboard('{Shift>}{PageDown}{/Shift}');
    expect(day('Thursday, February 11, 2027')).toHaveFocus();
  });

  it('Home / End move to the start / end of the week (week start respected)', async () => {
    const { user } = setup();
    day('Wednesday, March 11, 2026').focus();
    await user.keyboard('{Home}');
    expect(day('Monday, March 9, 2026')).toHaveFocus();
    await user.keyboard('{End}');
    expect(day('Sunday, March 15, 2026')).toHaveFocus();
  });

  it('Enter / Space select the focused day; disabled days are not selectable', async () => {
    const { user, onValueChange } = setup({ min: new Date(2026, 2, 10) });
    day('Wednesday, March 11, 2026').focus();
    await user.keyboard('{ArrowRight}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 12));
    expect(day('Thursday, March 12, 2026').closest('td')).toHaveAttribute('aria-selected', 'true');
    await user.keyboard('{ArrowRight} ');
    expect(onValueChange).toHaveBeenLastCalledWith(new Date(2026, 2, 13));
    const past = day('Monday, March 9, 2026');
    expect(past).toHaveAttribute('aria-disabled', 'true');
    await user.click(past);
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it('navigates months with the header buttons and honours min/max', async () => {
    const { user } = setup({ min: new Date(2026, 2, 1), max: new Date(2026, 3, 30) });
    expect(screen.getByRole('button', { name: 'Previous month' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid', { name: 'April 2026' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
    expect(day('Wednesday, April 1, 2026')).toHaveAttribute('tabindex', '0');
  });

  it('selects a range in two steps and orders the ends', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Calendar mode="range" locale="en-US" weekStartsOn={0} today={today} onValueChange={onValueChange} />);
    await user.click(day('Friday, March 20, 2026'));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: new Date(2026, 2, 20), end: null });
    await user.click(day('Monday, March 16, 2026'));
    expect(onValueChange).toHaveBeenLastCalledWith({ start: new Date(2026, 2, 16), end: new Date(2026, 2, 20) });
    expect(day('Wednesday, March 18, 2026').closest('td')).toHaveAttribute('data-in-range');
    expect(day('Monday, March 16, 2026').closest('td')).toHaveAttribute('data-range-start');
  });

  it('uses the locale for names', () => {
    render(<Calendar locale="es-ES" weekStartsOn={1} today={today} />);
    expect(screen.getByRole('grid', { name: 'marzo de 2026' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'miércoles, 11 de marzo de 2026' })).toBeInTheDocument();
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <CalendarSingle />
        <CalendarRange />
      </>,
    );
    expect(screen.getAllByRole('grid')).toHaveLength(3);
    await expectNoAxeViolations();
  });
});
