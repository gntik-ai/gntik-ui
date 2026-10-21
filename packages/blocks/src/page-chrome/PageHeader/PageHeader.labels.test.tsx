import { render, screen } from '@testing-library/react';
import { I18nProvider, es } from '@gntik-ai/ui';
import { PageHeader, type PageHeaderLabels } from './PageHeader';
import { pageHeaderMeta, pageHeaderTabs, pageHeaderActions } from './fixtures';

it('translates built-in header labels and leaves fixtures untouched', () => {
  render(
    <I18nProvider locale="es">
      <PageHeader />
    </I18nProvider>,
  );
  expect(screen.getByRole('heading', { name: es['pageHeader.title'] })).toHaveTextContent('Despliegues');
  expect(screen.getByText(es['pageHeader.description'])).toBeVisible();
  expect(screen.getByRole('button', { name: es['pageHeader.moreActions'] })).toBeVisible();
  expect(screen.getByRole('tablist', { name: es['pageHeader.sections'] })).toBeVisible();
  for (const item of pageHeaderMeta) expect(screen.getByText(String(item.value))).toBeVisible();
  for (const tab of pageHeaderTabs) expect(screen.getByRole('tab', { name: new RegExp(tab.label) })).toBeVisible();
  for (const action of pageHeaderActions)
    expect(screen.getAllByRole('button', { name: action.label })[0]).toBeVisible();
});

it('preserves English and merges each override below explicit title and description props', () => {
  const { rerender } = render(<PageHeader />);
  expect(screen.getByRole('heading', { name: 'Deployments' })).toBeVisible();
  expect(screen.getByText('Every build and release of this project across its environments.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'More actions' })).toBeVisible();
  expect(screen.getByRole('tablist', { name: 'Page sections' })).toBeVisible();
  const labels: PageHeaderLabels = {
    title: 'Custom title',
    description: 'Custom description',
    moreActions: 'Custom actions',
    sections: 'Custom sections',
  };
  const view = (overrides: Partial<PageHeaderLabels>, explicit = false) => (
    <I18nProvider locale="es">
      <PageHeader
        labels={overrides}
        title={explicit ? 'Explicit title' : undefined}
        description={explicit ? 'Explicit description' : undefined}
      />
    </I18nProvider>
  );
  rerender(view(labels));
  expect(screen.getByRole('heading', { name: labels.title })).toBeVisible();
  expect(screen.getByText(labels.description)).toBeVisible();
  expect(screen.getByRole('button', { name: labels.moreActions })).toBeVisible();
  expect(screen.getByRole('tablist', { name: labels.sections })).toBeVisible();
  rerender(view(labels, true));
  expect(screen.getByRole('heading', { name: 'Explicit title' })).toBeVisible();
  expect(screen.getByText('Explicit description')).toBeVisible();
  rerender(view({ moreActions: '' }));
  expect(screen.getByRole('heading', { name: es['pageHeader.title'] })).toBeVisible();
  expect(screen.getByText(es['pageHeader.description'])).toBeVisible();
  expect(screen.getByRole('tablist', { name: es['pageHeader.sections'] })).toBeVisible();
  expect(screen.getByRole('button', { name: '' })).toBeVisible();
});
