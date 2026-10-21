import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, es } from '@gntik-ai/ui';
import { DescriptionListCard, type DescriptionListCardLabels } from './DescriptionListCard';
import { DEPLOYMENT_DETAILS } from './fixtures';

it('localizes card defaults, copy names and announcements while retaining fixture fields', async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider locale="es">
      <DescriptionListCard onEdit={() => {}} />
    </I18nProvider>,
  );
  expect(screen.getByRole('heading', { name: es['descriptionList.title'] })).toHaveTextContent('Configuración');
  expect(screen.getByText(es['descriptionList.description'])).toBeVisible();
  expect(screen.getByRole('button', { name: es['descriptionList.edit'] })).toBeVisible();
  for (const item of DEPLOYMENT_DETAILS) {
    expect(screen.getByText(item.label)).toBeVisible();
    if (item.value && !item.status && !item.render) expect(screen.getByText(item.value)).toBeVisible();
  }
  await user.click(screen.getByRole('button', { name: 'Copiar Deployment ID' }));
  expect(screen.getByRole('button', { name: 'Deployment ID copiado' })).toBeVisible();
  expect(screen.getByText(es['common.copiedToClipboard'])).toBeInTheDocument();
  expect(await navigator.clipboard.readText()).toBe('dep_7f3c9a21');
  expect(document.body.textContent).not.toContain('{');
});

it('keeps English defaults and lets explicit props win over every override', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<DescriptionListCard onEdit={() => {}} />);
  expect(screen.getByRole('heading', { name: 'Configuration' })).toBeVisible();
  expect(screen.getByText('Settings of this deployment.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Edit' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Copy Deployment ID' }));
  expect(screen.getByRole('button', { name: 'Deployment ID copied' })).toBeVisible();
  expect(screen.getByText('Copied to clipboard')).toBeInTheDocument();
  const labels: DescriptionListCardLabels = {
    title: 'Title override',
    description: 'Description override',
    edit: 'Edit override',
    copy: (label) => `Copy override ${label}`,
    copied: (label) => `Copied override ${label}`,
    copiedToClipboard: 'Announce override',
  };
  const view = (overrides: Partial<DescriptionListCardLabels>, explicit = false) => (
    <I18nProvider locale="es">
      <DescriptionListCard
        labels={overrides}
        onEdit={() => {}}
        title={explicit ? 'Explicit title' : undefined}
        description={explicit ? 'Explicit description' : undefined}
        editLabel={explicit ? 'Explicit edit' : undefined}
      />
    </I18nProvider>
  );
  rerender(view(labels));
  expect(screen.getByRole('heading', { name: labels.title })).toBeVisible();
  expect(screen.getByText(labels.description)).toBeVisible();
  expect(screen.getByRole('button', { name: labels.edit })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Copy override Deployment ID' }));
  expect(screen.getByRole('button', { name: 'Copied override Deployment ID' })).toBeVisible();
  expect(screen.getByText(labels.copiedToClipboard)).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Copy override Endpoint' }));
  expect(screen.getByRole('button', { name: 'Copied override Endpoint' })).toBeVisible();
  rerender(view(labels, true));
  expect(screen.getByRole('heading', { name: 'Explicit title' })).toBeVisible();
  expect(screen.getByText('Explicit description')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Explicit edit' })).toBeVisible();
  rerender(view({ edit: 'Only edit' }));
  expect(screen.getByRole('heading', { name: es['descriptionList.title'] })).toBeVisible();
  expect(screen.getByText(es['descriptionList.description'])).toBeVisible();
  expect(screen.getByRole('button', { name: 'Deployment ID copiado' })).toBeVisible();
});
