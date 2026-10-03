import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { BulkActionBar } from './BulkActionBar';

describe('BulkActionBar', () => {
  it('renders the default selection', async () => {
    const { container } = render(<BulkActionBar totalCount={24} />);
    expect(screen.getByRole('toolbar', { name: 'Bulk actions' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('3 of 24 items selected');
    await expectNoAxeViolations(container);
  });

  it('runs actions, clears and hides at zero', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    const onArchive = vi.fn();
    const { rerender } = render(
      <BulkActionBar selectedCount={1} noun={['member', 'members']} onClear={onClear} actions={[{ label: 'Archive', onClick: onArchive }]} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('1 member selected');
    await user.click(screen.getByRole('button', { name: 'Archive' }));
    await user.click(screen.getByRole('button', { name: 'Clear selection' }));
    expect(onArchive).toHaveBeenCalledTimes(1);
    expect(onClear).toHaveBeenCalledTimes(1);
    rerender(<BulkActionBar selectedCount={0} />);
    expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
  });
});
