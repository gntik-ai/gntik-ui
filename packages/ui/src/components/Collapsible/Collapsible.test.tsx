import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import CollapsibleAdvanced from './examples/CollapsibleAdvanced';
import CollapsibleRow from './examples/CollapsibleRow';

describe('Collapsible', () => {
  it('trigger exposes aria-expanded and controls its panel', async () => {
    const user = userEvent.setup();
    render(<CollapsibleAdvanced />);
    const trigger = screen.getByRole('button', { name: 'Advanced settings' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const panelId = trigger.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();
    expect(document.getElementById(panelId ?? '')).toContainElement(screen.getByRole('checkbox'));
  });

  it('Enter / Space expand and collapse the panel', async () => {
    const user = userEvent.setup();
    render(<CollapsibleAdvanced />);
    const trigger = screen.getByRole('button', { name: 'Advanced settings' });
    await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.keyboard(' ');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('Tab moves from the trigger into the open panel', async () => {
    const user = userEvent.setup();
    render(<CollapsibleAdvanced />);
    await user.click(screen.getByRole('button', { name: 'Advanced settings' }));
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Keep build cache between deployments' })).toHaveFocus();
  });

  it('controlled row variant reflects state', async () => {
    const user = userEvent.setup();
    render(<CollapsibleRow />);
    const trigger = screen.getByRole('button', { name: 'Billing details' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveClass('w-full');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('examples have no axe violations (open)', async () => {
    const user = userEvent.setup();
    render(<><CollapsibleAdvanced /><CollapsibleRow /></>);
    await user.click(screen.getByRole('button', { name: 'Advanced settings' }));
    await expectNoAxeViolations();
  });
});
