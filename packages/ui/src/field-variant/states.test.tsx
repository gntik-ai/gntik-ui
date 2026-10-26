import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../components/Input/Input';
import { Textarea } from '../components/Textarea/Textarea';
import { NumberInput } from '../components/NumberInput/NumberInput';
import { SimpleSelect } from '../components/Select/Select';
import { Combobox, ComboboxInput } from '../components/Combobox/Combobox';
import { MultiSelect } from '../components/MultiSelect/MultiSelect';
import { TokenInput } from '../components/TokenInput/TokenInput';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { DateRangePicker } from '../components/DatePicker/DateRangePicker';
import { TimePicker } from '../components/TimePicker/TimePicker';
import type { FieldControlVariant } from './index';

type Props = { variant: FieldControlVariant; readOnly?: boolean; disabled?: boolean };
const controls = [
  ['Input', (p: Props) => <Input aria-label="Control" {...p} />, 'textbox', true],
  ['Textarea', (p: Props) => <Textarea aria-label="Control" {...p} />, 'textbox', false],
  ['NumberInput', (p: Props) => <NumberInput aria-label="Control" {...p} />, 'textbox', true],
  ['Select', (p: Props) => <SimpleSelect aria-label="Control" items={[]} {...p} />, 'combobox', false],
  [
    'Combobox',
    ({ variant, ...p }: Props) => (
      <Combobox items={[]} {...p}>
        <ComboboxInput aria-label="Control" variant={variant} />
      </Combobox>
    ),
    'combobox',
    true,
  ],
  ['MultiSelect', (p: Props) => <MultiSelect aria-label="Control" options={[]} {...p} />, 'combobox', true],
  ['TokenInput', (p: Props) => <TokenInput aria-label="Control" defaultValue={['kept']} {...p} />, 'textbox', true],
  ['DatePicker', (p: Props) => <DatePicker aria-label="Control" {...p} />, 'combobox', false],
  ['DateRangePicker', (p: Props) => <DateRangePicker aria-label="Control" {...p} />, 'combobox', false],
  ['TimePicker', (p: Props) => <TimePicker aria-label="Control" {...p} />, 'group', false],
] as const;

for (const [name, view, role, wrapped] of controls) {
  describe.each(['outline', 'filled', 'ghost'] as const)(`${name} %s states`, (variant) => {
    it('keeps disabled semantics and chrome', () => {
      render(view({ variant, disabled: true }));
      const control = screen.getByRole(role, { name: 'Control' });
      const root = wrapped ? control.closest('.border') : control;
      expect(root?.className).toContain('cursor-disabled');
      if (role === 'group') expect(control).toHaveAttribute('data-disabled');
      else expect(control).toBeDisabled();
    });
    it('keeps read-only semantics and chrome', async () => {
      render(view({ variant, readOnly: true }));
      const control = screen.getByRole(role, { name: 'Control' });
      const root = wrapped ? control.closest('.border') : control;
      if (
        variant === 'outline' &&
        ['Select', 'Combobox', 'DatePicker', 'DateRangePicker', 'TimePicker'].includes(name)
      ) {
        expect(root).toHaveClass('bg-background');
        expect(root).not.toHaveClass('bg-secondary/40');
      } else expect(root?.className).toContain('bg-secondary/40');
      if (role === 'group')
        expect(screen.getByRole('spinbutton', { name: 'Hours' })).toHaveAttribute('aria-readonly', 'true');
      else if (name === 'Select') expect(control).toHaveAttribute('aria-readonly', 'true');
      else expect(control).toHaveAttribute('readonly');
      const user = userEvent.setup();
      if (role === 'textbox') {
        const before = (control as HTMLInputElement).value;
        await user.type(control, 'changed{Backspace}');
        expect(control).toHaveValue(before);
      }
      if (name === 'TokenInput') expect(screen.queryByRole('button', { name: 'Remove kept' })).not.toBeInTheDocument();
    });
  });
}
