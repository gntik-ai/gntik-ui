import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Sparkline, describeTrend } from './Sparkline';
import SparklineStats from './examples/SparklineStats';
import SparklineVariants from './examples/SparklineVariants';

describe('Sparkline', () => {
  it('is an image named with a summary of the trend', () => {
    render(<Sparkline data={[100, 90, 120, 110]} label="Requests" />);
    expect(screen.getByRole('img', { name: 'Requests: trending up 10% from 100 to 110 over 4 points (low 90, high 120)' })).toBeInTheDocument();
  });

  it('aria-label overrides the generated summary', () => {
    render(<Sparkline data={[1, 2]} aria-label="Signups this week" />);
    expect(screen.getByRole('img', { name: 'Signups this week' })).toBeInTheDocument();
  });

  it('describes empty, single-point, flat and falling series', () => {
    expect(describeTrend([])).toBe('Trend: no data');
    expect(describeTrend([5])).toBe('Trend: 5');
    expect(describeTrend([3, 3])).toContain('flat from 3 to 3');
    expect(describeTrend([200, 150], 'Cost', (v) => `$${v}`)).toBe('Cost: trending down 25% from $200 to $150 over 2 points (low $150, high $200)');
  });

  it('line variant draws the line, area fill and markers with token classes', () => {
    const { container } = render(<Sparkline data={[1, 4, 2, 5]} area markers={['min', 'max', 'last']} tone="success" />);
    const paths = container.querySelectorAll('path');
    expect(paths).toHaveLength(2);
    expect(paths[0]).toHaveClass('fill-success/14');
    expect(paths[1]).toHaveClass('stroke-success', 'fill-none');
    expect(container.querySelectorAll('circle')).toHaveLength(3);
    expect(container.querySelector('[data-marker="last"]')).toHaveClass('fill-success');
  });

  it('bar variant draws one bar per point and respects width/height', () => {
    const { container } = render(<Sparkline variant="bar" data={[1, 2, 3]} width={60} height={20} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 60 20');
    expect(container.querySelectorAll('rect')).toHaveLength(3);
    expect(container.querySelector('rect')).toHaveClass('fill-primary');
  });

  it('examples have no axe violations', async () => {
    render(<><SparklineStats /><SparklineVariants /></>);
    await expectNoAxeViolations();
  });
});
