import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, es } from '@gntik-ai/ui';
import ResourceDetailPage, { type ResourceDetailLabels } from './Page';
import { detailResource, detailMeta, detailItems } from './data';
import { expectNoAxeViolations } from '../test/a11y';

it(
  'localizes only resource tabs and their tablist, preserves fixtures, and remains keyboard accessible',
  { timeout: 15000 },
  async () => {
    const user = userEvent.setup();
    const { container } = render(
      <I18nProvider locale="es">
        <ResourceDetailPage />
      </I18nProvider>,
    );
    expect(screen.getByRole('tablist', { name: es['resourceDetail.sections'] })).toBeVisible();
    for (const key of ['overview', 'activity', 'settings'] as const)
      expect(screen.getByRole('tab', { name: es[`resourceDetail.${key}`] })).toBeVisible();
    const overview = screen.getByRole('tab', { name: 'Resumen' });
    expect(overview).toHaveAttribute('aria-selected', 'true');
    act(() => overview.focus());
    await user.keyboard('{ArrowRight}{Enter}');
    expect(screen.getByRole('tab', { name: 'Actividad' })).toHaveAttribute('aria-selected', 'true');
    await user.click(overview);
    expect(screen.getByRole('heading', { name: detailResource.name })).toBeVisible();
    expect(screen.getByText(detailResource.description)).toBeVisible();
    for (const item of detailMeta) expect(screen.getAllByText(String(item.value))[0]).toBeVisible();
    for (const item of detailItems) expect(screen.getAllByText(item.label)[0]).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Configuration' })).toBeVisible();
    expect(screen.getAllByRole('button', { name: 'View logs' })[0]).toBeVisible();
    expect(screen.getAllByRole('link', { name: 'Deployments' })[0]).toHaveAttribute('href', '/deployments');
    expect(container.textContent).not.toContain('{');
    await expectNoAxeViolations(container);
  },
);

it('keeps the English defaults and renders every tab override with catalog fallback in readOnly mode', () => {
  const { rerender } = render(<ResourceDetailPage />);
  expect(screen.getByRole('tablist', { name: 'Resource sections' })).toBeVisible();
  for (const name of ['Overview', 'Activity', 'Settings']) expect(screen.getByRole('tab', { name })).toBeVisible();
  const labels: ResourceDetailLabels = {
    overview: 'Overview override',
    activity: 'Activity override',
    settings: 'Settings override',
    sections: 'Sections override',
  };
  const view = (overrides: Partial<ResourceDetailLabels>, readOnly = false) => (
    <I18nProvider locale="es">
      <ResourceDetailPage labels={overrides} readOnly={readOnly} />
    </I18nProvider>
  );
  rerender(view(labels));
  expect(screen.getByRole('tablist', { name: labels.sections })).toBeVisible();
  for (const name of [labels.overview, labels.activity, labels.settings])
    expect(screen.getByRole('tab', { name })).toBeVisible();
  rerender(view({ overview: 'Only overview' }));
  expect(screen.getByRole('tablist', { name: es['resourceDetail.sections'] })).toBeVisible();
  expect(screen.getByRole('tab', { name: 'Only overview' })).toBeVisible();
  expect(screen.getByRole('tab', { name: es['resourceDetail.activity'] })).toBeVisible();
  expect(screen.getByRole('tab', { name: es['resourceDetail.settings'] })).toBeVisible();
  rerender(view({}, true));
  expect(screen.getAllByRole('tab')).toHaveLength(1);
  expect(screen.getByRole('tab', { name: es['resourceDetail.overview'] })).toHaveAttribute('aria-selected', 'true');
  expect(screen.getByRole('tablist', { name: es['resourceDetail.sections'] })).toBeVisible();
});
