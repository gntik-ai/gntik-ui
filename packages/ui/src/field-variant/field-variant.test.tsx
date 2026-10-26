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
import { TimePicker } from '../components/TimePicker/TimePicker';

it.each(['ghost', 'filled'] as const)(
  'Input renders %s chrome and preserves error and keyboard focus styles',
  async (variant) => {
    const user = userEvent.setup();
    render(<Input variant={variant} aria-label="Name" invalid />);
    const input = screen.getByRole('textbox');
    const root = input.parentElement;
    expect(root).toHaveClass(
      'border-transparent',
      'shadow-none',
      variant === 'ghost' ? 'bg-transparent' : 'bg-secondary',
    );
    expect(root).not.toHaveClass('border-border', 'bg-background', 'shadow-sm');
    expect(root).toHaveClass(
      'data-invalid:border-destructive/70',
      'has-[input[aria-invalid=true]]:border-destructive/70',
    );
    expect(input).toHaveAttribute('aria-invalid', 'true');
    await user.tab();
    expect(input).toHaveFocus();
    expect(root).toHaveClass(
      'has-[input:focus-visible]:border-primary/60',
      'has-[input:focus-visible]:outline-focus-ring',
    );
  },
);

it.each(['ghost', 'filled'] as const)('Textarea renders %s chrome with error styles', (variant) => {
  render(<Textarea variant={variant} aria-label="Control" invalid />);
  const root = screen.getByRole('textbox');
  expect(root).toHaveClass(
    'border-transparent',
    'shadow-none',
    variant === 'ghost' ? 'bg-transparent' : 'bg-secondary',
  );
  expect(root).not.toHaveClass('border-border', 'bg-background', 'shadow-sm');
  expect(root).toHaveClass('forced-colors:border-[ButtonText]');
  expect(root).toHaveClass('aria-invalid:border-destructive/70');
});

it.each(['ghost', 'filled'] as const)('NumberInput renders %s chrome with error styles', (variant) => {
  render(<NumberInput variant={variant} aria-label="Control" invalid />);
  const root = screen.getByRole('textbox').parentElement;
  expect(root).toHaveClass(
    'border-transparent',
    'shadow-none',
    variant === 'ghost' ? 'bg-transparent' : 'bg-secondary',
  );
  expect(root).not.toHaveClass('border-border', 'bg-background', 'shadow-sm');
  expect(root).toHaveClass('forced-colors:border-[ButtonText]');
  expect(root).toHaveClass('data-invalid:border-destructive/70');
});

it.each(['ghost', 'filled'] as const)('Select renders %s chrome with error styles', (variant) => {
  render(<SimpleSelect variant={variant} aria-label="Control" items={[]} />);
  const root = screen.getByRole('combobox');
  expect(root).toHaveClass(
    'border-transparent',
    'shadow-none',
    variant === 'ghost' ? 'bg-transparent' : 'bg-secondary',
  );
  expect(root).not.toHaveClass('border-border', 'bg-background', 'shadow-sm');
  expect(root).toHaveClass('forced-colors:border-[ButtonText]');
  expect(root).toHaveClass('focus-visible:border-primary/60', 'data-popup-open:border-primary/60');
});

it.each(['ghost', 'filled'] as const)('Combobox renders %s chrome with error styles', (variant) => {
  render(
    <Combobox items={[]}>
      <ComboboxInput variant={variant} aria-label="Control" aria-invalid="true" />
    </Combobox>,
  );
  const root = screen.getByRole('combobox').parentElement;
  expect(root).toHaveClass(
    'border-transparent',
    'shadow-none',
    variant === 'ghost' ? 'bg-transparent' : 'bg-secondary',
  );
  expect(root).not.toHaveClass('border-border', 'bg-background', 'shadow-sm');
  expect(root).toHaveClass('forced-colors:border-[ButtonText]');
  expect(root).toHaveClass('has-[input[aria-invalid=true]]:border-destructive/70');
});

it.each(['ghost', 'filled'] as const)('MultiSelect renders %s chrome with error styles', (variant) => {
  render(<MultiSelect variant={variant} aria-label="Control" options={[]} invalid />);
  const root = screen.getByRole('combobox').closest('[data-invalid]');
  expect(root).toHaveClass(
    'border-transparent',
    'shadow-none',
    variant === 'ghost' ? 'bg-transparent' : 'bg-secondary',
  );
  expect(root).not.toHaveClass('border-border', 'bg-background', 'shadow-sm');
  expect(root).toHaveClass('forced-colors:border-[ButtonText]');
  expect(root).toHaveClass('data-invalid:border-destructive/70');
});

it.each(['ghost', 'filled'] as const)('TokenInput renders %s chrome with error styles', (variant) => {
  render(<TokenInput variant={variant} aria-label="Control" invalid />);
  const root = screen.getByRole('textbox').parentElement;
  expect(root).toHaveClass(
    'border-transparent',
    'shadow-none',
    variant === 'ghost' ? 'bg-transparent' : 'bg-secondary',
  );
  expect(root).not.toHaveClass('border-border', 'bg-background', 'shadow-sm');
  expect(root).toHaveClass('forced-colors:border-[ButtonText]');
  expect(root).toHaveClass('data-invalid:border-destructive/70');
});

it.each(['ghost', 'filled'] as const)('DatePicker renders %s chrome with error styles', (variant) => {
  render(<DatePicker variant={variant} aria-label="Control" invalid />);
  const root = screen.getByRole('combobox');
  expect(root).toHaveClass(
    'border-transparent',
    'shadow-none',
    variant === 'ghost' ? 'bg-transparent' : 'bg-secondary',
  );
  expect(root).not.toHaveClass('border-border', 'bg-background', 'shadow-sm');
  expect(root).toHaveClass('forced-colors:border-[ButtonText]');
  expect(root).toHaveClass('aria-invalid:border-destructive/70');
});

it.each(['ghost', 'filled'] as const)('TimePicker renders %s chrome with error styles', (variant) => {
  render(<TimePicker variant={variant} aria-label="Control" invalid />);
  const root = screen.getByRole('group', { name: 'Control' });
  expect(root).toHaveClass(
    'border-transparent',
    'shadow-none',
    variant === 'ghost' ? 'bg-transparent' : 'bg-secondary',
  );
  expect(root).not.toHaveClass('border-border', 'bg-background', 'shadow-sm');
  expect(root).toHaveClass('forced-colors:border-[ButtonText]');
  expect(root).toHaveClass('data-invalid:border-destructive/70');
});
