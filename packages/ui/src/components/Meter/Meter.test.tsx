import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { getMeterLevel } from './meter.variants';
import { Meter } from './Meter';
import MeterUsage from './examples/MeterUsage';
import MeterHealth from './examples/MeterHealth';

describe('Meter', () => {
  it('maps percentages to levels with default and custom thresholds', () => {
    expect(getMeterLevel(50)).toBe('ok');
    expect(getMeterLevel(80)).toBe('warning');
    expect(getMeterLevel(100)).toBe('critical');
    expect(getMeterLevel(85, { warning: 90 })).toBe('ok');
    expect(getMeterLevel(70, { warning: 50, destructive: 70 })).toBe('critical');
  });

  it('inverts the thresholds with higherIsBetter (low = bad)', () => {
    expect(getMeterLevel(90, {}, true)).toBe('ok');
    expect(getMeterLevel(50, {}, true)).toBe('warning');
    expect(getMeterLevel(15, {}, true)).toBe('critical');
    expect(getMeterLevel(65, { warning: 70, destructive: 40 }, true)).toBe('warning');
    render(<MeterHealth />);
    expect(screen.getByRole('meter', { name: 'Uptime score' })).toHaveAttribute('data-level', 'ok');
    expect(screen.getByRole('meter', { name: 'Test coverage' })).toHaveAttribute('data-level', 'warning');
    expect(screen.getByRole('meter', { name: 'Error budget left' })).toHaveAttribute('data-level', 'critical');
  });

  it('exposes a labelled meter with value attributes and the default value text', () => {
    render(<Meter label="Storage" value={40} />);
    const meter = screen.getByRole('meter', { name: 'Storage' });
    expect(meter).toHaveAttribute('aria-valuenow', '40');
    expect(meter).toHaveAttribute('aria-valuemax', '100');
    expect(meter).toHaveAttribute('data-level', 'ok');
    expect(meter.querySelector('.bg-primary')).toHaveStyle({ width: '40%' });
  });

  it('turns warning near the cap and critical over it, clamping the reported value', () => {
    render(<MeterUsage />);
    const storage = screen.getByRole('meter', { name: 'Storage' });
    expect(storage).toHaveAttribute('data-level', 'warning');
    expect(storage.querySelector('.bg-warning')).toBeInTheDocument();
    const builds = screen.getByRole('meter', { name: 'Build minutes' });
    expect(builds).toHaveAttribute('data-level', 'critical');
    expect(builds).toHaveAttribute('aria-valuenow', '3000');
    expect(builds).toHaveAttribute('aria-valuetext', '3,240 of 3,000 min');
    expect(screen.getByText(/Over by 240 min/)).toHaveClass('text-destructive-text');
  });

  it('examples have no axe violations', async () => {
    const { unmount } = render(<MeterUsage />);
    await expectNoAxeViolations();
    unmount();
    render(<MeterHealth />);
    await expectNoAxeViolations();
  });
});
