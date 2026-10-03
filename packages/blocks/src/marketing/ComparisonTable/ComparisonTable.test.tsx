import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ComparisonTable } from './ComparisonTable';
import RunnerOptions from './examples/options';
import { sampleComparisonPlans, sampleComparisonSections } from './fixtures';

const sectionGroups = () => screen.getAllByRole('rowgroup').filter((g) => g.hasAttribute('data-section'));

describe('ComparisonTable', () => {
  it('renders plans as columns and features grouped by section', async () => {
    const { container } = render(<ComparisonTable />);
    expect(screen.getByRole('region', { name: 'Find the plan that fits' })).toBeInTheDocument();
    const table = screen.getByRole('table', { name: 'Find the plan that fits' });
    const headers = within(table).getAllByRole('columnheader');
    expect(headers).toHaveLength(sampleComparisonPlans.length + 1);
    expect(headers[2]).toHaveTextContent('TeamRecommended$49');
    expect(sectionGroups()).toHaveLength(sampleComparisonSections.length);
    const usage = sectionGroups()[0]!;
    const head = within(usage).getAllByRole('rowheader')[0]!;
    expect(head).toHaveAttribute('scope', 'rowgroup');
    expect(head).toHaveAttribute('colspan', String(sampleComparisonPlans.length + 1));
    expect(head).toHaveTextContent('Usage');
    expect(within(usage).getByRole('rowheader', { name: /Log retention/ })).toHaveAttribute('scope', 'row');
    await expectNoAxeViolations(container);
  });

  it('renders booleans with text alternatives, numbers formatted and notes', () => {
    render(<ComparisonTable />);
    const row = (name: RegExp) => screen.getByRole('rowheader', { name }).closest('tr')!;
    const previews = within(row(/Preview deployments/)).getAllByRole('cell');
    expect(previews.map((c) => c.textContent)).toEqual(['Not included', 'Included', 'Included']);
    const requests = within(row(/Requests per month/)).getAllByRole('cell');
    expect(requests.map((c) => c.textContent)).toEqual(['50,000', '500,000', 'CustomVolume pricing']);
    expect(within(row(/Uptime SLA/)).getAllByRole('cell')[0]).toHaveTextContent('Not included');
    expect(within(row(/Single sign-on/)).getAllByRole('cell')[1]).toHaveTextContent('IncludedAdd-on');
  });

  it('marks the recommended column with text, not colour alone', () => {
    const { container } = render(<ComparisonTable highlightedPlanId="enterprise" highlightLabel="Best value" />);
    const enterprise = screen.getByRole('columnheader', { name: /Enterprise/ });
    expect(within(enterprise).getByText('Best value')).toBeInTheDocument();
    expect(enterprise).toHaveClass('border-t-primary');
    const tinted = container.querySelectorAll('td[data-highlighted]');
    expect(tinted).toHaveLength(sampleComparisonSections.reduce((n, s) => n + s.features.length, 0));
    expect(screen.queryByText('Recommended')).toBeNull();
  });

  it('pins the feature column and keeps CTAs keyboard reachable', async () => {
    const user = userEvent.setup();
    render(<ComparisonTable />);
    expect(screen.getByRole('rowheader', { name: /Projects/ })).toHaveClass('sticky', 'start-0');
    expect(screen.getByRole('table')).toHaveClass('min-w-[40rem]');
    await user.tab();
    expect(screen.getByRole('link', { name: 'Start for free' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Start free trial' })).toHaveFocus();
  });

  it('works without a title, CTAs or prices (options example)', async () => {
    const { container } = render(<RunnerOptions />);
    expect(screen.queryByRole('region')).toBeNull();
    expect(screen.getByRole('table', { name: 'Runner options' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Capability' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Dedicated runner/ })).toHaveTextContent('Best for teams');
    expect(screen.queryByRole('link')).toBeNull();
    await expectNoAxeViolations(container);
  });
});
