import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { AgendaList } from './AgendaList';

describe('AgendaList', () => {
  it('groups the next seven days by day', async () => {
    const { container } = render(<AgendaList />);
    expect(screen.getByRole('heading', { name: 'Today · Wednesday, April 15' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Tomorrow · Thursday, April 16' })).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Today · Wednesday, April 15' })).getAllByRole('listitem')).toHaveLength(9);
    expect(screen.queryByRole('heading', { name: /April 22/ })).not.toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it('reports clicks and shows the empty state', async () => {
    const user = userEvent.setup();
    const onEventClick = vi.fn();
    const { unmount } = render(<AgendaList onEventClick={onEventClick} />);
    await user.click(screen.getByRole('button', { name: /Checkout hotfix/ }));
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ title: 'Checkout hotfix' }));
    unmount();
    render(<AgendaList events={[]} />);
    expect(screen.getByRole('heading', { name: 'Nothing scheduled' })).toBeInTheDocument();
  });
});
