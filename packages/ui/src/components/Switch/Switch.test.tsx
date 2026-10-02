import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Switch } from './Switch';
import SwitchSettings from './examples/SwitchSettings';

describe('Switch', () => {
  it('exposes role switch with its label and toggles with Space and Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch label="Email alerts" onCheckedChange={onChange} />);
    const sw = screen.getByRole('switch', { name: 'Email alerts' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await user.tab();
    expect(sw).toHaveFocus();
    await user.keyboard(' ');
    expect(sw).toHaveAttribute('aria-checked', 'true');
    await user.keyboard('{Enter}');
    expect(sw).toHaveAttribute('aria-checked', 'false');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('toggles when its label is clicked', async () => {
    const user = userEvent.setup();
    render(<Switch label="Digest" />);
    await user.click(screen.getByText('Digest'));
    expect(screen.getByRole('switch', { name: 'Digest' })).toHaveAttribute('aria-checked', 'true');
  });

  it('ignores input while disabled', async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Locked" disabled defaultChecked />);
    const sw = screen.getByRole('switch', { name: 'Locked' });
    await user.click(sw);
    expect(sw).toHaveAttribute('aria-checked', 'true');
  });

  it('example has no axe violations', async () => {
    render(<SwitchSettings />);
    await expectNoAxeViolations();
  });
});
