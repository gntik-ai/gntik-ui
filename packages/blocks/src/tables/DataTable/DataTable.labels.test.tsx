import { I18nProvider } from '@gntik-ai/ui';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from './DataTable';

const rows = [
  { id: 'a', name: 'Alpha', region: '' },
  { id: 'b', name: 'Beta', region: '' },
];
const columns = [
  { id: 'name', header: 'Name', accessor: (r: (typeof rows)[number]) => r.name },
  { id: 'region', header: 'Region', accessor: (r: (typeof rows)[number]) => r.region },
];

describe('DataTable labels at the rendered block boundary', () => {
  it('replaces edit hints, editor names and built-in validation errors', async () => {
    const user = userEvent.setup();
    const editLabel = vi.fn((column: string, row: string) => `<editar ${column}/${row}>`);
    const minNumber = vi.fn((min: number) => `<mínimo ${min}>`);
    const maxNumber = vi.fn((max: number) => `<máximo ${max}>`);
    render(
      <DataTable
        rows={[{ id: 'one', count: 7 }]}
        columns={[
          {
            id: 'count',
            header: 'Count',
            accessor: (r) => r.count,
            editable: true,
            editor: { type: 'number', min: 5, max: 10 },
          },
        ]}
        getRowLabel={() => 'One'}
        onCellEdit={() => false}
        labels={{
          status: { editHint: 'Pulse para editar', editLabel, saveError: 'No se pudo guardar', minNumber, maxNumber },
        }}
      />,
    );
    const trigger = screen.getByRole('button', { name: '7' });
    expect(trigger).toHaveAccessibleDescription('Pulse para editar');
    trigger.focus();
    await user.keyboard('{F2}');
    const input = screen.getByRole('spinbutton', { name: '<editar Count/One>' });
    expect(editLabel).toHaveBeenCalledWith('Count', 'One');
    await user.clear(input);
    await user.type(input, '2{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('<mínimo 5>');
    expect(minNumber).toHaveBeenCalledWith(5);
    await user.clear(input);
    await user.type(input, '12{Enter}');
    expect(screen.getByRole('alert')).toHaveTextContent('<máximo 10>');
    expect(maxNumber).toHaveBeenCalledWith(10);
    await user.clear(input);
    await user.type(input, '8{Enter}');
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar');
  });

  it('renders selection, grouping, resizing and status formatters with documented arguments', async () => {
    const user = userEvent.setup();
    const selected = vi.fn((count: number) => `<${count} elegidos>`);
    const resize = vi.fn((column: string) => `<ancho ${column}>`);
    const resizeValue = vi.fn((width: number) => `<${width} px>`);
    const group = vi.fn((name: string) => `<grupo ${name}>`);
    const groupRows = vi.fn((count: number) => `<${count} elementos>`);
    const groupCount = vi.fn((count: number) => `<${count} total>`);
    const loading = vi.fn((caption: string) => `<cargando ${caption}>`);
    const labels = {
      selection: {
        selected,
        selectAll: 'Elegir todas',
        row: (name: string) => `<fila ${name}>`,
        group,
        actionsHeading: 'Operaciones',
        rowActions: (name: string) => `<acciones ${name}>`,
      },
      columnMenu: { resize, resizeValue },
      status: {
        caption: 'Ignored caption',
        noGroup: 'Sin grupo',
        groupRows,
        groupCount,
        loading,
        emptyTitle: 'Vacío',
        emptyDescription: 'Sin coincidencias',
      },
      pagination: { nav: 'Navegar', range: (from: number, to: number, total: number) => `<${from}:${to}:${total}>` },
    };
    const { rerender } = render(
      <DataTable
        rows={rows}
        columns={columns}
        caption="Caller caption"
        groupBy="region"
        resizable
        rowActions={() => []}
        labels={labels}
      />,
    );
    expect(screen.getByRole('table', { name: 'Caller caption' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Elegir todas' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '<fila Alpha>' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: '<grupo Sin grupo>' })).toBeInTheDocument();
    expect(group).toHaveBeenCalledWith('Sin grupo');
    expect(groupRows).toHaveBeenCalledWith(2);
    expect(groupCount).toHaveBeenCalledWith(2);
    expect(screen.getByRole('button', { name: 'Sin grupo <2 total> <2 elementos>' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '<acciones Alpha>' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Navegar' })).toBeInTheDocument();
    expect(screen.getByText('<1:2:2>')).toBeInTheDocument();
    const handle = screen.getByRole('separator', { name: '<ancho Name>' });
    expect(resize).toHaveBeenCalledWith('Name');
    expect(handle).toHaveAttribute('aria-valuetext', '<160 px>');
    expect(resizeValue).toHaveBeenCalledWith(160);
    await user.click(screen.getByRole('checkbox', { name: '<fila Alpha>' }));
    expect(screen.getByText('<1 elegidos>')).toHaveAttribute('aria-live', 'polite');
    expect(selected).toHaveBeenCalledWith(1);
    rerender(<DataTable rows={rows} columns={columns} caption="Caller caption" loading labels={labels} />);
    expect(loading).toHaveBeenCalledWith('Caller caption');
    expect(screen.getByRole('status')).toHaveTextContent('<cargando Caller caption>');
    rerender(<DataTable rows={[]} columns={columns} labels={labels} />);
    expect(screen.getByRole('table', { name: 'Ignored caption' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Vacío' })).toBeInTheDocument();
    expect(screen.getByText('Sin coincidencias')).toBeInTheDocument();
  });

  it('merges nested partial labels over Spanish catalog fallbacks', () => {
    render(
      <I18nProvider locale="es">
        <DataTable
          rows={rows}
          columns={columns}
          labels={{ density: { compact: 'Custom compact' }, status: { noGroup: 'Custom group' } }}
        />
      </I18nProvider>,
    );
    expect(screen.getByRole('button', { name: 'Custom compact' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filas holgadas' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Columnas' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Seleccionar Alpha' })).toBeInTheDocument();
  });

  it('replaces column, pin, density and view chrome including dialogs', async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        rows={rows}
        columns={columns}
        showPinMenu
        defaultViews={[{ id: 'one', name: 'First', state: {} }]}
        labels={{
          columnMenu: {
            trigger: 'Columnas',
            visibleColumns: 'Visibles',
            pinColumns: 'Fijar columnas',
            left: 'Izquierda',
            right: 'Derecha',
            pinLeft: 'Fijar izquierda',
            pinRight: 'Fijar derecha',
            unpinned: 'Sin fijar',
          },
          density: { label: 'Densidad', comfortable: 'Cómodas', compact: 'Compactas' },
          views: {
            defaultView: 'Predeterminada',
            modified: '(cambiada)',
            heading: 'Vistas',
            saveChanges: 'Guardar cambios',
            saveAs: 'Crear vista…',
            rename: 'Renombrar vista…',
            delete: 'Eliminar vista',
            reset: 'Restablecer',
            saveTitle: 'Nueva vista',
            renameTitle: 'Otro nombre',
            nameLabel: 'Nombre',
            cancel: 'Cancelar',
            saveButton: 'Guardar',
            renameButton: 'Renombrar',
            close: 'Cerrar',
          },
        }}
      />,
    );
    expect(screen.getByRole('group', { name: 'Densidad' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Compactas' }));
    expect(screen.getByRole('button', { name: 'Compactas' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Columnas' }));
    expect(await screen.findByText('Visibles')).toBeInTheDocument();
    expect(screen.getByText('Fijar columnas')).toBeInTheDocument();
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Region' }));
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryAllByRole('menu')).toHaveLength(0));
    await user.click(screen.getByRole('button', { name: 'Predeterminada (cambiada)' }));
    expect(await screen.findByText('Vistas')).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Crear vista…' }));
    await waitFor(() => expect(screen.queryAllByRole('menu')).toHaveLength(0));
    expect(await screen.findByRole('dialog', { name: 'Nueva vista' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: 'Nombre' }), 'Second');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0));
    await user.click(screen.getByRole('button', { name: 'Second' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Renombrar vista…' }));
    expect(await screen.findByRole('dialog', { name: 'Otro nombre' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Renombrar' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryAllByRole('dialog')).toHaveLength(0));
    await user.click(screen.getByRole('button', { name: 'Second' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Eliminar vista' }));
    await waitFor(() => expect(screen.queryAllByRole('menu')).toHaveLength(0));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Predeterminada (cambiada)' })).toBeInTheDocument();
  });
});
