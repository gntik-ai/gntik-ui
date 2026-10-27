import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
import TimePickerVariants from '../components/TimePicker/examples/TimePickerChromeVariants';

it('preserves the clearable TimePicker as the last time field in the docs catalog', async () => {
  const user = userEvent.setup();
  // Discover the same examples/*.tsx files the catalog renders in path order.
  const examples = await Promise.all(
    readdirSync(resolve(import.meta.dirname, '../components/TimePicker/examples'))
      .filter((file) => file.endsWith('.tsx'))
      .sort()
      .map(async (file) => {
        const module: { default: typeof TimePickerVariants } = await import(
          `../components/TimePicker/examples/${file.replace(/\.tsx$/, '')}.tsx`
        );
        return { file, Example: module.default };
      }),
  );
  const { container } = render(
    <>
      {examples.map(({ file, Example }) => (
        <Example key={file} />
      ))}
    </>,
  );
  await user.click(screen.getByRole('button', { name: 'Reset start time' }));
  const hours = container.querySelectorAll('[data-segment="hour"]');
  expect(hours[hours.length - 1]).toHaveFocus();
});

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
