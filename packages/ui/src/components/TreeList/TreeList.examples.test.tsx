import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '../../i18n/I18nProvider';
import { expectNoAxeViolations } from '../../test/a11y';
import TreeListFilter from './examples/TreeListFilter';
import TreeListNavigation from './examples/TreeListNavigation';

it('shows a usable filter and custom files-only matcher in the catalog example', async () => {
  const user = userEvent.setup();
  render(<TreeListFilter />);
  expect(screen.getByRole('treeitem', { name: /^Dialog\.tsx/ })).toBeInTheDocument();
  const input = screen.getByRole('textbox', { name: 'Filter loaded files' });
  await user.clear(input);
  await user.type(input, 'src');
  expect(screen.getByRole('treeitem', { name: 'src' })).toBeInTheDocument();
  await user.click(screen.getByRole('checkbox', { name: 'Files only' }));
  expect(screen.getByText('No matches.')).toBeVisible();
});

it.each(['dark', 'light', 'high_contrast'])('both new examples are axe clean in %s', async (theme) => {
  document.documentElement.className = theme === 'light' ? '' : theme;
  const { unmount } = render(
    <>
      <TreeListFilter />
      <TreeListNavigation />
    </>,
  );
  await expectNoAxeViolations();
  unmount();
  document.documentElement.className = '';
});

it('translates the new examples', () => {
  render(
    <I18nProvider locale="es">
      <TreeListFilter />
      <TreeListNavigation />
    </I18nProvider>,
  );
  expect(screen.getByRole('textbox', { name: 'Filtrar archivos cargados' })).toBeInTheDocument();
  expect(screen.getByRole('tree', { name: 'Navegación de documentación' })).toBeInTheDocument();
});

it('updates the current destination through the navigation example router', async () => {
  const user = userEvent.setup();
  render(<TreeListNavigation />);
  const components = screen.getByRole('treeitem', { name: 'Components' });
  await user.click(screen.getByText('Components'));
  expect(components).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('treeitem', { name: 'Getting started' })).not.toHaveAttribute('aria-current');
});
