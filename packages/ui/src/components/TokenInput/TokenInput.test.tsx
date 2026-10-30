import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Field, FieldDescription, FieldLabel } from '../Field';
import { TokenInput } from './TokenInput';
import TokenInputEmails from './examples/TokenInputEmails';
import TokenInputLabels from './examples/TokenInputLabels';

function setup(props: Partial<Parameters<typeof TokenInput>[0]> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <Field>
      <FieldLabel>Labels</FieldLabel>
      <TokenInput onValueChange={onValueChange} {...props} />
      <FieldDescription>Press Enter to add.</FieldDescription>
    </Field>,
  );
  const input = screen.getByRole('textbox', { name: 'Labels' });
  const chips = () => screen.queryAllByRole('listitem').map((c) => c.firstChild?.textContent ?? c.textContent);
  return { user, onValueChange, input, chips };
}

describe('TokenInput', () => {
  it('keeps disabled chip labels readable and remove buttons disabled', () => {
    const { input } = setup({ disabled: true, defaultValue: ['Billing owner'] });
    const chip = screen.getByRole('listitem');
    expect(chip).toHaveClass('data-disabled:bg-secondary', 'data-disabled:text-foreground');
    expect(chip.className).not.toMatch(/opacity-/);
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Remove Billing owner' })).toBeDisabled();
  });

  it('is labelled and described by its Field', async () => {
    const { user, input } = setup();
    await user.click(screen.getByText('Labels'));
    expect(input).toHaveFocus();
    expect(input).toHaveAccessibleDescription(/Press Enter to add\./);
  });

  it('Enter and comma commit; Tab commits and keeps focus', async () => {
    const { user, input, chips, onValueChange } = setup();
    await user.click(input);
    await user.keyboard('alpha{Enter}beta,gamma');
    expect(chips()).toEqual(['alpha', 'beta']);
    await user.keyboard('{Tab}');
    expect(input).toHaveFocus();
    expect(chips()).toEqual(['alpha', 'beta', 'gamma']);
    expect(onValueChange).toHaveBeenLastCalledWith(['alpha', 'beta', 'gamma']);
    expect(screen.getByRole('status')).toHaveTextContent('Added gamma.');
  });

  it('Backspace on an empty input removes the last chip', async () => {
    const { user, input, chips } = setup({ defaultValue: ['one', 'two'] });
    await user.click(input);
    await user.keyboard('x{Backspace}');
    expect(chips()).toEqual(['one', 'two']);
    await user.keyboard('{Backspace}');
    expect(chips()).toEqual(['one']);
  });

  it('remove buttons delete a chip and return focus to the input', async () => {
    const { user, input, chips } = setup({ defaultValue: ['one', 'two'] });
    await user.click(screen.getByRole('button', { name: 'Remove one' }));
    expect(chips()).toEqual(['two']);
    expect(input).toHaveFocus();
  });

  it('paste splits on separators and new lines, skipping duplicates', async () => {
    const { user, input, chips } = setup({ defaultValue: ['a'] });
    await user.click(input);
    await user.paste('b, c;A\nd');
    expect(chips()).toEqual(['a', 'b', 'c', 'd']);
  });

  it('validate marks chips invalid and the input aria-invalid', async () => {
    const { user, input } = setup({ validate: (t) => (t.includes('@') ? null : 'Needs an @') });
    await user.click(input);
    await user.keyboard('ok@example.com{Enter}nope{Enter}');
    const items = screen.getAllByRole('listitem');
    expect(items[0]).not.toHaveAttribute('data-invalid');
    expect(items[1]).toHaveAttribute('data-invalid');
    expect(within(items[1] as HTMLElement).getByText(/invalid: Needs an @/)).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('stops at maxItems', async () => {
    const { user, input, chips } = setup({ maxItems: 2 });
    await user.click(input);
    await user.keyboard('a{Enter}b{Enter}c{Enter}');
    expect(chips()).toEqual(['a', 'b']);
    expect(screen.getByRole('status')).toHaveTextContent('Limit of 2 reached.');
    expect(input).toHaveAccessibleDescription(/2 of 2 entries/);
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <TokenInputEmails />
        <TokenInputLabels />
      </>,
    );
    expect(screen.getByRole('list', { name: 'Invitees' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });
});
