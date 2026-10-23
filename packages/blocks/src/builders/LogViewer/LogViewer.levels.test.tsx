import { render, screen, within } from '@testing-library/react';
import { I18nProvider } from '@gntik-ai/ui';
import { LogViewer } from './LogViewer';
import { makeLogLines } from './fixtures';

it('uses Spanish catalog names for chips and filter options', () => {
  const lines = makeLogLines(20);
  render(
    <I18nProvider locale="es">
      <LogViewer lines={lines} height={600} />
    </I18nProvider>,
  );
  const chips = { debug: 'DEBUG', info: 'INFO', warn: 'AVISO', error: 'ERROR' };
  const options = { debug: 'debug', info: 'info', warn: 'aviso', error: 'error' };
  const rows = screen.getByRole('log').querySelectorAll('[data-slot="log-line"]');
  expect(rows).toHaveLength(20);
  lines.forEach((line, i) => {
    expect(within(rows[i] as HTMLElement).getByText(chips[line.level])).toBeVisible();
  });
  for (const level of ['debug', 'info', 'warn', 'error'] as const) {
    const count = lines.filter((line) => line.level === level).length;
    expect(screen.getByRole('button', { name: `${options[level]}${count}` })).toHaveTextContent(
      `${options[level]}${count}`,
    );
  }
});

it.each([
  [{ debug: 'Trace', info: 'Notice', warn: 'Caution', error: 'Failure' }, ['Trace', 'Notice', 'Caution', 'Failure']],
  [{ warn: 'Caution' }, ['DEBUG', 'INFO', 'Caution', 'ERROR']],
] as const)('renders level overrides verbatim and falls back per level: %j', (levels, expected) => {
  const lines = makeLogLines(10);
  render(
    <I18nProvider locale="es">
      <LogViewer lines={lines} labels={{ levels }} />
    </I18nProvider>,
  );
  for (const [i, level] of (['debug', 'info', 'warn', 'error'] as const).entries()) {
    const line = lines.find((line) => line.level === level)!;
    const row = screen.getByText(line.message).closest('[data-slot="log-line"]') as HTMLElement;
    expect(within(row).getByText(expected[i]!)).toBeVisible();
    const option = levels[level as keyof typeof levels] ?? level;
    expect(
      screen.getByRole('button', {
        name: `${option}${lines.filter((line) => line.level === level).length}`,
      }),
    ).toBeVisible();
  }
});
