import type { SecretFieldProps } from '../components/SecretField/SecretField';
import type { PasswordInputProps } from '../components/PasswordInput/PasswordInput';
import userEvent from '@testing-library/user-event';
import { SimpleSelect } from '../components/Select/Select';
import { Search } from 'lucide-react';
import { Input } from '../components/Input/Input';
import { NumberInput } from '../components/NumberInput/NumberInput';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { DateRangePicker } from '../components/DatePicker/DateRangePicker';
import { TimePicker } from '../components/TimePicker/TimePicker';
import { comboboxVariants } from '../components/Combobox/combobox.variants';
import { render, screen } from '@testing-library/react';
import { MultiSelect } from '../components/MultiSelect/MultiSelect';
import { multiSelectVariants } from '../components/MultiSelect/multi-select.variants';
import { TokenInput } from '../components/TokenInput/TokenInput';
import { tokenInputVariants } from '../components/TokenInput/token-input.variants';
import { Textarea } from '../components/Textarea/Textarea';
import { textareaVariants } from '../components/Textarea/textarea.variants';
import { inputVariants } from '../components/Input/input.variants';
import { numberInputVariants } from '../components/NumberInput/number-input.variants';
import { datePickerVariants } from '../components/DatePicker/date-picker.variants';
import { timePickerVariants } from '../components/TimePicker/time-picker.variants';
import { cn } from '../utils/cn';

it.each(['sm', 'md'] as const)('preserves the exact public field slot classes at %s', (size) => {
  const variants = {
    multiSelectVariants,
    tokenInputVariants,
    inputVariants,
    numberInputVariants,
    datePickerVariants,
    timePickerVariants,
  };
  const classes = Object.fromEntries(
    Object.entries(variants).map(([name, variant]) => [
      name,
      Object.fromEntries(
        Object.entries(variant({ size }))
          .map(([slot, classes]) => [slot, classes()])
          .filter(([, value]) => value !== undefined),
      ),
    ]),
  );
  expect({ ...classes, textarea: textareaVariants({ size }) }).toMatchSnapshot();
});

it('defaults chip fields and textarea to density metrics and permits minimum-height overrides', () => {
  render(
    <>
      <MultiSelect aria-label="Selection" options={[{ value: 'one', label: 'One' }]} defaultValue={['one']} />
      <TokenInput aria-label="Entries" defaultValue={['One']} />
      <Textarea aria-label="Notes" />
    </>,
  );
  const multi = screen.getByRole('combobox', { name: 'Selection' }).parentElement!.parentElement!;
  expect(multi).toHaveClass('min-h-(--control-h-md)', 'ps-field');
  expect(screen.getByRole('textbox', { name: 'Entries' }).parentElement).toHaveClass(
    'min-h-(--control-h-md)',
    'px-field',
  );
  expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveClass('px-field');
  expect(screen.getByRole('listitem')).toHaveClass('h-chip');
  for (const classes of [multiSelectVariants().group(), tokenInputVariants().root()]) {
    expect(cn(classes, 'min-h-12').split(' ')).not.toContain('min-h-(--control-h-md)');
    expect(cn(classes, 'min-h-12').split(' ')).toContain('min-h-12');
  }
});

it('large fields share fixed height, larger text and 17px field icons', () => {
  const { container } = render(
    <>
      <Input size="lg" leadingIcon={Search} aria-label="Name" />
      <NumberInput size="lg" aria-label="Count" />
      <DatePicker size="lg" aria-label="Date" />
      <DateRangePicker size="lg" aria-label="Range" />
      <TimePicker size="lg" aria-label="Time" />
      <SimpleSelect size="lg" aria-label="Choice" items={[{ value: 'one', label: 'One' }]} />
    </>,
  );
  expect(screen.getByRole('textbox', { name: 'Name' }).parentElement).toHaveClass(
    'h-11',
    'rounded-lg',
    'text-[14.5px]',
  );
  expect(numberInputVariants({ size: 'lg' }).group()).toContain('h-11');
  expect(timePickerVariants({ size: 'lg' }).root()).toContain('h-11');
  for (const name of ['Date', 'Range']) {
    expect(screen.getByRole('combobox', { name })).toHaveClass('h-11', 'rounded-lg', 'text-[14.5px]');
  }
  const icons = container.querySelectorAll('svg');
  expect(icons).toHaveLength(9);
  for (const icon of icons) expect(icon).toHaveAttribute('width', '17');
});

it('large chip fields grow with their content and use 28px chips', () => {
  render(
    <>
      <MultiSelect size="lg" aria-label="Selection" options={[{ value: 'one', label: 'One' }]} defaultValue={['one']} />
      <TokenInput size="lg" aria-label="Entries" defaultValue={['One']} />
      <Textarea size="lg" aria-label="Notes" />
    </>,
  );
  expect(screen.getByRole('combobox', { name: 'Selection' }).parentElement!.parentElement).toHaveClass(
    'min-h-11',
    'rounded-lg',
    'text-[14.5px]',
  );
  expect(screen.getAllByRole('button', { name: 'Remove One' })[0]!.parentElement).toHaveClass('h-7', 'text-[13px]');
  expect(screen.getByRole('textbox', { name: 'Entries' }).parentElement).toHaveClass('min-h-11', 'rounded-lg');
  expect(screen.getByRole('listitem')).toHaveClass('h-7', 'text-[13px]');
  expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveClass('text-[14.5px]', 'leading-6');
});

it.each(['sm', 'md', 'auto', 'lg'] as const)(
  'keeps listbox and calendar panel metrics independent of %s fields',
  (size) => {
    const cb = comboboxVariants({ size });
    const md = comboboxVariants({ size: 'md' });
    for (const slot of ['popup', 'list', 'item'] as const) expect(cb[slot]()).toBe(md[slot]());
    const date = datePickerVariants({ size });
    const dateMd = datePickerVariants({ size: 'md' });
    for (const slot of ['panel', 'timeRow', 'presets', 'preset'] as const) expect(date[slot]()).toBe(dateMd[slot]());
  },
);

it('Tab reaches every large MultiSelect chip remove button', async () => {
  const user = userEvent.setup();
  render(
    <>
      <button>Before</button>
      <MultiSelect
        size="lg"
        aria-label="Selection"
        options={['One', 'Two', 'Three'].map((label) => ({ value: label, label }))}
        defaultValue={['One', 'Two', 'Three']}
      />
    </>,
  );
  screen.getByRole('button', { name: 'Before' }).focus();
  for (const label of ['One', 'Two', 'Three']) {
    await user.tab();
    expect(screen.getByRole('button', { name: `Remove ${label}` })).toHaveFocus();
  }
});

it('includes large password and secret field sizes in the public API', () => {
  expectTypeOf<SecretFieldProps['size']>().toEqualTypeOf<'auto' | 'sm' | 'md' | 'lg' | undefined>();
  expectTypeOf<PasswordInputProps['size']>().toEqualTypeOf<'auto' | 'sm' | 'md' | 'lg' | undefined>();
});
