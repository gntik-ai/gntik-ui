import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import EvaluationsPage from './Page';
import { evaluationMetrics, evaluationRows, findRegressions } from './data';

describe('EvaluationsPage', () => {
  it('renders the scorecard, heatmap and regressions', { timeout: 15000 }, async () => {
    render(<EvaluationsPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Evaluations' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Results per dataset' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Change vs baseline' })).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Regressions' });
    expect(within(table).getAllByRole('row')).toHaveLength(5);
    await expectNoAxeViolations();
  });

  it('opens the samples of a regressed dataset, failures first', { timeout: 15000 }, async () => {
    render(<EvaluationsPage />);
    const table = screen.getByRole('table', { name: 'Regressions' });
    const row = within(table).getAllByRole('row').find((r) => r.textContent?.includes('billing-questions'));
    await userEvent.click(within(row!).getByRole('button', { name: /actions/i }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'View samples' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('2 failing of 3 shown, failures first.')).toBeInTheDocument();
    expect(within(dialog).getByRole('tree', { name: 'billing-questions samples' })).toHaveTextContent('billing-017');
  });

  it('finds regressions beyond tolerance', () => {
    expect(findRegressions(evaluationRows, evaluationMetrics).map((r) => r.id)).toEqual([
      'billing-questions:pass-rate',
      'billing-questions:accuracy',
      'product-docs:latency',
      'edge-cases:faithfulness',
    ]);
  });
});
