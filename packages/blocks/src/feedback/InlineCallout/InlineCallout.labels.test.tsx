import { render, screen } from '@testing-library/react';
import { I18nProvider, es } from '@gntik-ai/ui';
import { InlineCallout, type InlineCalloutLabels } from './InlineCallout';

it('localizes built-in callout content and action labels, leaving the href unchanged', () => {
  render(
    <I18nProvider locale="es">
      <InlineCallout />
    </I18nProvider>,
  );
  expect(screen.getByText(es['callout.title'])).toHaveTextContent('Has usado el 92% de tus minutos de compilación');
  expect(screen.getByText(es['callout.description'])).toBeVisible();
  expect(screen.getByRole('button', { name: es['callout.upgrade'] })).toBeVisible();
  expect(screen.getByRole('link', { name: es['callout.viewUsage'] })).toHaveAttribute('href', '#usage');
});

it('preserves English, merges overrides per key and respects explicit content and actions', () => {
  const { rerender } = render(<InlineCallout />);
  expect(screen.getByText('You have used 92% of your build minutes')).toBeVisible();
  expect(
    screen.getByText(
      'Builds will queue once the monthly limit is reached. Upgrade the plan or reduce concurrent builds.',
    ),
  ).toBeVisible();
  expect(screen.getByRole('button', { name: 'Upgrade plan' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'View usage' })).toBeVisible();
  const labels: InlineCalloutLabels = {
    title: 'Title override',
    description: 'Description override',
    upgrade: 'Upgrade override',
    viewUsage: 'Usage override',
  };
  rerender(
    <I18nProvider locale="es">
      <InlineCallout labels={labels} />
    </I18nProvider>,
  );
  expect(screen.getByText(labels.title)).toBeVisible();
  expect(screen.getByText(labels.description)).toBeVisible();
  expect(screen.getByRole('button', { name: labels.upgrade })).toBeVisible();
  expect(screen.getByRole('link', { name: labels.viewUsage })).toBeVisible();
  rerender(
    <I18nProvider locale="es">
      <InlineCallout labels={{ title: 'Only title' }} />
    </I18nProvider>,
  );
  expect(screen.getByText('Only title')).toBeVisible();
  expect(screen.getByText(es['callout.description'])).toBeVisible();
  expect(screen.getByRole('button', { name: es['callout.upgrade'] })).toBeVisible();
  expect(screen.getByRole('link', { name: es['callout.viewUsage'] })).toBeVisible();
  rerender(
    <InlineCallout
      labels={labels}
      title="Explicit title"
      description="Explicit description"
      actions={[{ label: 'Explicit action', href: '#explicit' }]}
    />,
  );
  expect(screen.getByText('Explicit title')).toBeVisible();
  expect(screen.getByText('Explicit description')).toBeVisible();
  expect(screen.getByRole('link', { name: 'Explicit action' })).toHaveAttribute('href', '#explicit');
});
