import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider, es } from '@gntik-ai/ui';
import { FileUploadPanel, type FileUploadPanelLabels } from './FileUploadPanel';
const files = [{ id: '1', name: 'report.csv', size: 3, progress: 100, status: 'done' as const }];
it('preserves English and translates static copy and parameterised file messages', async () => {
  const { container, rerender } = render(<FileUploadPanel defaultFiles={files} accept=".csv" maxSize={1000} />);
  expect(screen.getByRole('group', { name: 'Upload files' })).toBeVisible();
  expect(screen.getByText('Drag files here or')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Browse files' })).toBeVisible();
  expect(screen.getByText('CSV · max 1 kB per file')).toBeVisible();
  expect(screen.getByRole('list', { name: 'Files' })).toBeVisible();
  expect(screen.getByText('3 B · uploaded')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Remove report.csv' })).toBeVisible();
  rerender(
    <I18nProvider locale="es">
      <FileUploadPanel defaultFiles={files} accept=".csv" maxSize={1000} onUpload={() => Promise.reject(null)} />
    </I18nProvider>,
  );
  expect(screen.getByRole('group', { name: es['upload.label'] })).toBeVisible();
  expect(screen.getByText(es['upload.drop'])).toBeVisible();
  expect(screen.getByRole('button', { name: es['upload.browse'] })).toBeVisible();
  expect(screen.getByText('CSV · máx. 1 kB por archivo')).toBeVisible();
  expect(screen.getByRole('list', { name: es['upload.files'] })).toBeVisible();
  expect(screen.getByText('3 B · subido')).toBeVisible();
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, {
    target: {
      files: [new File(['x'], 'test.csv'), new File(['x'], 'bad.png'), new File(['x'.repeat(2000)], 'large.csv')],
    },
  });
  expect(screen.getByRole('status')).toHaveTextContent('1 archivo añadido. 2 rechazados.');
  expect(screen.getByText('Tipo de archivo no admitido · sin subir')).toBeVisible();
  expect(screen.getByText('Supera el límite de 1 kB · sin subir')).toBeVisible();
  expect(await screen.findByText('Error al subir · sin subir')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('No se pudo subir test.csv.');
  expect(screen.getByRole('button', { name: 'Reintentar test.csv' })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Quitar report.csv' }));
  expect(screen.getByRole('status')).toHaveTextContent('report.csv eliminado.');
});
it.each(['en', 'es'])('uses all label overrides under %s and explicit label/hint first', async (locale) => {
  const labels: FileUploadPanelLabels = {
    label: 'Custom label',
    drop: 'Custom drop',
    browse: 'Custom browse',
    files: 'Custom files',
    failed: 'Custom failure',
    typeRejected: 'Custom type',
    hint: (types, size) => `Custom hint ${types} ${size}`,
    tooLarge: (size) => `Custom large ${size}`,
    done: (name) => `Custom done ${name}`,
    error: (name) => `Custom error ${name}`,
    added: (count) => `Custom added ${count}`,
    rejected: (count) => `Custom rejected ${count}`,
    removed: (name) => `Custom removed ${name}`,
    uploading: (name) => `Custom uploading ${name}`,
    notUploaded: (error) => `Custom not uploaded ${error}`,
    uploaded: (size) => `Custom uploaded ${size}`,
    retry: (name) => `Custom retry ${name}`,
    remove: (name) => `Custom remove ${name}`,
  };
  const { container, rerender } = render(
    <I18nProvider locale={locale}>
      <FileUploadPanel
        labels={labels}
        defaultFiles={files}
        accept=".csv"
        maxSize={1000}
        onUpload={() => Promise.reject(null)}
      />
    </I18nProvider>,
  );
  for (const text of ['Custom label', 'Custom drop', 'Custom hint CSV 1 kB', 'Custom uploaded 3 B'])
    expect(screen.getByText(text)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Custom browse' })).toBeVisible();
  expect(screen.getByRole('list', { name: 'Custom files' })).toBeVisible();
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, {
    target: {
      files: [new File(['x'], 'test.csv'), new File(['x'], 'bad.png'), new File(['x'.repeat(2000)], 'large.csv')],
    },
  });
  expect(screen.getByRole('status')).toHaveTextContent('Custom added 1 Custom rejected 2');
  expect(screen.getByRole('progressbar', { name: 'Custom uploading test.csv' })).toBeVisible();
  expect(screen.getByText('Custom not uploaded Custom type')).toBeVisible();
  expect(screen.getByText('Custom not uploaded Custom large 1 kB')).toBeVisible();
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Custom error test.csv'));
  expect(screen.getByText('Custom not uploaded Custom failure')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Custom retry test.csv' })).toBeVisible();
  await userEvent.click(screen.getByRole('button', { name: 'Custom remove report.csv' }));
  expect(screen.getByRole('status')).toHaveTextContent('Custom removed report.csv');
  rerender(
    <I18nProvider locale={locale}>
      <FileUploadPanel labels={labels} label="Explicit label" hint="Explicit hint" />
    </I18nProvider>,
  );
  expect(screen.getByRole('group', { name: 'Explicit label' })).toBeVisible();
  expect(screen.getByText('Explicit hint')).toBeVisible();
});

it.each(['es', 'en'])('uses translated and custom successful upload announcements under %s', async (locale) => {
  const { container, rerender } = render(
    <I18nProvider locale={locale}>
      <FileUploadPanel defaultFiles={[]} onUpload={() => Promise.resolve()} />
    </I18nProvider>,
  );
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(['x'], 'ready.csv')] } });
  expect(
    screen.getByRole('progressbar', { name: locale === 'es' ? 'Subiendo ready.csv' : 'Uploading ready.csv' }),
  ).toBeVisible();
  await waitFor(() =>
    expect(screen.getByRole('status')).toHaveTextContent(locale === 'es' ? 'ready.csv subido.' : 'ready.csv uploaded.'),
  );
  rerender(
    <I18nProvider locale={locale}>
      <FileUploadPanel
        defaultFiles={[]}
        labels={{ done: (name) => `Custom done ${name}` }}
        onUpload={() => Promise.resolve()}
      />
    </I18nProvider>,
  );
  fireEvent.change(input, { target: { files: [new File(['x'], 'custom.csv')] } });
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Custom done custom.csv'));
});
