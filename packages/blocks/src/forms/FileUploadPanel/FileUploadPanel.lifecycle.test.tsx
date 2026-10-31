import { I18nProvider } from '@gntik-ai/ui';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { FileUploadPanel, type FileUploadPanelLabels } from './FileUploadPanel';
import ManualForm from './examples/ManualForm';
import AutoCancel from './examples/AutoCancel';

it('keeps the removal-veto toggle name stable as its pressed state changes', () => {
  render(<AutoCancel />);
  const button = screen.getByRole('button', { name: 'Keep files' });
  expect(button).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(button);
  expect(screen.getByRole('button', { name: 'Keep files' })).toHaveAttribute('aria-pressed', 'true');
});

const pick = (container: HTMLElement, files: File[]) =>
  fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files } });

it.each(['en', 'es'])(
  'translates ready, cancel, cancelled and removeFailed and supports labels in %s',
  async (locale) => {
    const onUpload = () => new Promise<void>(() => {});
    const { container, rerender } = render(
      <I18nProvider locale={locale}>
        <FileUploadPanel defaultFiles={[]} uploadMode="manual" />
      </I18nProvider>,
    );
    pick(container, [new File([new Uint8Array(4300)], 'manual.csv')]);
    expect(screen.getByText(locale === 'es' ? '4,2 KB · listo para subir' : '4.2 KB · ready to upload')).toBeVisible();
    rerender(
      <I18nProvider locale={locale}>
        <FileUploadPanel defaultFiles={[]} onUpload={onUpload} />
      </I18nProvider>,
    );
    pick(container, [new File(['x'], 'report.csv')]);
    fireEvent.click(
      screen.getByRole('button', {
        name: locale === 'es' ? 'Cancelar la subida de report.csv' : 'Cancel upload of report.csv',
      }),
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      locale === 'es' ? 'Subida de report.csv cancelada.' : 'Upload of report.csv cancelled.',
    );
    rerender(
      <I18nProvider locale={locale}>
        <FileUploadPanel defaultFiles={[]} onRemove={() => Promise.reject(new Error('Denied'))} />
      </I18nProvider>,
    );
    await act(async () =>
      fireEvent.click(
        screen.getByRole('button', { name: locale === 'es' ? 'Quitar manual.csv' : 'Remove manual.csv' }),
      ),
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      locale === 'es' ? 'No se pudo eliminar manual.csv.' : 'manual.csv could not be removed.',
    );
    const labels: Partial<FileUploadPanelLabels> = {
      ready: (size) => `Ready ${size}`,
      cancel: (name) => `Stop ${name}`,
      cancelled: (name) => `Stopped ${name}`,
      removeFailed: (name) => `Keep ${name}`,
    };
    rerender(
      <I18nProvider locale={locale}>
        <FileUploadPanel labels={labels} onUpload={onUpload} />
      </I18nProvider>,
    );
    expect(screen.getByText(locale === 'es' ? 'Ready 4,2 KB' : 'Ready 4.2 KB')).toBeVisible();
    pick(container, [new File(['x'], 'custom.csv')]);
    fireEvent.click(screen.getByRole('button', { name: 'Stop custom.csv' }));
    expect(screen.getByRole('status')).toHaveTextContent('Stopped custom.csv');
    rerender(
      <I18nProvider locale={locale}>
        <FileUploadPanel labels={labels} onRemove={() => Promise.reject(new Error('Denied'))} />
      </I18nProvider>,
    );
    await act(async () =>
      fireEvent.click(
        screen.getByRole('button', { name: locale === 'es' ? 'Quitar manual.csv' : 'Remove manual.csv' }),
      ),
    );
    expect(screen.getByRole('status')).toHaveTextContent('Keep manual.csv');
  },
);

it('ignores preprocessing that finishes after unmount', async () => {
  let finish!: (file: File) => void;
  const onUpload = vi.fn(() => Promise.resolve());
  const onFilesChange = vi.fn();
  const { container, unmount } = render(
    <FileUploadPanel
      defaultFiles={[]}
      beforeUpload={() =>
        new Promise<File>((resolve) => {
          finish = resolve;
        })
      }
      onUpload={onUpload}
      onFilesChange={onFilesChange}
    />,
  );
  const file = new File(['x'], 'report.csv');
  pick(container, [file]);
  unmount();
  await act(async () => finish(file));
  expect(onUpload).not.toHaveBeenCalled();
  expect(onFilesChange).not.toHaveBeenCalled();
});

it.each(['dark', 'light', 'high_contrast'])(
  'has axe-clean pending, cancelling and pending-removal states in %s',
  async (theme) => {
    document.documentElement.classList.add(theme);
    try {
      const { container, unmount } = render(<ManualForm />);
      pick(container, [new File(['x'], 'report.csv')]);
      await expectNoAxeViolations(container);
      unmount();
      const auto = render(<AutoCancel />);
      await act(async () => pick(auto.container, [new File(['x'], 'auto.csv')]));
      await expectNoAxeViolations(auto.container);
      auto.unmount();
      let finish!: (value: boolean) => void;
      const pending = render(
        <FileUploadPanel
          defaultFiles={[{ id: 'one', name: 'report.csv', size: 1, status: 'pending', progress: 0 }]}
          onRemove={() =>
            new Promise<boolean>((resolve) => {
              finish = resolve;
            })
          }
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: 'Remove report.csv' }));
      expect(screen.getByRole('button', { name: 'Remove report.csv' })).toBeDisabled();
      await expectNoAxeViolations(pending.container);
      await act(async () => finish(false));
    } finally {
      document.documentElement.classList.remove(theme);
    }
  },
);

it('preserves the default fixture removal name and announcement when no upload was started', () => {
  render(<FileUploadPanel />);
  fireEvent.click(screen.getByRole('button', { name: 'Remove events-export.jsonl' }));
  expect(screen.queryByText('events-export.jsonl')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('events-export.jsonl removed.');
});

it('preserves fractional progress display for existing two-argument upload callbacks without list props', () => {
  let report!: (pct: number) => void;
  const file = new File(['x'], 'report.csv');
  const onUpload = vi.fn((picked: File, progress: (pct: number) => void) => {
    expect(picked).toBe(file);
    report = progress;
    return new Promise<void>(() => {});
  });
  const { container } = render(<FileUploadPanel defaultFiles={[]} onUpload={onUpload} />);
  pick(container, [file]);
  act(() => report(41.4));
  expect(screen.getByText('41%')).toBeVisible();
  act(() => report(41.8));
  expect(screen.getByText('42%')).toBeVisible();
});
