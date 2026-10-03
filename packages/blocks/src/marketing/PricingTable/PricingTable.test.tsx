import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { PricingTable } from './PricingTable';

describe('PricingTable', () => {
  it('renders the tiers with monthly prices', async () => {
    const { container } = render(<PricingTable />);
    const team = screen.getByRole('listitem', { name: 'Team' });
    expect(within(team).getByText('$49')).toBeInTheDocument();
    expect(within(team).getByText('Most popular')).toBeInTheDocument();
    expect(within(screen.getByRole('listitem', { name: 'Enterprise' })).getByText('Custom')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('switches to annual pricing and reports the chosen tier', async () => {
    const user = userEvent.setup();
    const onSelectTier = vi.fn();
    render(<PricingTable onSelectTier={onSelectTier} />);
    await user.click(screen.getByRole('button', { name: /Annual/ }));
    const team = screen.getByRole('listitem', { name: 'Team' });
    expect(within(team).getByText('$39')).toBeInTheDocument();
    expect(within(team).getByText('$468 billed yearly')).toBeInTheDocument();
    await user.click(within(team).getByRole('button', { name: 'Start free trial' }));
    expect(onSelectTier).toHaveBeenCalledWith(expect.objectContaining({ id: 'team' }), 'annual');
  });

  it('marks the current plan with a badge, aria-current and a disabled CTA', async () => {
    const onSelectTier = vi.fn();
    const { container } = render(<PricingTable currentTierId="starter" onSelectTier={onSelectTier} />);
    const starter = screen.getByRole('listitem', { name: 'Starter' });
    expect(starter).toHaveAttribute('aria-current', 'true');
    expect(within(starter).getByText('Current plan', { selector: 'span' })).toBeInTheDocument();
    expect(within(starter).getByRole('button', { name: 'Current plan' })).toBeDisabled();
    expect(screen.getByRole('listitem', { name: 'Team' })).not.toHaveAttribute('aria-current');
    await expectNoAxeViolations(container);
  });

  it('works as a radio group in selectable mode (uncontrolled)', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(<PricingTable selectable defaultValue="team" onValueChange={onValueChange} />);
    expect(screen.getByRole('radiogroup', { name: 'Simple pricing that scales with you' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start free trial' })).not.toBeInTheDocument();
    const team = screen.getByRole('radio', { name: 'Team' });
    expect(team).toBeChecked();
    expect(screen.getAllByTestId('tier-check')).toHaveLength(1);
    await expectNoAxeViolations(container);
    await user.click(screen.getByText('For organizations with advanced security needs.'));
    expect(screen.getByRole('radio', { name: 'Enterprise' })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('enterprise');
    screen.getByRole('radio', { name: 'Enterprise' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByRole('radio', { name: 'Team' })).toBeChecked();
    expect(onValueChange).toHaveBeenLastCalledWith('team');
    expect(onValueChange).toHaveBeenCalledTimes(2);
  });

  it('respects a controlled value', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<PricingTable selectable value="starter" onValueChange={onValueChange} currentTierId="starter" />);
    await user.click(screen.getByRole('radio', { name: 'Team' }));
    expect(onValueChange).toHaveBeenCalledWith('team');
    expect(screen.getByRole('radio', { name: 'Starter' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Starter' }).closest('[aria-current]')).not.toBeNull();
  });

  it('renders without its own header, labelled from outside, with tier names at headingLevel', async () => {
    const { container } = render(
      <>
        <h1 id="ext">Pick a plan</h1>
        <PricingTable title={null} eyebrow={null} description={null} aria-labelledby="ext" headingLevel="h2" showCycleToggle={false} columns={1} selectable defaultValue="team" />
      </>,
    );
    expect(screen.getByRole('radiogroup', { name: 'Pick a plan' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Team' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Billing period' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Annual/ })).toBeNull();
    await expectNoAxeViolations(container);
  });
});
