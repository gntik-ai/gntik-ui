import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import ThumbnailUploads from './examples/ThumbnailUploads';
import { fileKind, formatBytes } from './file-kind';
import { Thumbnail } from './Thumbnail';

describe('Thumbnail', () => {
  it('derives kind and size labels', () => {
    expect(fileKind('report.pdf')).toBe('document');
    expect(fileKind('clip', 'video/mp4')).toBe('video');
    expect(fileKind('README')).toBe('file');
    expect(formatBytes(512, 'en')).toBe('512 B');
    expect(formatBytes(1_840_000, 'en')).toBe('1.8 MB');
  });

  it('is a figure named by its caption, listed in a ThumbnailList', () => {
    render(<ThumbnailUploads />);
    const list = screen.getByRole('list', { name: 'Attachments' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(4);
    expect(screen.getByRole('figure', { name: /deployment-runbook\.pdf/ })).toHaveTextContent('230 KB');
  });

  it('shows upload progress as a progressbar with the shimmer', () => {
    render(<Thumbnail name="data.csv" size={2048} progress={40} />);
    const bar = screen.getByRole('progressbar', { name: 'Uploading data.csv' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(screen.getByRole('figure')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('figure').querySelector('.animate-pulse')).toHaveClass('motion-reduce:animate-none');
  });

  it('error state shows the message and no progress', () => {
    render(<Thumbnail name="big.zip" progress={60} error="Network error" />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByRole('figure')).toHaveAttribute('data-status', 'error');
    expect(screen.getByText('Network error')).toHaveClass('text-destructive-text');
  });

  it('Tab reaches remove; Enter removes the tile', async () => {
    const user = userEvent.setup();
    render(<ThumbnailUploads />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Remove architecture-diagram.png' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('figure', { name: /architecture-diagram/ })).not.toBeInTheDocument();
  });

  it('Space activates retry in the error state', async () => {
    const user = userEvent.setup();
    render(<ThumbnailUploads />);
    const retry = screen.getByRole('button', { name: 'Retry' });
    retry.focus();
    await user.keyboard(' ');
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'Uploading backup-2026-05.tar.gz' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    render(<ThumbnailUploads />);
    await expectNoAxeViolations();
  });
});
