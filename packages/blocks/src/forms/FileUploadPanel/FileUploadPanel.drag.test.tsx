import Labels from './examples/Labels';
import { expectNoAxeViolations } from '../../test/a11y';
import { fireEvent, render, screen } from '@testing-library/react';
import { FileUploadPanel } from './FileUploadPanel';

it('keeps a file drag over children, ignores links and shows destructive rejection feedback', () => {
  const { container } = render(<FileUploadPanel accept=".csv,text/csv" defaultFiles={[]} />);
  const zone = container.querySelector('[data-drag-state]') ?? screen.getByText('Drag files here or').parentElement!;
  const csv = { dataTransfer: { types: ['Files'], items: [{ kind: 'file', type: 'text/csv' }] } };
  fireEvent.dragEnter(zone, csv);
  fireEvent.dragOver(zone, csv);
  fireEvent.dragEnter(screen.getByRole('button', { name: 'Browse files' }), csv);
  fireEvent.dragLeave(screen.getByRole('button', { name: 'Browse files' }), csv);
  expect(zone).toHaveAttribute('data-dragging');
  fireEvent.dragLeave(zone, csv);
  fireEvent.dragOver(zone, { dataTransfer: { types: ['text/uri-list'], items: [] } });
  expect(zone).not.toHaveAttribute('data-dragging');
  fireEvent.dragEnter(zone, { dataTransfer: { types: ['Files'], items: [{ kind: 'file', type: 'image/png' }] } });
  expect(zone).toHaveAttribute('data-drag-state', 'reject');
  expect(zone).toHaveClass('border-destructive', 'bg-destructive/10', 'text-destructive-text');
});

it.each(['dark', 'light', 'high_contrast'])('the upload example and drag states are axe clean in %s', async (theme) => {
  document.documentElement.classList.add(theme);
  try {
    const { container } = render(<Labels />);
    const zone = container.querySelector('[data-drag-state]')!;
    await expectNoAxeViolations(container);
    fireEvent.dragEnter(zone, { dataTransfer: { types: ['Files'], items: [{ kind: 'file', type: 'text/csv' }] } });
    expect(zone).toHaveAttribute('data-drag-state', 'accept');
    await expectNoAxeViolations(container);
    fireEvent.dragOver(zone, { dataTransfer: { types: ['Files'], items: [{ kind: 'file', type: 'image/png' }] } });
    expect(zone).toHaveAttribute('data-drag-state', 'reject');
    await expectNoAxeViolations(container);
  } finally {
    document.documentElement.classList.remove(theme);
  }
});
