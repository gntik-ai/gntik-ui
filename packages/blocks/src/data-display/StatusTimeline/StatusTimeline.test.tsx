import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { StatusTimeline } from './StatusTimeline';

describe('StatusTimeline', () => {
  it('renders every event as an ordered list item with a time element', async () => {
    const { container } = render(<StatusTimeline />);
    const list = screen.getByRole('list', { name: 'Status history' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(6);
    expect(container.querySelectorAll('time')).toHaveLength(6);
    await expectNoAxeViolations(container);
  });

  it('collapses older events behind a toggle', async () => {
    render(<StatusTimeline maxVisible={3} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    const toggle = screen.getByRole('button', { name: 'Show 3 earlier events' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(screen.getAllByRole('listitem')).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'Show fewer' })).toHaveAttribute('aria-expanded', 'true');
  });
});
