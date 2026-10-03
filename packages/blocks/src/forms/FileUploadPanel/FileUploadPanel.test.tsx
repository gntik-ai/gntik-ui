import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { FileUploadPanel } from './FileUploadPanel';
import { acceptsFile } from './fixtures';

describe('FileUploadPanel', () => {
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
    expect(screen.getByText(/Exceeds the 1000 B limit/)).toBeInTheDocument();
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
