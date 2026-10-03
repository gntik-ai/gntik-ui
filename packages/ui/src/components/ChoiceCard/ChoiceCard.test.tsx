import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { ClickableCard } from './ClickableCard';
import ClickableCardList from './examples/ClickableCardList';
import SelectableCardPlans from './examples/SelectableCardPlans';
import SelectableCardRegions from './examples/SelectableCardRegions';

describe('ClickableCard', () => {
  it('has a single focus target named by the title and described by the description', async () => {
    const user = userEvent.setup();
    render(<ClickableCardList />);
    await user.tab();
    const link = screen.getByRole('link', { name: 'Atlas' });
    expect(link).toHaveFocus();
    expect(link).toHaveAttribute('href', '/projects/atlas');
    expect(link).toHaveAccessibleDescription('Customer-facing API and web app.');
    await user.tab();
    expect(screen.getByRole('link', { name: 'Members' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Download invoices' })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Archived projects' })).toBeDisabled();
  });

  it('Enter activates the card', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ClickableCard title="Open billing" onClick={onClick} />);
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('a click anywhere on the stretched action activates it', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(<ClickableCard title="Atlas" href="/projects/atlas" onClick={onClick} />);
    await user.click(screen.getByRole('link', { name: 'Atlas' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('SelectableCardGroup', () => {
  it('radio: names, descriptions and checked state', () => {
    render(<SelectableCardPlans />);
    expect(screen.getByRole('radiogroup', { name: 'Deployment plan' })).toBeInTheDocument();
    const dedicated = screen.getByRole('radio', { name: 'Dedicated' });
    expect(dedicated).toHaveAttribute('aria-checked', 'true');
    expect(dedicated).toHaveAccessibleDescription('2 vCPU · always warm $80/mo');
    expect(screen.getByRole('radio', { name: 'Isolated' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('radio: arrow keys move and select, skipping disabled cards', async () => {
    const user = userEvent.setup();
    render(<SelectableCardPlans />);
    await user.tab();
    expect(screen.getByRole('radio', { name: 'Dedicated' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    const shared = screen.getByRole('radio', { name: 'Shared' });
    await waitFor(() => expect(shared).toHaveFocus());
    expect(shared).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{ArrowUp}');
    const dedicated = screen.getByRole('radio', { name: 'Dedicated' });
    await waitFor(() => expect(dedicated).toHaveFocus());
    expect(dedicated).toHaveAttribute('aria-checked', 'true');
  });

  it('radio: clicking a card selects it', async () => {
    const user = userEvent.setup();
    render(<SelectableCardPlans />);
    await user.click(screen.getByText('Shared CPU · cold starts'));
    expect(screen.getByRole('radio', { name: 'Shared' })).toHaveAttribute('aria-checked', 'true');
  });

  it('checkbox: Space toggles the focused card and Tab visits each card', async () => {
    const user = userEvent.setup();
    render(<SelectableCardRegions />);
    expect(screen.getByRole('group', { name: 'Replicate to regions' })).toBeInTheDocument();
    await user.tab();
    const eu = screen.getByRole('checkbox', { name: 'Europe West' });
    expect(eu).toHaveFocus();
    await user.keyboard(' ');
    expect(eu).toHaveAttribute('aria-checked', 'true');
    await user.tab();
    const us = screen.getByRole('checkbox', { name: 'US East' });
    expect(us).toHaveFocus();
    expect(us).toHaveAttribute('aria-checked', 'true');
    await user.keyboard(' ');
    expect(us).toHaveAttribute('aria-checked', 'false');
  });

  it('examples have no axe violations', async () => {
    render(<><ClickableCardList /><SelectableCardPlans /><SelectableCardRegions /></>);
    await expectNoAxeViolations();
  });
});
