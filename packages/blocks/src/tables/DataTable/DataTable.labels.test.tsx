import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@gntik-ai/ui';
import { DataTable } from './DataTable';
import type { DataTableLabels } from './labels';

const rows = [
  { id: 'a', name: 'Alpha', region: 'West' },
  { id: 'b', name: 'Beta', region: 'West' },
];
const columns = [
  { id: 'name', header: 'Name', accessor: (r: (typeof rows)[number]) => r.name, width: 200 },
  { id: 'region', header: 'Region', accessor: (r: (typeof rows)[number]) => r.region, width: 160 },
];
const labels = {
  scrollRegion: 'Tabla con desplazamiento',
  columns: 'Columnas',
  visibleColumns: 'Columnas visibles',
  pinColumns: 'Fijar columnas',
  pinnedLeft: 'Izquierda',
  pinnedRight: 'Derecha',
  pinLeft: 'Fijar izquierda',
  pinRight: 'Fijar derecha',
  unpinned: 'Sin fijar',
  density: 'Densidad',
  comfortable: 'Cómoda',
  compact: 'Compacta',
  defaultView: 'Vista predeterminada',
  defaultViewOption: 'Sin vista',
  modified: '(modificada)',
  views: 'Vistas',
  saveChanges: 'Guardar cambios',
  saveAs: 'Guardar como…',
  renameView: 'Renombrar vista…',
  deleteView: 'Eliminar vista',
  resetChanges: 'Restablecer cambios',
  saveViewTitle: 'Nueva vista',
  renameViewTitle: 'Cambiar nombre',
  viewName: 'Nombre de vista',
  cancel: 'Cancelar',
  saveView: 'Guardar vista',
  rename: 'Renombrar',
  closeDialog: 'Cerrar diálogo',
  selectionCount: vi.fn((n: number) => `${n} seleccionadas`),
  selectAll: 'Seleccionar página',
  selection: 'Selección',
  actions: 'Acciones',
  selectRow: vi.fn((name: string) => `Seleccionar ${name}`),
  rowActions: vi.fn((name: string) => `Acciones de ${name}`),
  resizeColumn: vi.fn((name: string) => `Cambiar ancho de ${name}`),
  columnWidth: vi.fn((width: number) => `${width} píxeles`),
} satisfies Partial<DataTableLabels>;

it('replaces table menus, selection announcements, resize names and saved-view dialogs', async () => {
  const user = userEvent.setup();
  const { container } = render(
    <DataTable
      rows={rows}
      columns={columns}
      caption="Items"
      paginated={false}
      resizable
      showPinMenu
      defaultViews={[]}
      labels={labels}
      rowActions={() => [{ label: 'Inspect', onClick: () => {} }]}
    />,
  );
  expect(screen.getByRole('group', { name: 'Densidad' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Compacta' }));
  await user.click(screen.getByRole('button', { name: 'Cómoda' }));
  expect(screen.getByRole('checkbox', { name: 'Seleccionar página' })).toBeVisible();
  await user.click(screen.getByRole('checkbox', { name: 'Seleccionar Alpha' }));
  expect(container.querySelector('[aria-live]')?.textContent).toBe('1 seleccionadas');
  expect(labels.selectionCount).toHaveBeenLastCalledWith(1);
  expect(labels.selectRow).toHaveBeenCalledWith('Alpha');
  expect(screen.getByRole('button', { name: 'Acciones de Alpha' })).toBeVisible();
  const handle = screen.getByRole('separator', { name: 'Cambiar ancho de Name' });
  expect(handle).toHaveAttribute('aria-valuetext', '200 píxeles');
  expect(labels.resizeColumn).toHaveBeenCalledWith('Name');
  expect(labels.columnWidth).toHaveBeenCalledWith(200);
  await user.click(screen.getByRole('button', { name: 'Columnas' }));
  expect(await screen.findByText('Columnas visibles')).toBeVisible();
  expect(screen.getByText('Fijar columnas')).toBeVisible();
  await user.click(screen.getByRole('menuitemcheckbox', { name: 'Region' }));
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('button', { name: 'Vista predeterminada (modificada)' }));
  expect(await screen.findByText('Vistas', { exact: true })).toBeVisible();
  expect(screen.getByRole('menuitemradio', { name: 'Sin vista' })).toBeVisible();
  for (const name of ['Guardar cambios', 'Renombrar vista…', 'Eliminar vista', 'Restablecer cambios'])
    expect(screen.getByRole('menuitem', { name })).toBeVisible();
  await user.click(screen.getByRole('menuitem', { name: 'Guardar como…' }));
  expect(await screen.findByRole('dialog', { name: 'Nueva vista' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Cerrar diálogo' })).toBeVisible();
  await user.type(screen.getByRole('textbox', { name: 'Nombre de vista' }), 'My view');
  await user.click(screen.getByRole('button', { name: 'Guardar vista' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await user.click(screen.getByRole('button', { name: 'My view' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Renombrar vista…' }));
  expect(await screen.findByRole('dialog', { name: 'Cambiar nombre' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Renombrar' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Cancelar' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
});

it('replaces group counts, ungrouped names, empty and loading states, and the nested footer', async () => {
  const selectGroup = vi.fn((name: string) => `Todo en ${name}`);
  const groupRows = vi.fn((count: number) => `filas: ${count}`);
  const loading = vi.fn((caption: string) => `Cargando ${caption}`);
  const extra: Partial<DataTableLabels> = {
    selectGroup,
    groupRows,
    noGroup: 'Sin grupo',
    emptyTitle: 'Sin resultados',
    emptyDescription: 'Cambie los filtros',
    loading,
    rowsPerPage: 'Filas',
    rowsPerPageLabel: 'Por página',
    rangeSummary: (a, b, n) => `${a}/${b}/${n}`,
    paginationNav: (noun) => `Páginas de ${noun}`,
    previous: 'Atrás',
    next: 'Adelante',
    page: (n) => `Ir a ${n}`,
  };
  const { rerender } = render(
    <DataTable rows={rows} columns={columns} groupBy={() => ''} labels={extra} caption="Items" />,
  );
  expect(screen.getByRole('checkbox', { name: 'Todo en Sin grupo' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Sin grupo 2 filas: 2' })).toBeVisible();
  expect(selectGroup).toHaveBeenCalledWith('Sin grupo');
  expect(groupRows).toHaveBeenCalledWith(2);
  expect(screen.getByRole('navigation', { name: 'Páginas de Items' })).toBeVisible();
  expect(screen.getByRole('combobox', { name: 'Por página' })).toBeVisible();
  expect(screen.getByText('1/2/2')).toBeVisible();
  rerender(<DataTable rows={[]} columns={columns} labels={extra} caption="Items" />);
  expect(screen.getByText('Sin resultados')).toBeVisible();
  expect(screen.getByText('Cambie los filtros')).toBeVisible();
  rerender(<DataTable rows={rows} columns={columns} labels={extra} caption="Items" loading />);
  expect(screen.getByRole('status').textContent).toBe('Cargando Items');
  expect(loading).toHaveBeenCalledWith('Items');
});

it('replaces built-in inline editor names, hints and validation errors', async () => {
  const user = userEvent.setup();
  const editLabel = vi.fn((column: string, row: string) => `${column} de ${row}`);
  const minimumValue = vi.fn((n: number) => `Mínimo ${n}`);
  const maximumValue = vi.fn((n: number) => `Máximo ${n}`);
  const editable = [
    {
      id: 'name',
      header: 'Name',
      accessor: (r: (typeof rows)[number]) => r.name,
      editable: true,
      editor: { type: 'number' as const, min: 1, max: 10 },
    },
  ];
  render(
    <DataTable
      rows={rows}
      columns={editable}
      paginated={false}
      onCellEdit={() => false}
      labels={{
        editHint: 'Pulse Intro para editar',
        editLabel,
        editError: 'No se guardó',
        enterNumber: 'Escriba un número',
        minimumValue,
        maximumValue,
      }}
    />,
  );
  expect(screen.getByRole('button', { name: 'Alpha' })).toHaveAccessibleDescription('Pulse Intro para editar');
  await user.click(screen.getByRole('button', { name: 'Alpha' }));
  const input = screen.getByRole('spinbutton', { name: 'Name de Alpha' });
  expect(editLabel).toHaveBeenCalledWith('Name', 'Alpha');
  await user.clear(input);
  await user.type(input, '0{Enter}');
  expect(await screen.findByRole('alert')).toHaveTextContent('Mínimo 1');
  expect(minimumValue).toHaveBeenCalledWith(1);
  await user.clear(input);
  await user.type(input, '11{Enter}');
  expect(screen.getByRole('alert')).toHaveTextContent('Máximo 10');
  expect(maximumValue).toHaveBeenCalledWith(10);
  await user.clear(input);
  await user.type(input, '5{Enter}');
  expect(await screen.findByText('No se guardó')).toBeVisible();
});

it('keeps provider translations and legacy literals under a partial override', () => {
  const { container, rerender } = render(
    <I18nProvider locale="es">
      <DataTable rows={rows} columns={columns} paginated={false} defaultViews={[]} defaultSelectedIds={['a']} />
    </I18nProvider>,
  );
  const table = container.querySelector('table')?.outerHTML;
  const groupName = screen.getByRole('group').getAttribute('aria-label');
  rerender(
    <I18nProvider locale="es">
      <DataTable
        rows={rows}
        columns={columns}
        paginated={false}
        defaultViews={[]}
        defaultSelectedIds={['a']}
        labels={{ defaultView: 'Custom view' }}
      />
    </I18nProvider>,
  );
  expect(container.querySelector('table')?.outerHTML).toBe(table);
  expect(screen.getByRole('group')).toHaveAttribute('aria-label', groupName);
  expect(screen.getByRole('button', { name: 'Custom view' })).toBeVisible();
  expect(screen.getByText('1 selected')).toBeVisible();
});

it('retains the published text-node boundaries for default selection and loading summaries', () => {
  const { container, rerender } = render(
    <DataTable rows={rows} columns={columns} defaultSelectedIds={['a']} paginated={false} caption="Items" />,
  );
  expect([...container.querySelector('[aria-live]')!.childNodes].map((node) => node.textContent)).toEqual([
    '1',
    ' selected',
  ]);
  rerender(<DataTable rows={rows} columns={columns} loading caption="Items" />);
  expect([...screen.getByRole('status').childNodes].map((node) => node.textContent)).toEqual([
    'Loading ',
    'items',
    '…',
  ]);
});

it('replaces every pin option and the single-selection heading without translating caller radio names', async () => {
  const user = userEvent.setup({ pointerEventsCheck: 0 });
  const full: DataTableLabels = {
    ...labels,
    pageSelected: (count) => `Página seleccionada: ${count}`,
    selectAllMatching: (count) => `Seleccionar coincidencias: ${count}`,
    allMatchingSelected: (count) => `Coincidencias seleccionadas: ${count}`,
    clearSelection: 'Borrar selección',
    booleanTrue: 'Sí',
    booleanFalse: 'No',
    selectGroup: (group) => `Grupo ${group}`,
    groupRows: (count) => `${count} filas`,
    noGroup: 'Sin grupo',
    emptyTitle: 'Vacío',
    emptyDescription: 'Sin coincidencias',
    loading: (caption) => `Cargando ${caption}`,
    editHint: 'Editar',
    editLabel: (column, row) => `${column} de ${row}`,
    editError: 'Error al guardar',
    enterNumber: 'Número requerido',
    minimumValue: (min) => `Mínimo ${min}`,
    maximumValue: (max) => `Máximo ${max}`,
    rowsPerPage: 'Filas por página',
    rowsPerPageLabel: 'Elegir tamaño',
    rangeSummary: (from, to, total) => `${from}|${to}|${total}`,
    paginationNav: (noun) => `Páginas de ${noun}`,
    previous: 'Anterior',
    next: 'Siguiente',
    page: (n) => `Página ${n}`,
  };
  const { rerender } = render(
    <I18nProvider locale="es">
      <DataTable rows={rows} columns={columns} paginated={false} showPinMenu labels={full} />
    </I18nProvider>,
  );
  await user.click(screen.getByRole('button', { name: 'Columnas' }));
  const submenu = await screen.findByRole('menuitem', { name: 'Name' });
  act(() => submenu.focus());
  await user.keyboard('{ArrowRight}');
  for (const name of ['Fijar izquierda', 'Fijar derecha', 'Sin fijar'])
    expect(await screen.findByRole('menuitemradio', { name })).toBeVisible();
  await user.click(screen.getByRole('menuitemradio', { name: 'Fijar izquierda' }));
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  await waitFor(() => expect(document.querySelector('[data-base-ui-focus-guard]')).toBeNull());
  await user.click(screen.getByRole('button', { name: 'Columnas' }));
  await screen.findByRole('menu');
  expect(await screen.findByRole('menuitem', { name: /Name.*Izquierda/ })).toHaveAccessibleName('NameIzquierda');
  act(() => screen.getByRole('menuitem', { name: /Name.*Izquierda/ }).focus());
  await user.keyboard('{ArrowRight}');
  await user.click(await screen.findByRole('menuitemradio', { name: 'Fijar derecha' }));
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  await waitFor(() => expect(document.querySelector('[data-base-ui-focus-guard]')).toBeNull());
  await user.click(screen.getByRole('button', { name: 'Columnas' }));
  expect(await screen.findByRole('menuitem', { name: /Name.*Derecha/ })).toBeVisible();
  await user.keyboard('{Escape}');
  await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  await waitFor(() => expect(document.querySelector('[data-base-ui-focus-guard]')).toBeNull());
  rerender(
    <I18nProvider locale="es">
      <DataTable rows={rows} columns={columns} labels={full} selectionMode="single" legend="Items" />
    </I18nProvider>,
  );
  expect(screen.getByRole('columnheader', { name: 'Selección' })).toBeInTheDocument();
  expect(screen.getByRole('radio', { name: 'Alpha' })).toBeVisible();
  expect(screen.queryByRole('radio', { name: 'Seleccionar Alpha' })).toBeNull();
});

it.each([
  [
    'en-US',
    'All 10 rows on this page are selected.',
    'Select all 12,345 rows',
    'All 12,345 rows are selected.',
    'Clear selection',
  ],
  [
    'es-MX',
    'Las 10 filas de esta página están seleccionadas.',
    'Seleccionar las 12,345 filas',
    'Las 12,345 filas están seleccionadas.',
    'Borrar selección',
  ],
])(
  'translates matching selection with provider-formatted counts in %s',
  async (locale, pageText, action, allText, clear) => {
    const user = userEvent.setup();
    const records = Array.from({ length: 10 }, (_, i) => ({ id: String(i), name: `Item ${i}`, region: 'West' }));
    render(
      <I18nProvider locale={locale}>
        <DataTable
          rows={records}
          columns={columns}
          paginationMode="server"
          page={1}
          pageSize={10}
          rowCount={12345}
          selectAllMatching
          onSelectionModelChange={() => {}}
        />
      </I18nProvider>,
    );
    await user.click(
      screen.getByRole('checkbox', {
        name: locale === 'en-US' ? 'Select all rows on this page' : 'Seleccionar todas las filas de esta página',
      }),
    );
    expect(screen.getByText(pageText!)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: action }));
    expect(screen.getByText(allText!)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: clear })).toHaveFocus();
  },
);

it('overrides every matching-selection string through labels', async () => {
  const user = userEvent.setup();
  render(
    <DataTable
      rows={rows}
      columns={columns}
      defaultPageSize={1}
      selectAllMatching
      labels={{
        pageSelected: (n) => `Page picked: ${n}`,
        selectAllMatching: (n) => `Pick matches: ${n}`,
        allMatchingSelected: (n) => `Matches picked: ${n}`,
        clearSelection: 'Clear picks',
      }}
    />,
  );
  await user.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
  expect(screen.getByText('Page picked: 1')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Pick matches: 2' }));
  expect(screen.getByText('Matches picked: 2')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Clear picks' }));
  expect(screen.queryByText('Matches picked: 2')).toBeNull();
});
