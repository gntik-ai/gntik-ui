import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import ResourceGalleryPage from './Page';
import { galleryItems } from './data';

describe('ResourceGalleryPage', () => {
  it('renders the header, toolbar and card grid', { timeout: 15000 }, async () => {
    const { container } = render(<ResourceGalleryPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Resources' })).toBeInTheDocument();
    expect(screen.getByRole('toolbar', { name: 'Resources toolbar' })).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Resources' })).getAllByRole('listitem')).toHaveLength(galleryItems.length);
    expect(screen.getByRole('heading', { level: 2, name: galleryItems[0]!.name })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'All resources' })).toBeNull();
    expect(screen.getByText(`${galleryItems.length} of ${galleryItems.length} shown`)).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('switches to the table view and back', { timeout: 15000 }, async () => {
    const onViewChange = vi.fn();
    const { container } = render(<ResourceGalleryPage onViewChange={onViewChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Table view' }));
    expect(onViewChange).toHaveBeenCalledWith('table');
    expect(screen.getByRole('table', { name: 'Resources' })).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: 'Resources' })).not.toBeInTheDocument();
    await expectNoAxeViolations(container);
    await userEvent.click(screen.getByRole('button', { name: 'Grid view' }));
    expect(screen.getByRole('list', { name: 'Resources' })).toBeInTheDocument();
  });

  it('filters by search and shows the no-results state', { timeout: 15000 }, async () => {
    render(<ResourceGalleryPage />);
    const search = screen.getByRole('searchbox', { name: 'Search resources' });
    await userEvent.type(search, 'orders');
    expect(within(screen.getByRole('list', { name: 'Resources' })).getAllByRole('listitem')).toHaveLength(2);
    await userEvent.type(search, '-nope');
    expect(screen.getByRole('heading', { level: 2, name: /No resources match/ })).toBeInTheDocument();
  });
});
