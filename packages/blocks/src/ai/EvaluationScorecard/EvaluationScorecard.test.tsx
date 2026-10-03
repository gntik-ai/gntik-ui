import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { EvaluationScorecard } from './EvaluationScorecard';

const bodyRows = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);

describe('EvaluationScorecard', () => {
  it('renders datasets × metrics with pass rates, deltas and flagged regressions', async () => {
    render(<EvaluationScorecard />);
    expect(bodyRows()).toHaveLength(5);
    expect(screen.getByRole('columnheader', { name: /p95 latency/ })).toBeInTheDocument();
    const billing = bodyRows().find((r) => r.textContent?.includes('billing-questions'))!;
    expect(within(billing).getByText('2 regressions')).toBeInTheDocument();
    expect(within(billing).getByText('80.8%')).toBeInTheDocument();
    expect(within(billing).getAllByText(/\(regression\)/)).toHaveLength(2);
    expect(within(billing).getByText(/\(below threshold\)/)).toBeInTheDocument();
    const docs = bodyRows().find((r) => r.textContent?.includes('product-docs'))!;
    expect(within(docs).getByText('1 regression')).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('filters to regressed datasets only', async () => {
    const user = userEvent.setup();
    render(<EvaluationScorecard />);
    await user.click(screen.getByRole('button', { name: /Regressions/ }));
    expect(bodyRows().map((r) => within(r).getAllByRole('cell')[0]?.textContent)).toEqual([
      expect.stringContaining('billing-questions'),
      expect.stringContaining('product-docs'),
    ]);
  });

  it('shows an empty row when nothing regressed', async () => {
    const user = userEvent.setup();
    render(<EvaluationScorecard rows={[]} />);
    await user.click(screen.getByRole('button', { name: /Regressions/ }));
    expect(screen.getByText('No regressions against baseline.')).toBeInTheDocument();
  });
});
