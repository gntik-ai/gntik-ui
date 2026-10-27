import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleSelect } from '../components/Select/Select';
import { DatePicker } from '../components/DatePicker/DatePicker';
import { DateRangePicker } from '../components/DatePicker/DateRangePicker';
import { Combobox, ComboboxChipsInput } from '../components/Combobox/Combobox';
import { FieldVariantProvider } from './index';

it.each(['filled', 'ghost'] as const)('keeps disabled %s date borders transparent on hover', (variant) => {
  render(<DatePicker variant={variant} aria-label="Date" disabled />);
  const trigger = screen.getByRole('combobox');
  expect(trigger).toBeDisabled();
  expect(trigger).toHaveClass('disabled:hover:border-transparent');
  expect(trigger).not.toHaveClass('disabled:hover:border-border');
  expect(trigger).toHaveClass(
    'disabled:hover:data-invalid:border-destructive/70',
    'disabled:hover:aria-invalid:border-destructive/70',
  );
});

it.each(['date', 'range'] as const)('keeps %s popup controls outlined inside a ghost provider', async (kind) => {
  const user = userEvent.setup();
  const date = new Date(2026, 9, 15);
  render(
    <FieldVariantProvider variant="ghost">
      {kind === 'date' ? (
        <DatePicker aria-label="Date" defaultValue={date} captionLayout="select" withTime />
      ) : (
        <DateRangePicker aria-label="Date" defaultValue={{ start: date, end: date }} captionLayout="select" />
      )}
    </FieldVariantProvider>,
  );
  const trigger = screen.getByRole('combobox', { name: 'Date' });
  expect(trigger).toHaveClass('bg-transparent', 'border-transparent');
  await user.click(trigger);
  const popup = within(await screen.findByRole('dialog'));
  for (const control of popup.getAllByRole('combobox')) {
    expect(control).toHaveClass('border-border', 'bg-background', 'shadow-sm');
    expect(control).not.toHaveClass('border-transparent', 'bg-transparent');
  }
  expect(popup.getAllByRole('combobox', { name: 'Month' }).length).toBeGreaterThan(0);
  expect(popup.getAllByRole('combobox', { name: 'Year' }).length).toBeGreaterThan(0);
  if (kind === 'date') expect(popup.getByRole('group', { name: 'Time' })).toHaveClass('border-border', 'bg-background');
});

it.each(['filled', 'ghost'] as const)(
  'select %s retains primary chrome while open and errors during hover',
  async (variant) => {
    const user = userEvent.setup();
    render(<SimpleSelect variant={variant} aria-label="Choice" items={[{ value: 'one', label: 'One' }]} />);
    const trigger = screen.getByRole('combobox');
    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute('data-popup-open'));
    expect(trigger).toHaveClass(
      'data-popup-open:border-primary/60',
      'hover:data-popup-open:border-primary/60',
      'hover:focus-visible:border-primary/60',
      'hover:data-invalid:border-destructive/70',
      'hover:aria-invalid:border-destructive/70',
    );
  },
);

it.each(['filled', 'ghost'] as const)(
  'date %s retains errors during hover and focuses from the keyboard',
  async (variant) => {
    const user = userEvent.setup();
    render(<DatePicker variant={variant} aria-label="Date" invalid />);
    const trigger = screen.getByRole('combobox');
    await user.tab();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveClass(
      'hover:focus-visible:border-primary/60',
      'hover:data-invalid:border-destructive/70',
      'hover:aria-invalid:border-destructive/70',
    );
  },
);

it('applies provider defaults to range and chips fields and keeps explicit outline', () => {
  render(
    <FieldVariantProvider variant="ghost">
      <DateRangePicker aria-label="Range" />
      <Combobox multiple items={[]}>
        <ComboboxChipsInput aria-label="Chips" />
      </Combobox>
      <DatePicker variant="outline" aria-label="Outline" />
    </FieldVariantProvider>,
  );
  expect(screen.getByRole('combobox', { name: 'Range' })).toHaveClass('bg-transparent', 'border-transparent');
  expect(screen.getByRole('combobox', { name: 'Chips' }).closest('.border')).toHaveClass(
    'bg-transparent',
    'border-transparent',
  );
  expect(screen.getByRole('combobox', { name: 'Outline' })).toHaveClass('bg-background', 'border-border');
});
