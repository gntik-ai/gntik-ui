import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ScheduleInput, type ScheduleInputProps } from './ScheduleInput';
import ScheduleInputBasic from './examples/ScheduleInputBasic';
import ScheduleInputCustom from './examples/ScheduleInputCustom';

const now = new Date(Date.UTC(2026, 2, 27, 10, 0)); // Friday

function setup(props: Partial<ScheduleInputProps> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(<ScheduleInput aria-label="Schedule" locale="en-US" timeZone="UTC" now={now} previewCount={3} onValueChange={onValueChange} {...props} />);
  const field = screen.getByRole('textbox', { name: 'Cron expression' });
  return { user, onValueChange, field };
}

describe('ScheduleInput', () => {
  it('shows the preset that fits, the summary and the next runs', () => {
    const { field } = setup();
    expect(field).toHaveValue('0 9 * * 1-5');
    expect(screen.getByRole('button', { name: 'Weekly' })).toHaveAttribute('aria-pressed', 'true');
    for (const day of ['Monday', 'Friday']) expect(screen.getByRole('button', { name: day })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Sunday' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Every weekday at 09:00')).toBeInTheDocument();
    const runs = within(screen.getByRole('list', { name: 'Next runs (UTC)' })).getAllByRole('listitem');
    expect(runs.map((r) => r.textContent)).toEqual(['Mon, Mar 30, 2026, 09:00', 'Tue, Mar 31, 2026, 09:00', 'Wed, Apr 1, 2026, 09:00']);
  });

  it('ArrowRight + Enter picks another frequency, which rewrites the expression', async () => {
    const { user, field, onValueChange } = setup({ defaultValue: '30 9 * * *' });
    expect(screen.getByRole('button', { name: 'Daily' })).toHaveAttribute('aria-pressed', 'true');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Hourly' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith('30 * * * *', { valid: true });
    expect(field).toHaveValue('30 * * * *');
    expect(screen.getByText('Every hour at minute 30')).toBeInTheDocument();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('button', { name: 'Monthly' })).toHaveFocus();
    await user.keyboard(' ');
    expect(field).toHaveValue('30 9 1 * *');
    expect(screen.getByText('Monthly on day 1 at 09:30')).toBeInTheDocument();
  });

  it('Space toggles a weekday; ArrowUp steps the day-of-month field', async () => {
    const { user, field } = setup();
    await user.click(screen.getByRole('button', { name: 'Friday' }));
    expect(field).toHaveValue('0 9 * * 1-4');
    screen.getByRole('button', { name: 'Saturday' }).focus();
    await user.keyboard(' ');
    expect(field).toHaveValue('0 9 * * 1-4,6');
    expect(screen.getByText('Every Monday, Tuesday, Wednesday, Thursday, and Saturday at 09:00')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Monthly' }));
    const day = screen.getByRole('textbox', { name: 'Day of month' });
    await user.click(day);
    await user.keyboard('{ArrowUp}');
    expect(field).toHaveValue('0 9 2 * *');
  });

  it('ArrowUp in the time field steps the hour', async () => {
    const { user, field } = setup({ defaultValue: '0 9 * * *' });
    await user.click(screen.getByRole('spinbutton', { name: 'Hours' }));
    await user.keyboard('{ArrowUp}');
    expect(field).toHaveValue('0 10 * * *');
  });

  it('typing a raw expression validates it with a message and picks the matching preset', async () => {
    const { user, field, onValueChange } = setup();
    await user.clear(field);
    await user.type(field, '*/15 9-17 * *');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription(/Expected 5 fields \(minute hour day month weekday\), found 4\./);
    expect(onValueChange).toHaveBeenLastCalledWith('*/15 9-17 * *', expect.objectContaining({ valid: false }));
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    await user.type(field, ' 1-5');
    expect(field).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('button', { name: 'Custom' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Every 15 minutes, between 09:00 and 17:59, on weekdays')).toBeInTheDocument();
    await user.clear(field);
    await user.type(field, '0 6 * * *');
    expect(screen.getByRole('button', { name: 'Daily' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('impossible schedules list no runs', () => {
    setup({ defaultValue: '0 0 30 2 *' });
    expect(screen.getByText('No upcoming runs.')).toBeInTheDocument();
  });

  it.each([
    ['ScheduleInputBasic', ScheduleInputBasic],
    ['ScheduleInputCustom', ScheduleInputCustom],
  ] as const)('%s has no axe violations', async (_n, Example) => {
    render(<Example />);
    await expectNoAxeViolations();
  });
});
