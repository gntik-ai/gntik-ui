import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Field, FieldDescription, FieldLabel } from '../Field';
import { PasswordInput } from './PasswordInput';
import { scorePassword } from './password-strength';
import PasswordInputBasic from './examples/PasswordInputBasic';
import PasswordInputStrength from './examples/PasswordInputStrength';

describe('PasswordInput', () => {
  it('Tab reaches the toggle; Enter and Space reveal and hide the password', async () => {
    const user = userEvent.setup();
    const onVisibleChange = vi.fn();
    render(<PasswordInput aria-label="Password" defaultValue="hunter22" onVisibleChange={onVisibleChange} />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    input.focus();
    await user.tab();
    const show = screen.getByRole('button', { name: 'Show password' });
    expect(show).toHaveFocus();
    expect(show).toHaveAttribute('aria-pressed', 'false');
    await user.keyboard('{Enter}');
    expect(input).toHaveAttribute('type', 'text');
    const hide = screen.getByRole('button', { name: 'Hide password' });
    expect(hide).toHaveAttribute('aria-pressed', 'true');
    expect(hide).toHaveFocus();
    await user.keyboard(' ');
    expect(input).toHaveAttribute('type', 'password');
    expect(onVisibleChange).toHaveBeenLastCalledWith(false);
  });

  it('announces the strength via aria-describedby, alongside the Field description', async () => {
    const user = userEvent.setup();
    render(
      <Field>
        <FieldLabel>New password</FieldLabel>
        <PasswordInput showStrength />
        <FieldDescription>Members sign in with this.</FieldDescription>
      </Field>,
    );
    const input = screen.getByLabelText('New password');
    expect(input).toHaveAccessibleDescription('Members sign in with this.');
    await user.type(input, 'abc');
    expect(input).toHaveAccessibleDescription(/Strength: Too weak/);
    await user.type(input, 'Def-1234-xyz');
    expect(input).toHaveAccessibleDescription(/Strength: Strong/);
    expect(input).toHaveAccessibleDescription(/Members sign in with this\./);
  });

  it('uses the strength prop when given', () => {
    render(<PasswordInput aria-label="Pass" showStrength strength={3} defaultValue="x" />);
    expect(screen.getByLabelText('Pass')).toHaveAccessibleDescription('Strength: Good');
  });

  it('scales the large field, reveal toggle, icon and strength text while preserving accessible state', async () => {
    const user = userEvent.setup();
    render(<PasswordInput size="lg" aria-label="Password" showStrength defaultValue="Correct-Horse-9" />);
    expect(screen.getByLabelText('Password').parentElement).toHaveClass('h-11');
    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(toggle).toHaveClass('size-9');
    expect(toggle).toHaveClass('[&_svg]:size-[17px]');
    expect(toggle.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Strength:')).toHaveClass('text-[13px]');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard(' ');
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });

  it.each([undefined, 'auto', 'sm', 'md'] as const)('keeps existing toggle and strength metrics at %s', (size) => {
    render(<PasswordInput size={size} aria-label="Password" showStrength defaultValue="x" />);
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveClass('size-7');
    expect(screen.getByText('Strength:')).toHaveClass('text-[12px]');
  });

  it('scores with the built-in heuristic', () => {
    expect(scorePassword('')).toBe(0);
    expect(scorePassword('password')).toBe(0);
    expect(scorePassword('aaaaaaaaaaaa')).toBe(0);
    expect(scorePassword('abc')).toBe(0);
    expect(scorePassword('abc1')).toBe(1);
    expect(scorePassword('longerpassword')).toBe(2);
    expect(scorePassword('Tr0ub4dor&3')).toBe(3);
    expect(scorePassword('Correct-Horse-9')).toBe(4);
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <PasswordInputBasic />
        <PasswordInputStrength />
      </>,
    );
    await expectNoAxeViolations();
  });
});
