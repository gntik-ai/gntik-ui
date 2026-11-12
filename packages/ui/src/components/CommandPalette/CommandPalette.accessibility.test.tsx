import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { I18nProvider } from '../../i18n/I18nProvider';
import CommandPaletteAsync from './examples/CommandPaletteAsync';
import CommandPaletteBasic from './examples/CommandPaletteBasic';
import CommandPaletteCustomRows from './examples/CommandPaletteCustomRows';

it('lets keyboard users tab into command results and back to search', async () => {
  const user = userEvent.setup();
  render(<CommandPaletteBasic />);
  await user.click(screen.getByRole('button', { name: /Search or run a command/ }));
  const input = await screen.findByRole('combobox');
  await waitFor(() => expect(input).toHaveFocus());

  await user.tab();
  expect(screen.getByRole('listbox')).toHaveFocus();
  await user.tab({ shift: true });
  expect(input).toHaveFocus();
});

describe.each(['dark', 'light', 'high_contrast'])('async and custom-row examples in %s', (theme) => {
  beforeEach(() => {
    document.documentElement.className = theme;
  });

  it('has no axe violations while loading, with results and after an error', async () => {
    const user = userEvent.setup();
    render(<CommandPaletteAsync />);
    await user.click(screen.getByRole('button', { name: 'Open from a button' }));
    const input = await screen.findByRole('combobox');
    await waitFor(() => expect(input).toHaveFocus());
    await user.type(input, 'agent');
    await waitFor(() => expect(screen.getByRole('listbox')).toHaveAttribute('aria-busy', 'true'));
    await expectNoAxeViolations();
    expect(await screen.findByRole('option', { name: /Support triage/ })).toBeInTheDocument();
    await expectNoAxeViolations();
    await user.clear(input);
    await user.type(input, 'fail');
    expect(await screen.findByRole('option', { name: 'Retry' })).toBeInTheDocument();
    await expectNoAxeViolations();
    await user.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(screen.queryByRole('option', { name: 'Retry' })).not.toBeInTheDocument());
    await expectNoAxeViolations();
  });

  it('has no axe violations with limited custom rows and the limit footer', async () => {
    const user = userEvent.setup();
    render(<CommandPaletteCustomRows />);
    await user.click(screen.getByRole('button', { name: /Search or run a command/ }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getAllByRole('option')).toHaveLength(50);
    expect(within(dialog).getByText('Showing 50 of 120')).toBeInTheDocument();
    await expectNoAxeViolations();
  });
});

it('reads the loading and error strings from the Spanish catalog', async () => {
  const user = userEvent.setup();
  render(
    <I18nProvider locale="es">
      <CommandPaletteAsync />
    </I18nProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Open from a button' }));
  await user.type(await screen.findByRole('combobox'), 'fail');
  await waitFor(() =>
    expect(
      screen
        .getAllByRole('status')
        .map((el) => el.textContent)
        .join(' '),
    ).toContain('Cargando…'),
  );
  expect(await screen.findByText('No se pudieron cargar los resultados.')).toBeInTheDocument();
  expect(screen.getByRole('option', { name: 'Reintentar' })).toBeInTheDocument();
});
