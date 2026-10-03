import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders the first range by default', async () => {
    const { container } = render(<StatCard />);
    expect(screen.getByRole('heading', { name: 'Requests' })).toBeInTheDocument();
    expect(screen.getByText('38,921')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Requests, 7d/ })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('switches range and recalculates the value', async () => {
    const onRangeChange = vi.fn();
    render(<StatCard onRangeChange={onRangeChange} />);
    await userEvent.click(screen.getByRole('button', { name: '90d' }));
    expect(onRangeChange).toHaveBeenCalledWith('90d');
    expect(screen.getByText('3.02M')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '90d' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls the footer action', async () => {
    const onClick = vi.fn();
    render(<StatCard action={{ label: 'Open report', onClick }} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open report' }));
    expect(onClick).toHaveBeenCalled();
  });
});
