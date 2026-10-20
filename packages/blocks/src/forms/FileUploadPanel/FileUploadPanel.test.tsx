import { I18nProvider } from '@gntik-ai/ui';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { FileUploadPanel } from './FileUploadPanel';
import { acceptsFile } from './fixtures';

describe('FileUploadPanel', () => {
  it('shows decimal default limits and provider-localized file sizes', () => {
    render(
      <I18nProvider locale="es">
        <FileUploadPanel defaultFiles={[{ id: 'es', name: 'report.pdf', size: 1536, progress: 100, status: 'done' }]} />
      </I18nProvider>,
    );
    expect(screen.getByText(/25 MB/)).toBeInTheDocument();
    expect(screen.getByText(/1,5 kB/)).toBeInTheDocument();
  });

  it('rejects files above the decimal default limit', () => {
    const onUpload = vi.fn(() => Promise.resolve());
    const { container } = render(<FileUploadPanel defaultFiles={[]} onUpload={onUpload} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const big = new File([new Uint8Array(25_000_001)], 'big.pdf', { type: 'application/pdf' });
    fireEvent.change(input, { target: { files: [big] } });
    expect(screen.getByText(/Exceeds the 25 MB limit/)).toBeInTheDocument();
    expect(onUpload).not.toHaveBeenCalled();
  });

  it('renders the default list', async () => {
    const { container } = render(<FileUploadPanel />);
    expect(screen.getByRole('group', { name: 'Upload files' })).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Uploading events-export.jsonl' })).toBeInTheDocument();
    expect(screen.getByText(/File type not accepted/)).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('uploads accepted files, rejects the rest and removes items', async () => {
    let finish: () => void = () => {};
    const onUpload = vi.fn((_f: File, onProgress: (p: number) => void) => {
      onProgress(40);
      return new Promise<void>((r) => (finish = r));
    });
    const { container } = render(<FileUploadPanel defaultFiles={[]} onUpload={onUpload} maxSize={1000} />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const ok = new File(['a,b'], 'report.csv', { type: 'text/csv' });
    const big = new File(['x'.repeat(2000)], 'big.csv', { type: 'text/csv' });
    const bad = new File(['x'], 'photo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [ok, big, bad] } });
    expect(onUpload).toHaveBeenCalledOnce();
    expect(screen.getByRole('progressbar', { name: 'Uploading report.csv' })).toBeInTheDocument();
    expect(screen.getByText(/Exceeds the 1 kB limit/)).toBeInTheDocument();
    expect(screen.getByText(/File type not accepted/)).toBeInTheDocument();
    await act(async () => finish());
    expect(screen.getByText(/^3 B · uploaded$/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove photo.png' }));
    expect(screen.queryByText('photo.png')).not.toBeInTheDocument();
  });

  it('matches accept lists', () => {
    expect(acceptsFile({ name: 'a.PDF', type: '' }, '.pdf')).toBe(true);
    expect(acceptsFile({ name: 'a.png', type: 'image/png' }, 'image/*')).toBe(true);
    expect(acceptsFile({ name: 'a.png', type: 'image/png' }, '.csv,application/pdf')).toBe(false);
  });
});
