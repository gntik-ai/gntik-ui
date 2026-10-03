import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ChartCard } from './ChartCard';

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
});
