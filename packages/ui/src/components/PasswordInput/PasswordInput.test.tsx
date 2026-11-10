import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Field, FieldDescription, FieldLabel } from '../Field';
import { PasswordInput } from './PasswordInput';
import { I18nProvider } from '../../i18n/I18nProvider';
import { scorePassword } from './password-strength';
import PasswordInputPolicy from './examples/PasswordInputPolicy';
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
        <PasswordInputPolicy />
      </>,
    );
    await expectNoAxeViolations();
  });

  describe('requirements checklist', () => {
    const policy = { minLength: 12, number: true };
    const renderPolicy = (props: Partial<Parameters<typeof PasswordInput>[0]> = {}) =>
      render(
        <Field>
          <FieldLabel>New password</FieldLabel>
          <PasswordInput rules={policy} {...props} />
          <FieldDescription>Members sign in with this.</FieldDescription>
        </Field>,
      );
    const item = (name: string) => screen.getByText(name).closest('li') as HTMLElement;

    it('renders a named list that joins the accessible description with the Field description', () => {
      renderPolicy();
      const list = screen.getByRole('list', { name: 'Password requirements' });
      expect(
        within(list)
          .getAllByRole('listitem')
          .map((li) => li.textContent),
      ).toEqual(['At least 12 characters', 'A number']);
      const input = screen.getByLabelText('New password');
      expect(input).toHaveAccessibleDescription(/At least 12 characters/);
      expect(input).toHaveAccessibleDescription(/A number/);
      expect(input).toHaveAccessibleDescription(/Members sign in with this\./);
    });

    it('renders the checklist without showStrength and no meter', () => {
      renderPolicy();
      expect(screen.getByRole('list', { name: 'Password requirements' })).toBeInTheDocument();
      expect(screen.queryByText(/Strength:/)).not.toBeInTheDocument();
    });

    it('shows neutral, unmet and met states with icon and hidden text', async () => {
      const user = userEvent.setup();
      renderPolicy();
      const input = screen.getByLabelText('New password');
      for (const name of ['At least 12 characters', 'A number']) {
        const li = item(name);
        expect(li.querySelector('.lucide-circle')).toBeInTheDocument();
        expect(li.innerHTML).not.toMatch(/success|destructive/);
        expect(li).not.toHaveTextContent(/met/);
      }
      await user.type(input, 'abc');
      for (const name of ['At least 12 characters', 'A number']) {
        expect(item(name).querySelector('.lucide-x')).toBeInTheDocument();
        expect(within(item(name)).getByText('not met')).toBeInTheDocument();
        expect(item(name).querySelector('svg')).toHaveClass('text-muted-foreground');
      }
      await user.clear(input);
      await user.type(input, 'abcdefghijkl');
      expect(item('At least 12 characters').querySelector('.lucide-check')).toHaveClass('text-success-text');
      expect(within(item('At least 12 characters')).getByText('met')).toBeInTheDocument();
      expect(item('A number').querySelector('.lucide-x')).toBeInTheDocument();
      expect(within(item('A number')).getByText('not met')).toBeInTheDocument();
      await user.type(input, '{Backspace}{Backspace}1');
      expect(within(item('At least 12 characters')).getByText('not met')).toBeInTheDocument();
      await user.type(input, 'k');
      expect(within(item('A number')).getByText('met')).toBeInTheDocument();
      expect(item('A number').querySelector('.lucide-check')).toBeInTheDocument();
    });

    it('reports built-in rules and custom requirements in order', () => {
      render(
        <PasswordInput
          aria-label="Pass"
          defaultValue="Ab1"
          rules={{ uppercase: true, lowercase: true, symbol: true }}
          requirements={[{ id: 'noSpace', label: 'No spaces', test: (p) => !p.includes(' ') }]}
        />,
      );
      const items = screen.getAllByRole('listitem');
      expect(items.map((li) => li.textContent)).toEqual([
        'A lowercase lettermet',
        'An uppercase lettermet',
        'A symbolnot met',
        'No spacesmet',
      ]);
    });

    describe('polite summary', () => {
      beforeEach(() => vi.useFakeTimers());
      afterEach(() => vi.useRealTimers());

      const type = (value: string) => fireEvent.change(screen.getByLabelText('New password'), { target: { value } });
      const wait = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

      it('stays silent while typing, then announces once 700 ms after the last change', () => {
        renderPolicy();
        const status = screen.getByRole('status');
        expect(status).toHaveTextContent('');
        for (const value of ['a', 'ab', 'abcdefghijk', 'abcdefghijk1']) {
          type(value);
          wait(300);
          expect(status).toHaveTextContent('');
        }
        wait(399);
        expect(status).toHaveTextContent('');
        wait(1);
        expect(status).toHaveTextContent('2 of 2 requirements met');
      });

      it('announces nothing when the met count equals the last announcement', () => {
        renderPolicy();
        const status = screen.getByRole('status');
        type('ab');
        wait(700);
        expect(status).toHaveTextContent('');
        type('abcdefghijk1');
        wait(700);
        expect(status).toHaveTextContent('2 of 2 requirements met');
        type('abcdefghijk1zz');
        wait(700);
        expect(status).toHaveTextContent('2 of 2 requirements met');
        type('abc');
        wait(700);
        expect(status).toHaveTextContent('0 of 2 requirements met');
        type('abcd');
        wait(700);
        expect(status).toHaveTextContent('0 of 2 requirements met');
      });
    });

    describe('derived strength', () => {
      const meter = (strength?: 0 | 1 | 2 | 3 | 4, value = '') =>
        render(
          <PasswordInput aria-label="Pass" showStrength rules={policy} strength={strength} defaultValue={value} />,
        );

      it('scores 0 empty, 2 with one rule met, 4 with both', () => {
        const { unmount } = meter(undefined, '');
        expect(screen.getByLabelText('Pass')).not.toHaveAccessibleDescription(/Strength/);
        unmount();
        const half = meter(undefined, 'abcdefghijkl');
        expect(screen.getByLabelText('Pass')).toHaveAccessibleDescription(/Strength: Fair/);
        half.unmount();
        meter(undefined, 'abcdefghijk1');
        expect(screen.getByLabelText('Pass')).toHaveAccessibleDescription(/Strength: Strong/);
      });

      it('lets an explicit strength win', () => {
        meter(1, 'abcdefghijk1');
        expect(screen.getByLabelText('Pass')).toHaveAccessibleDescription(/Strength: Weak/);
      });
    });

    it('does not render the empty-state hint with rules, and keeps it without them', () => {
      const { unmount } = render(<PasswordInput aria-label="Pass" showStrength rules={policy} />);
      expect(screen.queryByText(/Use 12\+ characters/)).not.toBeInTheDocument();
      unmount();
      render(<PasswordInput aria-label="Pass" showStrength />);
      expect(screen.getByText(/Use 12\+ characters/)).toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('is localised under an es I18nProvider', () => {
      render(
        <I18nProvider locale="es">
          <PasswordInput aria-label="Contraseña" rules={policy} />
        </I18nProvider>,
      );
      const list = screen.getByRole('list', { name: 'Requisitos de la contraseña' });
      expect(within(list).getAllByRole('listitem')[0]).toHaveTextContent('Al menos 12 caracteres');
    });
  });
});
