import { render, screen } from '@testing-library/react';
import { Input } from '../components/Input/Input';
import { SimpleSelect } from '../components/Select/Select';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { FieldVariantProvider, useFieldVariant } from './index';

it('inherits the nearest provider and lets explicit outline win', () => {
  render(
    <FieldVariantProvider variant="ghost">
      <SimpleSelect aria-label="Choice" items={[]} />
      <DatePicker aria-label="Date" />
      <Input aria-label="Outline" variant="outline" />
      <FieldVariantProvider variant="filled">
        <Input aria-label="Nested" />
      </FieldVariantProvider>
    </FieldVariantProvider>,
  );
  expect(screen.getByRole('combobox', { name: 'Choice' })).toHaveClass('bg-transparent', 'border-transparent');
  expect(screen.getByRole('combobox', { name: 'Date' })).toHaveClass('bg-transparent', 'border-transparent');
  expect(screen.getByRole('textbox', { name: 'Outline' }).parentElement).toHaveClass(
    'bg-background',
    'border-border',
    'shadow-sm',
  );
  expect(screen.getByRole('textbox', { name: 'Nested' }).parentElement).toHaveClass(
    'bg-secondary',
    'border-transparent',
  );
});

it('the public hook defaults to outline', () => {
  function Consumer() {
    return <output>{useFieldVariant()}</output>;
  }
  render(<Consumer />);
  expect(screen.getByRole('status')).toHaveTextContent('outline');
});
