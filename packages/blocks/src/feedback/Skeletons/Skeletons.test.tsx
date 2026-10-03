import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { ListSkeleton, PageSkeleton, TableSkeleton } from './Skeletons';

describe('Skeletons', () => {
  it('renders the three defaults', async () => {
    const { container } = render(
      <>
        <PageSkeleton />
        <TableSkeleton />
        <ListSkeleton />
      </>,
    );
    expect(screen.getAllByRole('status')).toHaveLength(3);
    expect(screen.getByText('Loading page')).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('honours row counts and labels', () => {
    const { container } = render(<ListSkeleton rows={7} label="Loading members" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading members');
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelectorAll('li')).toHaveLength(7);
  });
});
