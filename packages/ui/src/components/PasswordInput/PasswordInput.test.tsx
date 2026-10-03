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
