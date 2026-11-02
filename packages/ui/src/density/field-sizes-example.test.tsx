import { render, screen, within } from '@testing-library/react';
import { expectNoAxeViolations } from '../test/a11y';
import { I18nProvider } from '../i18n/I18nProvider';
import FieldSizes from '../components/Input/examples/FieldSizes';

it('compares only the fields in the shared size scale in each row', () => {
  render(<FieldSizes />);
  const comfortable = within(screen.getByRole('group', { name: 'Comfortable' }));
  for (const size of ['Small', 'Auto', 'Medium', 'Large']) {
    const row = within(comfortable.getByRole('group', { name: size }));
    expect(row.getAllByRole('combobox').map((field) => field.getAttribute('aria-label'))).toEqual([
      'Choice',
      'Member',
      'Date',
      'Date range',
    ]);
    expect(row.getByRole('button', { name: 'Apply' })).toBeInTheDocument();
  }
});

it.each(['dark', 'light', 'high_contrast'])(
  'FieldSizes exposes every size and has no axe violations in %s',
  async (theme) => {
    document.documentElement.className = theme === 'light' ? '' : theme;
    const { container } = render(<FieldSizes />);
    for (const density of ['Comfortable', 'Compact']) {
      const group = within(screen.getByRole('group', { name: density }));
      for (const size of ['Small', 'Auto', 'Medium', 'Large']) {
        expect(group.getByRole('group', { name: size })).toBeInTheDocument();
      }
    }
    await expectNoAxeViolations(container);
  },
);

it('FieldSizes translates its labels and fixtures into Spanish', () => {
  render(
    <I18nProvider locale="es">
      <FieldSizes />
    </I18nProvider>,
  );
  expect(screen.getByRole('group', { name: 'Compacta' })).toBeInTheDocument();
  expect(screen.getAllByRole('textbox', { name: 'Nombre' })).toHaveLength(8);
  expect(screen.getAllByRole('button', { name: 'Quitar Miembro' }).length).toBeGreaterThan(0);
});
