import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import { AttachmentChip, attachmentStatus } from './AttachmentChip';
import { AttachmentList } from './AttachmentList';
import { matchesAccept, validateFiles } from './validateFiles';
import AttachmentStates from './examples/AttachmentStates';

const file = (name: string, type: string, size = 10) => new File(['x'.repeat(size)], name, { type });

describe('AttachmentChip / AttachmentList', () => {
  it('shows name and size, an image thumbnail or a file-type icon', () => {
    const { container } = render(
      <AttachmentList
        attachments={[
          { id: 'a', name: 'photo.png', size: 2048, type: 'image/png', previewUrl: 'blob:x' },
          { id: 'b', name: 'data.csv', size: 4096 },
        ]}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('photo.png2 KB');
    expect(items[0]?.querySelector('img')).toHaveAttribute('alt', '');
    expect(container.querySelector('[data-kind="spreadsheet"] svg')).not.toBeNull();
  });

  it('upload progress is a labelled progressbar (determinate and indeterminate)', () => {
    render(
      <AttachmentList
        attachments={[
          { id: 'a', name: 'a.pdf', progress: 40 },
          { id: 'b', name: 'b.pdf', progress: null },
          { id: 'c', name: 'c.pdf', progress: 100 },
        ]}
      />,
    );
    expect(screen.getByRole('progressbar', { name: 'Uploading a.pdf' })).toHaveAttribute('aria-valuenow', '40');
    const ind = screen.getByRole('progressbar', { name: 'Uploading b.pdf' });
    expect(ind).not.toHaveAttribute('aria-valuenow');
    expect(ind.firstElementChild?.className).toContain('motion-reduce:animate-none');
    expect(screen.queryByRole('progressbar', { name: 'Uploading c.pdf' })).toBeNull();
  });

  it('Tab reaches Retry then Remove; Enter / Space activate them', async () => {
    const onRetry = vi.fn();
    const onRemove = vi.fn();
    const user = userEvent.setup();
    render(<AttachmentChip attachment={{ id: 'x', name: 'notes.md', error: true }} onRetry={onRetry} onRemove={onRemove} />);
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Retry uploading notes.md' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledWith('x');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Remove notes.md' })).toHaveFocus();
    await user.keyboard(' ');
    expect(onRemove).toHaveBeenCalledWith('x');
  });

  it('derives the status', () => {
    expect(attachmentStatus({ id: '1', name: 'a' })).toBe('idle');
    expect(attachmentStatus({ id: '1', name: 'a', progress: 5 })).toBe('uploading');
    expect(attachmentStatus({ id: '1', name: 'a', progress: 5, error: 'x' })).toBe('error');
  });

  it('renders nothing when empty', () => {
    const { container } = render(<AttachmentList attachments={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('example has no axe violations', async () => {
    const { container } = render(<AttachmentStates />);
    await expectNoAxeViolations(container);
  });
});

describe('validateFiles', () => {
  it('matches extensions, MIME types and wildcards', () => {
    expect(matchesAccept(file('a.PDF', ''), '.pdf')).toBe(true);
    expect(matchesAccept(file('a.png', 'image/png'), 'image/*')).toBe(true);
    expect(matchesAccept(file('a.json', 'application/json'), 'application/json, .csv')).toBe(true);
    expect(matchesAccept(file('a.exe', 'application/x-msdownload'), '.pdf,image/*')).toBe(false);
    expect(matchesAccept(file('a.exe', ''), undefined)).toBe(true);
  });

  it('rejects by type, size and count', () => {
    const ok = file('a.png', 'image/png', 5);
    const big = file('b.png', 'image/png', 50);
    const bad = file('c.exe', '', 5);
    const extra = file('d.png', 'image/png', 5);
    const { accepted, rejected } = validateFiles([ok, big, bad, extra], { accept: 'image/*', maxSize: 20, maxFiles: 2, current: 1 });
    expect(accepted).toEqual([ok]);
    expect(rejected.map((r) => [r.file.name, r.reason])).toEqual([
      ['b.png', 'size'],
      ['c.exe', 'type'],
      ['d.png', 'count'],
    ]);
  });
});
