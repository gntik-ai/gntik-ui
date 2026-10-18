import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, FieldDescription, FieldLabel } from '../Field';
import { I18nProvider } from '../../i18n/I18nProvider';
import { DateRangeField } from './DateRangeField';

it.each([
  ['day', false],
  ['minute', true],
] as const)('compares same-day ranges at %s granularity', (granularity, invalid) => {
  const { container } = render(
    <DateRangeField
      locale="en-US"
      name="window"
      granularity={granularity}
      hourCycle={24}
      defaultValue={{ start: new Date(2026, 9, 1, 15), end: new Date(2026, 9, 1, 14) }}
    />,
  );
  expect(screen.getByRole('group').hasAttribute('data-invalid')).toBe(invalid);
  screen.getAllByRole('spinbutton').forEach((segment) => expect(segment.hasAttribute('aria-invalid')).toBe(invalid));
  expect(container.querySelector('input[name="window-start"]')).toHaveValue(
    granularity === 'day' ? '2026-10-01' : '2026-10-01T15:00',
  );
  expect(container.querySelector('input[name="window-end"]')).toHaveValue(
    granularity === 'day' ? '2026-10-01' : '2026-10-01T14:00',
  );
});

it('allows the catalog to control the complete accessible segment name', () => {
  render(
    <I18nProvider locale="es-ES" messages={{ 'dateField.segmentInRange': '{segment} ({range})' }}>
      <DateRangeField />
    </I18nProvider>,
  );
  expect(screen.getAllByRole('spinbutton').map((segment) => segment.getAttribute('aria-label'))).toEqual([
    'Día (Fecha de inicio)',
    'Mes (Fecha de inicio)',
    'Año (Fecha de inicio)',
    'Día (Fecha de fin)',
    'Mes (Fecha de fin)',
    'Año (Fecha de fin)',
  ]);
});

it('keeps six date segments in one group, reports reversed ranges, and submits both dates', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  const { container } = render(<DateRangeField locale="en-US" name="window" onValueChange={onValueChange} />);
  expect(screen.getAllByRole('group')).toHaveLength(1);
  expect(screen.getAllByRole('spinbutton')).toHaveLength(6);
  fireEvent.paste(screen.getByRole('spinbutton', { name: 'Start date, Month' }), {
    clipboardData: { getData: () => '2026-10-10' },
  });
  fireEvent.paste(screen.getByRole('spinbutton', { name: 'End date, Month' }), {
    clipboardData: { getData: () => '2026-10-01' },
  });
  expect(onValueChange).toHaveBeenLastCalledWith({ start: new Date(2026, 9, 10), end: new Date(2026, 9, 1) });
  expect(container.querySelector('input[name="window-start"]')).toHaveValue('2026-10-10');
  expect(container.querySelector('input[name="window-end"]')).toHaveValue('2026-10-01');
  expect(screen.getByRole('group')).toHaveAttribute('data-invalid');
  screen.getAllByRole('spinbutton').forEach((segment) => expect(segment).toHaveAttribute('aria-invalid', 'true'));
  const year = screen.getByRole('spinbutton', { name: 'Start date, Year' });
  await user.click(year);
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('spinbutton', { name: 'End date, Month' })).toHaveFocus();
  await user.keyboard('{ArrowLeft}');
  expect(year).toHaveFocus();
});

it('wires a single Field label and description and inherits disabled state', async () => {
  const user = userEvent.setup();
  const onValueChange = vi.fn();
  render(
    <Field disabled>
      <FieldLabel>Window</FieldLabel>
      <DateRangeField onValueChange={onValueChange} />
      <FieldDescription>Local dates.</FieldDescription>
    </Field>,
  );
  expect(screen.getByRole('group', { name: 'Window' })).toHaveAccessibleDescription('Local dates.');
  for (const segment of screen.getAllByRole('spinbutton')) {
    expect(segment).toHaveAttribute('aria-disabled', 'true');
    expect(segment).toHaveAttribute('tabindex', '-1');
    fireEvent.keyDown(segment, { key: 'ArrowUp' });
    fireEvent.paste(segment, { clipboardData: { getData: () => '2026-10-01' } });
  }
  await user.tab();
  expect(screen.getAllByRole('spinbutton')).not.toContain(document.activeElement);
  expect(onValueChange).not.toHaveBeenCalled();
});
