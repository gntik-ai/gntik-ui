import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Field, FieldLabel } from '../Field';
import { OtpInput } from './OtpInput';
import OtpInputBasic from './examples/OtpInputBasic';
import OtpInputStates from './examples/OtpInputStates';

function setup(props: Partial<Parameters<typeof OtpInput>[0]> = {}) {
  const user = userEvent.setup();
  const onComplete = vi.fn();
  render(
    <Field>
      <FieldLabel>Code</FieldLabel>
      <OtpInput length={4} onComplete={onComplete} {...props} />
    </Field>,
  );
  const slots = screen.getAllByRole('textbox');
  return { user, onComplete, slots, slot: (i: number) => slots[i] as HTMLInputElement };
}

describe('OtpInput', () => {
  it('names the first slot from the Field label and the rest by position', () => {
    const { slots } = setup();
    expect(slots).toHaveLength(4);
    expect(screen.getByRole('textbox', { name: 'Code' })).toBe(slots[0]);
    expect(screen.getByRole('textbox', { name: 'Character 4 of 4' })).toBe(slots[3]);
  });

  it('typing advances and fires onComplete when full', async () => {
    const { user, slot, onComplete } = setup();
    await user.click(slot(0));
    await user.keyboard('12');
    expect(slot(0)).toHaveValue('1');
    expect(slot(1)).toHaveValue('2');
    expect(slot(2)).toHaveFocus();
    await user.keyboard('a34');
    expect(slot(2)).toHaveValue('3');
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('Backspace clears and goes back', async () => {
    const { user, slot } = setup({ defaultValue: '12' });
    await user.click(slot(2));
    await user.keyboard('{Backspace}');
    expect(slot(1)).toHaveFocus();
    expect(slot(1)).toHaveValue('');
    await user.keyboard('{Backspace}');
    expect(slot(0)).toHaveFocus();
  });

  it('ArrowLeft / ArrowRight move between slots', async () => {
    const { user, slot } = setup({ defaultValue: '1234' });
    await user.click(slot(1));
    await user.keyboard('{ArrowRight}');
    expect(slot(2)).toHaveFocus();
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(slot(0)).toHaveFocus();
  });

  it('paste fills every slot (alphanumeric codes upper-cased)', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<OtpInput aria-label="Invite code" length={6} type="alphanumeric" onComplete={onComplete} />);
    expect(screen.getByRole('group', { name: 'Invite code' })).toBeInTheDocument();
    const slots = screen.getAllByRole('textbox');
    await user.click(slots[0] as HTMLElement);
    await user.paste('ab-12cd');
    expect(slots.map((s) => (s as HTMLInputElement).value).join('')).toBe('AB12CD');
    expect(onComplete).toHaveBeenCalledWith('AB12CD');
  });

  it('marks every slot invalid', () => {
    render(<OtpInput aria-label="Code" length={4} invalid />);
    for (const s of screen.getAllByRole('textbox')) expect(s).toHaveAttribute('aria-invalid', 'true');
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <OtpInputBasic />
        <OtpInputStates />
      </>,
    );
    await expectNoAxeViolations();
  });
});
