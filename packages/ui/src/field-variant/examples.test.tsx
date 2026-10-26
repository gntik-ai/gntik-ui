import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../test/a11y';
import { I18nProvider } from '../i18n/I18nProvider';
import InputVariants from '../components/Input/examples/InputVariants';
import TextareaVariants from '../components/Textarea/examples/TextareaVariants';
import NumberInputVariants from '../components/NumberInput/examples/NumberInputVariants';
import SelectVariants from '../components/Select/examples/SelectVariants';
import ComboboxVariants from '../components/Combobox/examples/ComboboxVariants';
import MultiSelectVariants from '../components/MultiSelect/examples/MultiSelectVariants';
import TokenInputVariants from '../components/TokenInput/examples/TokenInputVariants';
import DatePickerVariants from '../components/DatePicker/examples/DatePickerVariants';
import TimePickerVariants from '../components/TimePicker/examples/TimePickerVariants';

it.each(['dark', 'light', 'high_contrast'])(
  'new field examples have no structural axe violations in %s',
  async (theme) => {
    render(
      <div className={theme}>
        <InputVariants />
        <TextareaVariants />
        <NumberInputVariants />
        <SelectVariants />
        <ComboboxVariants />
        <MultiSelectVariants />
        <TokenInputVariants />
        <DatePickerVariants />
        <TimePickerVariants />
      </div>,
    );
    await expectNoAxeViolations();
  },
);

it('uses the Spanish catalog for the new accessible copy', () => {
  render(
    <I18nProvider locale="es">
      <InputVariants />
    </I18nProvider>,
  );
  expect(screen.getByRole('textbox', { name: 'Nombre' })).toBeInTheDocument();
  expect(screen.getByRole('toolbar', { name: 'Barra de filtros' })).toBeInTheDocument();
});
