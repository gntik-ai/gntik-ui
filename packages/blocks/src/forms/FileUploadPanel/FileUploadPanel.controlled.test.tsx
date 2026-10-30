import { act, fireEvent, render, screen } from '@testing-library/react';
import { FileUploadPanel, type UploadItem } from './FileUploadPanel';

const pick = (container: HTMLElement, files: File[]) =>
  fireEvent.change(container.querySelector('input[type="file"]')!, { target: { files } });

it('requests a controlled addition with the File and renders only the supplied list', () => {
  const onFilesChange = vi.fn();
  const file = new File(['a'], 'report.csv');
  const onUpload = vi.fn<(file: File) => Promise<void>>(() => new Promise<void>(() => {}));
  const { container, rerender } = render(
    <FileUploadPanel files={[]} onFilesChange={onFilesChange} onUpload={onUpload} />,
  );
  pick(container, [file]);
  expect(onFilesChange).toHaveBeenCalledTimes(1);
  const [items, change] = onFilesChange.mock.calls[0]!;
  expect(change).toEqual({ reason: 'add', ids: [items[0].id] });
  expect(items[0]).toMatchObject({ status: 'uploading', file });
  expect(items[0].file).toBe(file);
  expect(screen.queryByText('report.csv')).not.toBeInTheDocument();
  rerender(<FileUploadPanel files={items} onFilesChange={onFilesChange} onUpload={onUpload} />);
  expect(screen.getByText('report.csv')).toBeVisible();
});

it('reports only whole-percent changes and completion from the current controlled prop', async () => {
  let progress!: (pct: number) => void;
  let finish!: () => void;
  const onUpload = vi.fn((_file: File, report: (pct: number) => void) => {
    progress = report;
    return new Promise<void>((resolve) => {
      finish = resolve;
    });
  });
  const onFilesChange = vi.fn();
  const { container, rerender } = render(
    <FileUploadPanel files={[]} onFilesChange={onFilesChange} onUpload={onUpload} />,
  );
  pick(container, [new File(['x'], 'report.csv')]);
  const added: UploadItem[] = onFilesChange.mock.calls[0]![0];
  rerender(
    <FileUploadPanel
      files={[...added, { id: 'existing', name: 'old.csv', size: 1, status: 'done', progress: 100 }]}
      onFilesChange={onFilesChange}
      onUpload={onUpload}
    />,
  );
  act(() => {
    progress(40);
    progress(41.4);
    progress(41.8);
  });
  const updates = onFilesChange.mock.calls.filter(([, change]) => change.reason === 'progress');
  expect(updates.map(([items]) => items[0].progress)).toEqual([40, 41]);
  expect(updates[0]![0][1].name).toBe('old.csv');
  await act(async () => finish());
  expect(onFilesChange.mock.lastCall).toEqual([
    [expect.objectContaining({ status: 'done', progress: 100 }), expect.objectContaining({ id: 'existing' })],
    { reason: 'done', ids: [added[0]!.id] },
  ]);
});

it('keeps manual files pending and available for submission without starting uploads', () => {
  const onUpload = vi.fn(() => Promise.resolve());
  const onFilesChange = vi.fn();
  const first = new File([new Uint8Array(4300)], 'report.csv');
  const second = new File(['x'], 'other.csv');
  const { container } = render(
    <FileUploadPanel defaultFiles={[]} uploadMode="manual" onFilesChange={onFilesChange} onUpload={onUpload} />,
  );
  pick(container, [first, second]);
  expect(screen.getAllByText(/ready to upload/)).toHaveLength(2);
  expect(screen.getByText('4.2 KB · ready to upload')).toBeVisible();
  expect(onUpload).not.toHaveBeenCalled();
  expect(onFilesChange.mock.lastCall![0]).toEqual([
    expect.objectContaining({ file: first, status: 'pending', progress: 0 }),
    expect.objectContaining({ file: second, status: 'pending', progress: 0 }),
  ]);
});

it('settles preprocessing in pick order, drops false, replaces files and keeps errors without retry', async () => {
  let transform!: (file: File) => void;
  const replacement = new File(['image'], 'photo.webp');
  const beforeUpload = vi.fn((file: File) => {
    if (file.name === 'notes.txt') return false;
    if (file.name === 'broken.csv') return Promise.reject(new Error('Checksum mismatch'));
    return new Promise<File>((resolve) => {
      transform = resolve;
    });
  });
  const onUpload = vi.fn<(file: File) => Promise<void>>(() => new Promise<void>(() => {}));
  const onFilesChange = vi.fn();
  const { container } = render(
    <FileUploadPanel
      accept=""
      defaultFiles={[]}
      beforeUpload={beforeUpload}
      onUpload={onUpload}
      onFilesChange={onFilesChange}
    />,
  );
  pick(container, [new File(['x'], 'photo.png'), new File(['x'], 'notes.txt'), new File(['x'], 'broken.csv')]);
  expect(screen.getByRole('group')).toHaveAttribute('aria-busy', 'true');
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
  await act(async () => transform(replacement));
  expect(screen.getByRole('group')).not.toHaveAttribute('aria-busy');
  expect(screen.getAllByRole('listitem').map((row) => row.textContent)).toEqual([
    expect.stringContaining('photo.webp'),
    expect.stringContaining('Checksum mismatch · not uploaded'),
  ]);
  expect(screen.queryByText('notes.txt')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Retry/ })).not.toBeInTheDocument();
  expect(onUpload.mock.calls[0]![0]).toBe(replacement);
  expect(onFilesChange.mock.calls[0]![0][0].file).toBe(replacement);
});

it.each(['resolve', 'reject'] as const)('cancels the attempt and ignores late progress and %s', async (settle) => {
  let finish!: () => void;
  let fail!: (error: Error) => void;
  let report!: (pct: number) => void;
  let signal!: AbortSignal;
  const onFilesChange = vi.fn();
  const { container } = render(
    <FileUploadPanel
      defaultFiles={[]}
      onFilesChange={onFilesChange}
      onUpload={(_file, progress, context) => {
        signal = context.signal;
        report = progress;
        return new Promise<void>((resolve, reject) => {
          finish = resolve;
          fail = reject;
        });
      }}
    />,
  );
  pick(container, [new File(['x'], 'report.csv')]);
  fireEvent.click(screen.getByRole('button', { name: 'Cancel upload of report.csv' }));
  expect(signal.aborted).toBe(true);
  expect(screen.queryByText('report.csv')).not.toBeInTheDocument();
  expect(onFilesChange.mock.lastCall![1].reason).toBe('cancel');
  expect(screen.getByRole('status')).toHaveTextContent('Upload of report.csv cancelled.');
  onFilesChange.mockClear();
  await act(async () => {
    report(80);
    if (settle === 'resolve') finish();
    else fail(new DOMException('Aborted', 'AbortError'));
  });
  expect(onFilesChange).not.toHaveBeenCalled();
  expect(screen.queryByText('report.csv')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Upload of report.csv cancelled.');
});

it('aborts in-flight uploads on unmount', async () => {
  let signal!: AbortSignal;
  let finish!: () => void;
  const onFilesChange = vi.fn();
  const { container, unmount } = render(
    <FileUploadPanel
      defaultFiles={[]}
      onFilesChange={onFilesChange}
      onUpload={(_file, _progress, context) => {
        signal = context.signal;
        return new Promise<void>((resolve) => {
          finish = resolve;
        });
      }}
    />,
  );
  pick(container, [new File(['x'], 'report.csv')]);
  unmount();
  expect(signal.aborted).toBe(true);
  onFilesChange.mockClear();
  await act(async () => finish());
  expect(onFilesChange).not.toHaveBeenCalled();
});

it('calls onRemove before removal, supports a synchronous veto and preserves focus', () => {
  const item: UploadItem = { id: 'one', name: 'report.csv', size: 1, progress: 100, status: 'done' };
  const onRemove = vi.fn(() => {
    expect(screen.getByText('report.csv')).toBeVisible();
    return false;
  });
  const onFilesChange = vi.fn();
  const { rerender } = render(
    <FileUploadPanel defaultFiles={[item]} onRemove={onRemove} onFilesChange={onFilesChange} />,
  );
  const button = screen.getByRole('button', { name: 'Remove report.csv' });
  button.focus();
  fireEvent.click(button);
  expect(onRemove).toHaveBeenCalledWith(item);
  expect(screen.getByText('report.csv')).toBeVisible();
  expect(button).toHaveFocus();
  expect(onFilesChange).not.toHaveBeenCalled();
  rerender(<FileUploadPanel defaultFiles={[item]} onRemove={() => undefined} onFilesChange={onFilesChange} />);
  fireEvent.click(button);
  expect(screen.queryByText('report.csv')).not.toBeInTheDocument();
  expect(onFilesChange.mock.lastCall![1]).toEqual({ reason: 'remove', ids: ['one'] });
});

it.each(['veto', 'reject', 'allow'] as const)(
  'disables removal while pending and handles async %s',
  async (outcome) => {
    let finish!: (value: boolean | void) => void;
    let fail!: () => void;
    const onFilesChange = vi.fn();
    const { rerender } = render(
      <FileUploadPanel
        files={[{ id: 'one', name: 'report.csv', size: 1, progress: 100, status: 'done' }]}
        onFilesChange={onFilesChange}
        onRemove={() =>
          new Promise((resolve, reject) => {
            finish = resolve;
            fail = () => reject(new Error('No permission'));
          })
        }
      />,
    );
    const button = screen.getByRole('button', { name: 'Remove report.csv' });
    fireEvent.click(button);
    expect(button).toBeDisabled();
    // Retain an unrelated new row while the removal is awaiting approval.
    rerender(
      <FileUploadPanel
        files={[
          { id: 'one', name: 'report.csv', size: 1, progress: 100, status: 'done' },
          { id: 'two', name: 'other.csv', size: 1, progress: 100, status: 'done' },
        ]}
        onFilesChange={onFilesChange}
      />,
    );
    await act(async () => {
      if (outcome === 'reject') fail();
      else finish(outcome === 'veto' ? false : undefined);
    });
    expect(screen.getByText('other.csv')).toBeVisible();
    expect(button).not.toBeDisabled();
    if (outcome === 'reject') expect(screen.getByRole('status')).toHaveTextContent('report.csv could not be removed.');
    if (outcome !== 'allow') {
      expect(screen.getByText('report.csv')).toBeVisible();
      expect(onFilesChange).not.toHaveBeenCalled();
    } else
      expect(onFilesChange.mock.lastCall).toEqual([
        [expect.objectContaining({ id: 'two' })],
        { reason: 'remove', ids: ['one'] },
      ]);
  },
);

it('retries a failed controlled upload with a fresh signal and the same id', async () => {
  const attempts: Array<{ signal: AbortSignal; id: string }> = [];
  const onUpload = vi.fn(
    (_file: File, _progress: (pct: number) => void, context: { signal: AbortSignal; id: string }) => {
      attempts.push(context);
      return Promise.reject(new Error('Offline'));
    },
  );
  const onFilesChange = vi.fn();
  const { container, rerender } = render(
    <FileUploadPanel files={[]} onFilesChange={onFilesChange} onUpload={onUpload} />,
  );
  const file = new File(['x'], 'report.csv');
  pick(container, [file]);
  const added = onFilesChange.mock.calls[0]![0];
  rerender(<FileUploadPanel files={added} onFilesChange={onFilesChange} onUpload={onUpload} />);
  await act(async () => {});
  const [failed, change] = onFilesChange.mock.lastCall!;
  expect(change).toEqual({ reason: 'error', ids: [added[0].id] });
  expect(failed[0]).toMatchObject({ error: 'Offline', status: 'error', file });
  rerender(<FileUploadPanel files={failed} onFilesChange={onFilesChange} onUpload={onUpload} />);
  fireEvent.click(screen.getByRole('button', { name: 'Retry report.csv' }));
  expect(attempts[1]!.id).toBe(attempts[0]!.id);
  expect(attempts[1]!.signal).not.toBe(attempts[0]!.signal);
  expect(attempts[1]!.signal.aborted).toBe(false);
  await act(async () => {});
});

it('counts only accepted non-dropped files and skips preprocessing built-in rejections', async () => {
  const beforeUpload = vi.fn((file: File) => file.name !== 'notes.txt');
  const { container } = render(
    <FileUploadPanel accept=".csv,.txt" defaultFiles={[]} uploadMode="manual" beforeUpload={beforeUpload} />,
  );
  await act(async () =>
    pick(container, [new File(['x'], 'a.csv'), new File(['x'], 'notes.txt'), new File(['x'], 'b.csv')]),
  );
  expect(screen.getByRole('status')).toHaveTextContent(/^2 files added\.$/);
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
  await act(async () => pick(container, [new File(['x'], 'bad.png')]));
  expect(beforeUpload).toHaveBeenCalledTimes(3);
  expect(screen.queryByRole('button', { name: 'Retry bad.png' })).not.toBeInTheDocument();
});
