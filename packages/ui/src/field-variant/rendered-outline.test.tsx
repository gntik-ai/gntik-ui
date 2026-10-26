import { render, screen } from '@testing-library/react';
import { SimpleSelect } from '../components/Select/Select';
import { Combobox, ComboboxInput, ComboboxChipsInput } from '../components/Combobox/Combobox';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { DateRangePicker } from '../components/DatePicker/DateRangePicker';
import { TimePicker } from '../components/TimePicker/TimePicker';
import { FieldVariantProvider } from './index';
import original from './outline-classes.json';

type Props = { variant?: 'outline'; readOnly?: boolean; disabled?: boolean };
const controls = [
  ['Select.trigger', (p: Props) => <SimpleSelect aria-label="Control" items={[]} {...p} />, 'combobox', false],
  [
    'Combobox.inputGroup',
    ({ variant, ...p }: Props) => (
      <Combobox items={[]} {...p}>
        <ComboboxInput aria-label="Control" variant={variant} />
      </Combobox>
    ),
    'combobox',
    true,
  ],
  [
    'Combobox.chipsGroup',
    ({ variant, ...p }: Props) => (
      <Combobox multiple items={[]} {...p}>
        <ComboboxChipsInput aria-label="Control" variant={variant} />
      </Combobox>
    ),
    'combobox',
    true,
  ],
  ['DatePicker.input', (p: Props) => <DatePicker aria-label="Control" {...p} />, 'combobox', false],
  ['DatePicker.input', (p: Props) => <DateRangePicker aria-label="Control" {...p} />, 'combobox', false],
  ['TimePicker.root', (p: Props) => <TimePicker aria-label="Control" {...p} />, 'group', false],
] as const;

for (const [slot, view, role, wrapped] of controls) {
  describe.each(['default', 'explicit', 'provider override'] as const)(`${slot} %s`, (mode) => {
    it.each([{}, { readOnly: true }, { disabled: true }])('preserves base classes with state %j', (state) => {
      const control = view({ ...state, variant: mode === 'default' ? undefined : 'outline' });
      render(
        mode === 'provider override' ? <FieldVariantProvider variant="ghost">{control}</FieldVariantProvider> : control,
      );
      const element = screen.getByRole(role, { name: 'Control' });
      expect((wrapped ? element.closest('.border') : element)?.className).toBe(original[slot]);
    });
  });
}
