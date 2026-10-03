import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ChartCard } from './ChartCard';
import HeatmapChartCard from './examples/heatmap';
import { TRAFFIC_BY_RANGE } from './fixtures';

describe('ChartCard', () => {
  it('renders title, legend and chart for the first range', async () => {
    const { container } = render(<ChartCard />);
    expect(screen.getByRole('heading', { name: 'Infrastructure cost' })).toBeInTheDocument();
    expect(screen.getByRole('figure', { name: 'Infrastructure cost, 7d' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Compute' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('$2,412')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('changes range from the toggle group', async () => {
    const onRangeChange = vi.fn();
    render(<ChartCard onRangeChange={onRangeChange} kind="bar" />);
    await userEvent.click(screen.getByRole('button', { name: '30d' }));
    expect(onRangeChange).toHaveBeenCalledWith('30d');
    expect(screen.getByRole('figure', { name: 'Infrastructure cost, 30d' })).toBeInTheDocument();
    expect(screen.getByText('$9,880')).toBeInTheDocument();
  });

  it('renders a heatmap with its colour scale, keyboard grid and data table', async () => {
    const { container } = render(<HeatmapChartCard />);
    expect(screen.getByRole('heading', { name: 'Traffic by hour' })).toBeInTheDocument();
    // A single range hides the range toggle.
    expect(screen.queryByRole('group', { name: 'Traffic by hour range' })).toBeNull();
    expect(screen.getByRole('figure', { name: 'Traffic by hour, Last 7 days' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /colour grid/ })).toHaveAttribute('tabindex', '0');
    const rows = TRAFFIC_BY_RANGE['7d']!;
    expect(container.querySelectorAll('[data-cell]')).toHaveLength(rows.length * 8);
    // Cells fill the card's plot height.
    const cell = container.querySelector('[data-cell="0-0"]') as HTMLElement;
    expect(cell.style.height).toBe(`${Math.floor((240 - 20 - 3 * rows.length) / rows.length)}px`);
    expect(screen.getByRole('table', { name: 'Traffic by hour, Last 7 days' })).toHaveTextContent('Day');
    await expectNoAxeViolations(container);
  });

  it('hides the heatmap scale with showLegend={false} and passes chart states through', () => {
    const { container, rerender } = render(<HeatmapChartCard />);
    expect(container.querySelector('.h-2\\.5.w-4')).not.toBeNull();
    rerender(<ChartCard kind="heatmap" state="error" errorMessage="Traffic is unavailable" onRetry={() => {}} />);
    expect(screen.getByRole('alert')).toHaveTextContent('Traffic is unavailable');
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    rerender(<ChartCard state="loading" />);
    expect(screen.getByRole('status', { name: 'Loading chart' })).toBeInTheDocument();
    rerender(<ChartCard kind="heatmap" showLegend={false} />);
    expect(container.querySelector('.h-2\\.5.w-4')).toBeNull();
  });
});
