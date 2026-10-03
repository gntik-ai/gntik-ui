import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { KpiRow } from './KpiRow';

describe('KpiRow', () => {
  it('renders the default KPIs as a description list with sparklines', async () => {
    const { container } = render(<KpiRow />);
    expect(screen.getByText('Active projects')).toBeInTheDocument();
    expect(screen.getByText('$18,204')).toBeInTheDocument();
    expect(screen.getAllByRole('img').length).toBe(4);
    await expectNoAxeViolations(container);
  });

  it('colours the delta by sentiment, not direction', () => {
    render(<KpiRow />);
    const latency = screen.getByText(/Decreased by −8.1%/).parentElement;
    expect(latency).toHaveAttribute('data-sentiment', 'positive');
    const spend = screen.getByText(/Increased by \+4.2%/).parentElement;
    expect(spend).toHaveAttribute('data-sentiment', 'negative');
    expect(spend).toHaveClass('text-destructive-text');
  });

  it('renders the strip variant without notes or trends', async () => {
    const { container } = render(<KpiRow variant="strip" showTrends={false} />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByText('vs. last month')).toBeNull();
    await expectNoAxeViolations(container);
  });
});
