import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { expectNoAxeViolations } from '../../test/a11y';
import { StatusTimeline, type StatusEvent } from './StatusTimeline';
import { DEPLOYMENT_EVENTS } from './fixtures';

describe('StatusTimeline', () => {
  it.each(['', 'dark', 'high_contrast'])('has an accessible empty and populated state in theme "%s"', async (theme) => {
    const { container, rerender } = render(
      <div className={theme}>
        <StatusTimeline events={[]} />
      </div>,
    );
    await expectNoAxeViolations(container);
    rerender(
      <div className={theme}>
        <StatusTimeline maxVisible={3} />
      </div>,
    );
    await expectNoAxeViolations(container);
    await userEvent.click(screen.getByRole('button', { name: 'Show 3 earlier events' }));
    await expectNoAxeViolations(container);
  });

  it('localizes default toggle and actor labels while retaining partial message overrides', async () => {
    render(
      <I18nProvider locale="es" messages={{ 'statusTimeline.label': 'Historial' }}>
        <StatusTimeline maxVisible={5} />
      </I18nProvider>,
    );
    expect(screen.getByRole('list', { name: 'Historial' })).toBeInTheDocument();
    expect(screen.getByText('por System')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ver 1 cambio anterior' }));
    expect(screen.getByRole('button', { name: 'Ver menos' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('keeps the singular English toggle default', () => {
    render(<StatusTimeline maxVisible={5} />);
    expect(screen.getByRole('button', { name: 'Show 1 earlier event' })).toBeInTheDocument();
  });

  it('uses consumer labels for empty, populated, collapsed and expanded timelines', async () => {
    const events: StatusEvent[] = [
      {
        id: '1',
        status: 'Activo',
        tone: 'success',
        title: 'Servicio iniciado',
        description: 'Sistema listo.',
        actor: 'Ana',
        at: '2026-01-03T12:00:00Z',
      },
      {
        id: '2',
        status: 'Preparando',
        tone: 'info',
        title: 'Configuración aplicada',
        actor: 'Luis',
        at: '2026-01-02T12:00:00Z',
      },
      {
        id: '3',
        status: 'Creado',
        tone: 'neutral',
        title: 'Servicio creado',
        actor: 'Sistema',
        at: '2026-01-01T12:00:00Z',
      },
    ];
    const labels = {
      label: 'Historial',
      emptyLabel: 'Sin historial de estado',
      showFewerLabel: 'Ver menos',
      showEarlierLabel: (hidden: number) => `Ver ${hidden} cambios anteriores`,
      actorLabel: 'por',
    };
    const { container, rerender } = render(<StatusTimeline {...labels} events={[]} maxVisible={1} />);
    const expectLocalized = () => {
      for (const text of ['Status history', 'Show fewer', 'Show', 'earlier', 'event', 'by ']) {
        expect(container).not.toHaveTextContent(text);
        expect(container.querySelector('[aria-label]')?.getAttribute('aria-label')).not.toContain(text);
      }
    };
    expectLocalized();
    rerender(<StatusTimeline {...labels} events={events} timeFormat="absolute" />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('por Ana')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expectLocalized();
    rerender(<StatusTimeline {...labels} events={events} maxVisible={1} timeFormat="absolute" />);
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expectLocalized();
    await userEvent.click(screen.getByRole('button', { name: 'Ver 2 cambios anteriores' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expectLocalized();
    await userEvent.click(screen.getByRole('button', { name: 'Ver menos' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expectLocalized();
  });

  it('uses the provider locale for the empty state and English without a provider', () => {
    const { rerender } = render(
      <I18nProvider locale="es">
        <StatusTimeline events={[]} />
      </I18nProvider>,
    );
    expect(screen.getByRole('region', { name: 'Historial de estado' })).toHaveTextContent('Sin historial de estado');
    rerender(<StatusTimeline events={[]} />);
    expect(screen.getByRole('region', { name: 'Status history' })).toHaveTextContent('No status history');
  });

  it('shows an accessible empty state without events, sample copy or a toggle', () => {
    const { container } = render(<StatusTimeline events={[]} label="Historial" emptyLabel="Sin historial de estado" maxVisible={2} />);
    expect(screen.getAllByText('Sin historial de estado')).toHaveLength(1);
    const region = screen.getByRole('region', { name: 'Historial' });
    expect(
      within(region).getAllByRole('heading', {
        name: 'Sin historial de estado',
      }),
    ).toHaveLength(1);
    expect(region).toHaveTextContent(/^Sin historial de estado$/);
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.querySelector('time')).toBeNull();
    expect(container.querySelector('[data-tone]')).toBeNull();
    for (const event of DEPLOYMENT_EVENTS) {
      for (const text of [event.status, event.title, event.description, event.actor]) {
        if (text) expect(container).not.toHaveTextContent(text);
      }
    }
  });

  it('renders every event as an ordered list item with a time element', async () => {
    const { container } = render(<StatusTimeline />);
    const list = screen.getByRole('list', { name: 'Status history' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(6);
    expect(container.querySelectorAll('time')).toHaveLength(6);
    await expectNoAxeViolations(container);
  });

  it('collapses older events behind a toggle', async () => {
    render(<StatusTimeline maxVisible={3} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    const toggle = screen.getByRole('button', { name: 'Show 3 earlier events' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'Show fewer' })).toHaveAttribute('aria-expanded', 'true');
  });
});
