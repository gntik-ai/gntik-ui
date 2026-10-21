import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, es } from '@gntik-ai/ui';
import {
  FirstRunEmpty,
  NoResultsEmpty,
  NoAccessEmpty,
  NotFoundEmpty,
  type FirstRunEmptyLabels,
  type NoResultsEmptyLabels,
  type NoAccessEmptyLabels,
} from './EmptyStates';
import { firstRunSteps, notFoundSample } from './fixtures';

it('localizes first-run defaults and retains imported first-run and not-found fixtures', () => {
  render(
    <I18nProvider locale="es">
      <FirstRunEmpty />
      <NotFoundEmpty />
    </I18nProvider>,
  );
  expect(screen.getByRole('heading', { name: es['emptyState.firstRun.title'] })).toHaveTextContent(
    'Crea tu primer proyecto',
  );
  expect(screen.getByText(es['emptyState.firstRun.description'])).toBeVisible();
  expect(screen.getByRole('button', { name: es['emptyState.firstRun.action'] })).toBeVisible();
  expect(screen.getByRole('link', { name: es['emptyState.firstRun.guide'] })).toHaveAttribute('href', '#guide');
  for (const step of firstRunSteps) expect(screen.getByText(step)).toBeVisible();
  expect(screen.getByRole('heading', { name: notFoundSample.title })).toBeVisible();
  expect(screen.getByText(notFoundSample.description)).toBeVisible();
});

it('preserves first-run English and merges labels below explicit props', () => {
  const { rerender } = render(<FirstRunEmpty />);
  expect(screen.getByRole('heading', { name: 'Create your first project' })).toBeVisible();
  expect(
    screen.getByText(
      'Projects group your services, environments and deployments. Start one from a repository in a couple of minutes.',
    ),
  ).toBeVisible();
  expect(screen.getByRole('button', { name: 'New project' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'Read the guide' })).toBeVisible();
  const labels: FirstRunEmptyLabels = {
    title: 'Title override',
    description: 'Description override',
    action: 'Action override',
    guide: 'Guide override',
  };
  const view = (overrides: Partial<FirstRunEmptyLabels>, explicit = false) => (
    <I18nProvider locale="es">
      <FirstRunEmpty
        labels={overrides}
        title={explicit ? 'Explicit title' : undefined}
        description={explicit ? 'Explicit description' : undefined}
        actionLabel={explicit ? 'Explicit action' : undefined}
        secondary={explicit ? { label: 'Explicit guide', href: '#explicit' } : undefined}
      />
    </I18nProvider>
  );
  rerender(view(labels));
  expect(screen.getByRole('heading', { name: labels.title })).toBeVisible();
  expect(screen.getByText(labels.description)).toBeVisible();
  expect(screen.getByRole('button', { name: labels.action })).toBeVisible();
  expect(screen.getByRole('link', { name: labels.guide })).toBeVisible();
  rerender(view(labels, true));
  expect(screen.getByRole('heading', { name: 'Explicit title' })).toBeVisible();
  expect(screen.getByText('Explicit description')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Explicit action' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'Explicit guide' })).toHaveAttribute('href', '#explicit');
  rerender(view({ action: 'Only action' }));
  expect(screen.getByRole('heading', { name: es['emptyState.firstRun.title'] })).toBeVisible();
  expect(screen.getByText(es['emptyState.firstRun.description'])).toBeVisible();
  expect(screen.getByRole('link', { name: es['emptyState.firstRun.guide'] })).toBeVisible();
});

it.each([
  [0, 'Revisa la ortografía o prueba una búsqueda más amplia.'],
  [1, 'Revisa la ortografía o prueba una búsqueda más amplia con 1 filtro aplicado.'],
  [2, 'Revisa la ortografía o prueba una búsqueda más amplia con 2 filtros aplicados.'],
])('localizes no-results with %i filters and keeps the query in its mono span', (filterCount, description) => {
  const { container, rerender } = render(
    <I18nProvider locale="es">
      <NoResultsEmpty filterCount={filterCount} />
    </I18nProvider>,
  );
  const heading = screen.getByRole('heading', { name: 'No hay projects que coincidan con “billing-api”' });
  expect(heading.querySelector('span.font-mono')).toHaveTextContent('billing-api');
  expect(screen.getByText(description)).toBeVisible();
  if (filterCount > 0)
    expect(screen.getByRole('button', { name: es['emptyState.noResults.clearFilters'] })).toBeVisible();
  expect(screen.getByRole('button', { name: es['emptyState.noResults.clearSearch'] })).toBeVisible();
  expect(container.textContent).not.toContain('{');
  rerender(
    <I18nProvider locale="es">
      <NoResultsEmpty query="" filterCount={filterCount} />
    </I18nProvider>,
  );
  expect(screen.getByRole('heading', { name: 'No se encontraron projects' })).toBeVisible();
});

it('preserves English no-results markup and all per-key formatter overrides', () => {
  const { rerender } = render(<NoResultsEmpty filterCount={1} />);
  const heading = screen.getByRole('heading', { name: 'No projects match “billing-api”' });
  expect(heading.innerHTML).toBe('No projects match “<span class="font-mono">billing-api</span>”');
  expect(screen.getByText('Check the spelling or try a broader search with 1 filter applied.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Clear filters' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Clear search' })).toBeVisible();
  rerender(<NoResultsEmpty query="" filterCount={2} />);
  expect(screen.getByRole('heading', { name: 'No projects found' })).toBeVisible();
  expect(screen.getByText('Check the spelling or try a broader search with 2 filters applied.')).toBeVisible();
  const labels: NoResultsEmptyLabels = {
    queryTitle: (entity, query) => `Query override ${entity}: ${query}`,
    title: (entity) => `Title override ${entity}`,
    description: (count) => `Description override ${count}`,
    clearFilters: 'Filters override',
    clearSearch: 'Search override',
  };
  const view = (overrides: Partial<NoResultsEmptyLabels>, query = 'billing-api') => (
    <I18nProvider locale="es">
      <NoResultsEmpty labels={overrides} query={query} />
    </I18nProvider>
  );
  rerender(view(labels));
  expect(screen.getByRole('heading', { name: 'Query override projects: billing-api' })).toBeVisible();
  expect(screen.getByText('Description override 2')).toBeVisible();
  expect(screen.getByRole('button', { name: labels.clearFilters })).toBeVisible();
  expect(screen.getByRole('button', { name: labels.clearSearch })).toBeVisible();
  rerender(view(labels, ''));
  expect(screen.getByRole('heading', { name: 'Title override projects' })).toBeVisible();
  rerender(view({ clearSearch: 'Only search' }));
  expect(screen.getByRole('heading', { name: 'No hay projects que coincidan con “billing-api”' })).toBeVisible();
  expect(
    screen.getByText('Revisa la ortografía o prueba una búsqueda más amplia con 2 filtros aplicados.'),
  ).toBeVisible();
  expect(screen.getByRole('button', { name: es['emptyState.noResults.clearFilters'] })).toBeVisible();
});

it('localizes access messages around unchanged sample resource and owner, including requested state', async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider locale="es">
      <NoAccessEmpty />
    </I18nProvider>,
  );
  expect(screen.getByRole('heading', { name: 'No tienes acceso a Billing' })).toBeVisible();
  expect(screen.getByText('Pide a an organization admin que te asigne un rol con permisos de billing.')).toBeVisible();
  await user.click(screen.getByRole('button', { name: es['emptyState.noAccess.request'] }));
  expect(screen.getByRole('button', { name: es['emptyState.noAccess.requested'] })).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent(es['emptyState.noAccess.sent']);
  expect(document.body.textContent).not.toContain('{');
});

it('keeps English access messages and renders each access override verbatim with catalog fallback', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<NoAccessEmpty />);
  expect(screen.getByRole('heading', { name: 'You don’t have access to Billing' })).toBeVisible();
  expect(
    screen.getByText('Ask an organization admin to grant you a role that includes billing permissions.'),
  ).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Request access' }));
  expect(screen.getByRole('button', { name: 'Access requested' })).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent('Access request sent');
  const labels: NoAccessEmptyLabels = {
    title: (resource) => `Title override ${resource}`,
    description: (resource, owner) => `Description override ${resource}: ${owner}`,
    request: 'Request override',
    requested: 'Requested override',
    sent: 'Sent override',
  };
  const view = (overrides: Partial<NoAccessEmptyLabels>) => (
    <I18nProvider locale="es">
      <NoAccessEmpty labels={overrides} />
    </I18nProvider>
  );
  rerender(view(labels));
  expect(screen.getByRole('heading', { name: 'Title override Billing' })).toBeVisible();
  expect(screen.getByText('Description override Billing: an organization admin')).toBeVisible();
  await user.click(screen.getByRole('button', { name: labels.request }));
  expect(screen.getByRole('button', { name: labels.requested })).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent(labels.sent);
  rerender(view({ title: (resource) => `Only title ${resource}` }));
  expect(screen.getByText('Pide a an organization admin que te asigne un rol con permisos de billing.')).toBeVisible();
  expect(screen.getByRole('button', { name: es['emptyState.noAccess.requested'] })).toBeDisabled();
  expect(screen.getByRole('status')).toHaveTextContent(es['emptyState.noAccess.sent']);
});
