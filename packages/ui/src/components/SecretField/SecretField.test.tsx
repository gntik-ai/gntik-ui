import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Field, FieldLabel } from '../Field';
import { SecretField } from './SecretField';
import { maskSecret } from './secret-mask';
import SecretFieldBasic from './examples/SecretFieldBasic';
import SecretFieldRotate from './examples/SecretFieldRotate';

const SECRET = 'sk_live_abcdefghijklmnop';

function mockClipboard() {
  const writeText = vi.fn(() => Promise.resolve());
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
}

function renderField(props: Partial<Parameters<typeof SecretField>[0]> = {}) {
  return render(
    <Field>
      <FieldLabel>API key</FieldLabel>
      <SecretField value={SECRET} {...props} />
    </Field>,
  );
}

describe('SecretField', () => {
  it('is read-only and masked; the secret is not in the DOM nor in any title', () => {
    const { container } = renderField({ createdAt: Date.now() - 86_400_000 });
    const input = screen.getByLabelText('API key');
    expect(input).toHaveAttribute('readonly');
    expect(input).toHaveValue(maskSecret(SECRET));
    expect(input).toHaveAccessibleDescription(/Value hidden/);
    expect(input).toHaveAccessibleDescription(/Created/);
    expect(container.innerHTML).not.toContain(SECRET);
    expect(container.querySelector('[title]')).toBeNull();
  });

  it('Tab reaches the toggle; Enter and Space reveal and hide (aria-pressed)', async () => {
    const user = userEvent.setup();
    const onRevealedChange = vi.fn();
    renderField({ onRevealedChange });
    const input = screen.getByLabelText('API key');
    await user.tab();
    expect(input).toHaveFocus();
    await user.tab();
    const show = screen.getByRole('button', { name: 'Show secret' });
    expect(show).toHaveFocus();
    expect(show).toHaveAttribute('aria-pressed', 'false');
    await user.keyboard('{Enter}');
    expect(input).toHaveValue(SECRET);
    const hide = screen.getByRole('button', { name: 'Hide secret' });
    expect(hide).toHaveAttribute('aria-pressed', 'true');
    await user.keyboard(' ');
    expect(input).toHaveValue(maskSecret(SECRET));
    expect(onRevealedChange).toHaveBeenLastCalledWith(false);
  });

  it('Enter on Copy copies the real value while masked and announces it', async () => {
    const user = userEvent.setup();
    const writeText = mockClipboard();
    renderField();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Copy secret' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(writeText).toHaveBeenCalledWith(SECRET);
    await waitFor(() => expect(screen.getAllByRole('status').some((el) => el.textContent === 'Secret copied to clipboard')).toBe(true));
  });

  it('Rotate opens a confirmation; Escape cancels and returns focus', async () => {
    const user = userEvent.setup();
    const onRotate = vi.fn();
    renderField({ onRotate });
    const rotate = screen.getByRole('button', { name: 'Rotate' });
    rotate.focus();
    await user.keyboard('{Enter}');
    const dialog = await screen.findByRole('alertdialog', { name: 'Rotate this secret?' });
    expect(dialog).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onRotate).not.toHaveBeenCalled();
    await waitFor(() => expect(rotate).toHaveFocus());
  });

  it('confirming runs onRotate and announces "Secret rotated"', async () => {
    const user = userEvent.setup();
    const onRotate = vi.fn(() => Promise.resolve());
    renderField({ onRotate });
    await user.click(screen.getByRole('button', { name: 'Rotate' }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Rotate secret' }));
    expect(onRotate).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.getAllByRole('status').some((el) => el.textContent === 'Secret rotated')).toBe(true));
  });

  it('without confirmation, Rotate runs directly', async () => {
    const user = userEvent.setup();
    const onRotate = vi.fn();
    renderField({ onRotate, confirmRotate: false });
    await user.click(screen.getByRole('button', { name: 'Rotate' }));
    expect(onRotate).toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('editable renders a password input that reports changes', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderField({ editable: true, value: 'ab', onValueChange });
    const input = screen.getByLabelText('API key');
    expect(input).toHaveAttribute('type', 'password');
    expect(input).not.toHaveAttribute('readonly');
    await user.type(input, 'c');
    expect(onValueChange).toHaveBeenLastCalledWith('abc');
  });

  it('shows "Never used" for lastUsedAt={null}', () => {
    renderField({ lastUsedAt: null });
    expect(screen.getByText('Never used')).toBeInTheDocument();
  });

  it('masks with a fixed length and safe prefix/suffix', () => {
    expect(maskSecret('')).toBe('');
    expect(maskSecret('abc', { maskLength: 4 })).toBe('••••');
    expect(maskSecret('sk_live_123456789', { visiblePrefix: 3, visibleSuffix: 2, maskLength: 4 })).toBe('sk_••••89');
    expect(maskSecret('short', { visiblePrefix: 4, maskLength: 3 })).toBe('•••');
  });

  it('examples have no axe violations', async () => {
    await act(async () => {
      render(
        <>
          <SecretFieldBasic />
          <SecretFieldRotate />
        </>,
      );
    });
    await expectNoAxeViolations();
  });
});
