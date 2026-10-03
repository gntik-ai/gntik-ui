import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { Field, FieldDescription, FieldLabel } from '../Field';
import { NumberInput } from './NumberInput';
import NumberInputBasic from './examples/NumberInputBasic';
import NumberInputStates from './examples/NumberInputStates';

function setup(props: Partial<Parameters<typeof NumberInput>[0]> = {}) {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <Field>
      <FieldLabel>Replicas</FieldLabel>
      <NumberInput defaultValue={5} min={0} max={50} onValueChange={onValueChange} {...props} />
      <FieldDescription>Instances per region.</FieldDescription>
    </Field>,
  );
  return { user, onValueChange, input: screen.getByRole('textbox', { name: 'Replicas' }) };
}

describe('NumberInput', () => {
  it('is labelled and described by its Field', async () => {
    const { user, input } = setup();
    await user.click(screen.getByText('Replicas'));
    expect(input).toHaveFocus();
    expect(input).toHaveAccessibleDescription('Instances per region.');
  });

  it('ArrowUp / ArrowDown step by step', async () => {
    const { user, input, onValueChange } = setup();
    input.focus();
    await user.keyboard('{ArrowUp}{ArrowUp}');
    expect(input).toHaveValue('7');
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveValue('6');
    expect(onValueChange).toHaveBeenLastCalledWith(6, expect.anything());
  });

  it('PageUp / PageDown step by largeStep', async () => {
    const { user, input } = setup();
    input.focus();
    await user.keyboard('{PageUp}');
    expect(input).toHaveValue('15');
    await user.keyboard('{PageDown}{PageDown}');
    expect(input).toHaveValue('0');
  });

  it('Home / End jump to min / max', async () => {
    const { user, input } = setup();
    input.focus();
    await user.keyboard('{End}');
    expect(input).toHaveValue('50');
    await user.keyboard('{Home}');
    expect(input).toHaveValue('0');
  });

  it('steppers change the value and disable at the bounds', async () => {
    const { user, input } = setup({ defaultValue: 49 });
    const inc = screen.getByRole('button', { name: 'Increase' });
    await user.click(inc);
    expect(input).toHaveValue('50');
    expect(inc).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Decrease' }));
    expect(input).toHaveValue('49');
  });

  it('marks invalid state and applies sizes', () => {
    render(
      <>
        <NumberInput aria-label="Bad" invalid unit="GB" />
        <NumberInput aria-label="Small" size="sm" />
      </>,
    );
    const bad = screen.getByRole('textbox', { name: 'Bad' });
    expect(bad).toHaveAttribute('aria-invalid', 'true');
    expect(bad.parentElement).toHaveAttribute('data-invalid');
    expect(screen.getByText('GB')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('textbox', { name: 'Small' }).parentElement).toHaveClass('h-8');
  });

  it('names the input from a scrub label', () => {
    render(<NumberInput scrubLabel="Opacity" defaultValue={10} />);
    expect(screen.getByRole('textbox', { name: 'Opacity' })).toHaveValue('10');
  });

  it('examples have no axe violations', async () => {
    render(
      <>
        <NumberInputBasic />
        <NumberInputStates />
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'Monthly budget' })).toHaveValue('$1,250');
    await expectNoAxeViolations();
  });
});
