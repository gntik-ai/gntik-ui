import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, es } from '@gntik-ai/ui';
import { LogViewer, type LogViewerLabels } from './LogViewer';
import { makeLogLines } from './fixtures';
import { expectNoAxeViolations } from '../../test/a11y';

const lines = makeLogLines(3);

it('localizes log chrome and state changes without translating or changing copied log data', async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider locale="es">
      <LogViewer lines={lines} onSelectLine={() => {}} />
    </I18nProvider>,
  );
  expect(screen.getByRole('heading', { name: es['logViewer.title'] })).toHaveTextContent('Registros');
  expect(screen.getByRole('log')).toHaveAccessibleName(es['logViewer.title']);
  expect(screen.getByRole('group', { name: es['logViewer.levelFilter'] })).toBeVisible();
  const search = screen.getByRole('searchbox', { name: es['logViewer.searchLabel'] });
  expect(search).toHaveAttribute('placeholder', es['logViewer.searchPlaceholder']);
  expect(screen.getByPlaceholderText(es['logViewer.searchPlaceholder'])).toBe(search);
  expect(screen.getByRole('switch', { name: es['logViewer.follow'] })).toBeChecked();
  expect(screen.getByText('3 de 3')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Inspeccionar evento 12:00:00.000' })).toBeVisible();
  for (const line of lines) {
    expect(screen.getByText(line.message)).toBeVisible();
    expect(screen.getAllByText(line.level.toUpperCase())[0]).toBeVisible();
  }
  await user.click(screen.getByRole('button', { name: 'Copiar línea 12:00:00.000' }));
  expect(screen.getByRole('button', { name: es['common.copied'] })).toBeVisible();
  expect(await navigator.clipboard.readText()).toBe('12:00:00.000 INFO [api] GET /v1/projects 200 in 42ms');
  await user.type(search, 'no-match');
  expect(screen.getByText('0 de 3')).toBeVisible();
  expect(screen.getByText(es['logViewer.empty'])).toBeVisible();
  expect(document.body.textContent).not.toContain('{');
  await expectNoAxeViolations();
});

it('keeps English defaults byte-identical without a provider', () => {
  const { rerender } = render(<LogViewer lines={lines} onSelectLine={() => {}} />);
  expect(screen.getByRole('heading', { name: 'Logs' })).toBeVisible();
  expect(screen.getByRole('group', { name: 'Log levels' })).toBeVisible();
  expect(screen.getByRole('searchbox', { name: 'Search logs' })).toHaveAttribute('placeholder', 'Search…');
  expect(screen.getByRole('switch', { name: 'Follow' })).toBeVisible();
  expect(screen.getByText('3 of 3')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Copy line 12:00:00.000' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Inspect event 12:00:00.000' })).toBeVisible();
  rerender(<LogViewer lines={[]} />);
  expect(screen.getByText('No lines match the current filters.')).toBeVisible();
});

it('renders every override verbatim, falls back per key, and gives title precedence', async () => {
  const user = userEvent.setup();
  const labels: LogViewerLabels = {
    title: 'Custom logs',
    levelFilter: 'Custom levels',
    searchLabel: 'Custom search',
    searchPlaceholder: 'Custom placeholder',
    follow: 'Custom follow',
    count: (visible, total) => `${visible}/${total} custom`,
    empty: 'Custom empty',
    inspect: (timestamp) => `Inspect: ${timestamp}`,
    copy: (timestamp) => `Copy: ${timestamp}`,
    copied: 'Custom copied',
  };
  const view = (overrides: Partial<LogViewerLabels>, title?: string) => (
    <I18nProvider locale="es">
      <LogViewer lines={lines} labels={overrides} title={title} onSelectLine={() => {}} />
    </I18nProvider>
  );
  const { rerender } = render(view(labels));
  expect(screen.getByRole('heading', { name: labels.title })).toBeVisible();
  expect(screen.getByRole('group', { name: labels.levelFilter })).toBeVisible();
  expect(screen.getByRole('searchbox', { name: labels.searchLabel })).toHaveAttribute(
    'placeholder',
    labels.searchPlaceholder,
  );
  expect(screen.getByRole('switch', { name: labels.follow })).toBeVisible();
  expect(screen.getByText('3/3 custom')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Inspect: 12:00:00.000' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Copy: 12:00:00.000' }));
  expect(screen.getByRole('button', { name: labels.copied })).toBeVisible();
  await user.type(screen.getByRole('searchbox'), 'no-match');
  expect(screen.getByText(labels.empty)).toBeVisible();
  rerender(view({ title: 'Override' }, 'Explicit title'));
  expect(screen.getByRole('heading', { name: 'Explicit title' })).toBeVisible();
  expect(screen.getByRole('switch', { name: es['logViewer.follow'] })).toBeVisible();
  expect(screen.getByText(es['logViewer.empty'])).toBeVisible();
});
