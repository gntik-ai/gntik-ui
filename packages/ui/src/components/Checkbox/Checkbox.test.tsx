import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Checkbox } from './Checkbox';
import CheckboxList from './examples/CheckboxList';
import CheckboxSelectAll from './examples/CheckboxSelectAll';

describe('Checkbox', () => {
  it('exposes role checkbox with its label and description, and toggles with Space', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox label="Weekly digest" description="A summary every Monday." onCheckedChange={onChange} />);
    const cb = screen.getByRole('checkbox', { name: 'Weekly digest' });
    expect(cb).toHaveAccessibleDescription('A summary every Monday.');
    expect(cb).toHaveAttribute('aria-checked', 'false');
    await user.tab();
    expect(cb).toHaveFocus();
    await user.keyboard(' ');
    expect(cb).toHaveAttribute('aria-checked', 'true');
    await user.keyboard(' ');
    expect(cb).toHaveAttribute('aria-checked', 'false');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('toggles when its label is clicked and ignores input while disabled', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Checkbox label="Digest" />
        <Checkbox label="Locked" disabled />
      </>,
    );
    await user.click(screen.getByText('Digest'));
    expect(screen.getByRole('checkbox', { name: 'Digest' })).toHaveAttribute('aria-checked', 'true');
    await user.click(screen.getByText('Locked'));
    expect(screen.getByRole('checkbox', { name: 'Locked' })).toHaveAttribute('aria-checked', 'false');
  });

  it('renders the indeterminate (mixed) state', () => {
    render(<Checkbox aria-label="Some selected" indeterminate />);
    expect(screen.getByRole('checkbox', { name: 'Some selected' })).toHaveAttribute('aria-checked', 'mixed');
  });

  it('moves between checkboxes with Tab, each one a tab stop', async () => {
    const user = userEvent.setup();
    render(<CheckboxList />);
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Mentions' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Deployments' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Billing' })).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByRole('checkbox', { name: 'Billing' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('group', { name: 'Email notifications' })).toBeInTheDocument();
  });

  it('parent checkbox is mixed with a partial selection and Space selects the whole group', async () => {
    const user = userEvent.setup();
    render(<CheckboxSelectAll />);
    const parent = screen.getByRole('checkbox', { name: 'Include all projects' });
    expect(parent).toHaveAttribute('aria-checked', 'mixed');
    expect(screen.getByText('2/5')).toBeInTheDocument();
    parent.focus();
    await user.keyboard(' ');
    expect(parent).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('checkbox', { name: 'onboarding' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('5/5')).toBeInTheDocument();
    await user.keyboard(' ');
    expect(screen.getByText('0/5')).toBeInTheDocument();
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <CheckboxList />
        <CheckboxSelectAll />
      </>,
    );
    await expectNoAxeViolations();
  });
});
