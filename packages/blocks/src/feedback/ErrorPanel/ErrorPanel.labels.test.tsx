import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, es } from '@gntik-ai/ui';
import { ErrorPanel, type ErrorPanelLabels } from './ErrorPanel';

it('translates error chrome and announcements without translating request data or technical details', async () => {
  const user = userEvent.setup();
  const view = (retrying = false) => (
    <I18nProvider locale="es">
      <ErrorPanel retrying={retrying} onRetry={() => {}} />
    </I18nProvider>
  );
  const { rerender } = render(view());
  expect(screen.getByRole('heading', { name: es['error.title'] })).toHaveTextContent(
    'No se pudieron cargar los despliegues',
  );
  expect(screen.getByText(es['error.message'])).toBeVisible();
  expect(screen.getByText(es['error.requestId'])).toBeVisible();
  expect(screen.getByText('req_8f2c41d07a9b')).toBeVisible();
  expect(screen.getByText('503')).toBeVisible();
  expect(screen.getByRole('button', { name: es['error.retry'] })).toBeVisible();
  expect(screen.getByRole('button', { name: es['error.support'] })).toBeVisible();
  await user.click(screen.getByRole('button', { name: es['error.copyRequestId'] }));
  expect(screen.getByRole('button', { name: es['common.copied'] })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(es['error.requestIdCopied']);
  expect(await navigator.clipboard.readText()).toBe('req_8f2c41d07a9b');
  await user.click(screen.getByRole('button', { name: es['error.details'] }));
  expect(screen.getByText(/503 Service Unavailable/).textContent).toBe(
    'GET /v1/projects/acme-web/deployments\n503 Service Unavailable\nupstream timed out after 30000 ms (pool: api-eu-west-1)',
  );
  rerender(view(true));
  expect(screen.getByRole('button', { name: es['error.retrying'] })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(es['error.retryingStatus']);
});

it('keeps English defaults, renders all overrides and gives explicit props precedence', async () => {
  const user = userEvent.setup();
  const { rerender } = render(<ErrorPanel onRetry={() => {}} />);
  expect(screen.getByRole('heading', { name: 'We couldn’t load deployments' })).toBeVisible();
  expect(
    screen.getByText('The service didn’t respond in time. Your data is safe; try again in a moment.'),
  ).toBeVisible();
  for (const name of ['Contact support', 'Copy request ID', 'Try again', 'Technical details'])
    expect(screen.getByRole('button', { name })).toBeVisible();
  expect(screen.getByText('Request ID')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Copy request ID' }));
  expect(screen.getByRole('button', { name: 'Copied' })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('Request ID copied');
  rerender(<ErrorPanel onRetry={() => {}} retrying />);
  expect(screen.getByRole('button', { name: 'Retrying…' })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('Retrying');
  const labels: ErrorPanelLabels = {
    title: 'Title override',
    message: 'Message override',
    support: 'Support override',
    retry: 'Retry override',
    retrying: 'Busy override',
    retryingStatus: 'Busy status override',
    requestId: 'ID override',
    copyRequestId: 'Copy override',
    copied: 'Copied override',
    requestIdCopied: 'Copied status override',
    details: 'Details override',
  };
  const view = (overrides: Partial<ErrorPanelLabels>, retrying = false, explicit = false) => (
    <I18nProvider locale="es">
      <ErrorPanel
        labels={overrides}
        retrying={retrying}
        onRetry={() => {}}
        title={explicit ? 'Explicit title' : undefined}
        message={explicit ? 'Explicit message' : undefined}
        retryLabel={explicit ? 'Explicit retry' : undefined}
        secondaryAction={explicit ? { label: 'Explicit support' } : undefined}
      />
    </I18nProvider>
  );
  rerender(view(labels));
  expect(screen.getByRole('heading', { name: labels.title })).toBeVisible();
  expect(screen.getByText(labels.message)).toBeVisible();
  expect(screen.getByText(labels.requestId)).toBeVisible();
  for (const name of [labels.support, labels.retry, labels.details])
    expect(screen.getByRole('button', { name })).toBeVisible();
  await user.click(screen.getByRole('button', { name: labels.copyRequestId }));
  expect(screen.getByRole('button', { name: labels.copied })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(labels.requestIdCopied);
  rerender(view(labels, true));
  expect(screen.getByRole('button', { name: labels.retrying })).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent(labels.retryingStatus);
  rerender(view(labels, false, true));
  expect(screen.getByRole('heading', { name: 'Explicit title' })).toBeVisible();
  expect(screen.getByText('Explicit message')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Explicit retry' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Explicit support' })).toBeVisible();
  rerender(view({ title: 'Only title' }));
  expect(screen.getByText(es['error.message'])).toBeVisible();
  for (const key of ['error.retry', 'error.support', 'error.details'] as const)
    expect(screen.getByRole('button', { name: es[key] })).toBeVisible();
});
