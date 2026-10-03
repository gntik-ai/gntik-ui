import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ScorecardPage from './Page';
import { attainment, periodDelta, scorecardMetrics } from './data';

describe('ScorecardPage', () => {
  it('renders KPIs, targets, radar and commentary', { timeout: 15000 }, async () => {
    render(<ScorecardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Quarterly scorecard' })).toBeInTheDocument();
    expect(screen.getByText('Compared with Q2 2026')).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Metrics for Q3 2026 against target' });
    expect(within(table).getAllByRole('meter')).toHaveLength(scorecardMetrics.length);
    expect(screen.getByRole('complementary', { name: 'Commentary' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('switches period and posts a note', { timeout: 15000 }, async () => {
    const onPeriodChange = vi.fn();
    const onComment = vi.fn();
    render(<ScorecardPage defaultPeriod="Q2 2026" onPeriodChange={onPeriodChange} onComment={onComment} />);
    expect(screen.getByRole('table', { name: 'Metrics for Q2 2026 against target' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox', { name: 'Period' }));
    await userEvent.click(await screen.findByRole('option', { name: 'Q1 2026' }));
    expect(onPeriodChange).toHaveBeenCalledWith('Q1 2026');
    expect(screen.getByText('Compared with Q4 2025')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox'), 'Revenue on track.');
    await userEvent.click(screen.getByRole('button', { name: 'Post note' }));
    expect(onComment).toHaveBeenCalledWith('Revenue on track.');
  });

  it('flips sentiment for lower-is-better metrics', () => {
    const latency = scorecardMetrics.find((m) => m.id === 'latency')!;
    expect(periodDelta(latency, 176, 205)?.sentiment).toBe('positive');
    expect(attainment(latency, 180)).toBe(100);
  });
});
