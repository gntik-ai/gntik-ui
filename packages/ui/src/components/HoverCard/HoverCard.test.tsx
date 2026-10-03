import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './HoverCard';
import HoverCardMember from './examples/HoverCardMember';

const preview = () => screen.queryByText('Staff engineer · Platform team');

describe('HoverCard', () => {
  it('Tab focuses the link and opens the preview after the delay', async () => {
    const user = userEvent.setup();
    render(<HoverCardMember />);
    await user.tab();
    expect(screen.getByRole('link', { name: 'Maria Ruiz' })).toHaveFocus();
    expect(preview()).not.toBeInTheDocument();
    await waitFor(() => expect(preview()).toBeInTheDocument(), { timeout: 2000 });
  });

  it('Escape closes the preview and keeps focus on the link', async () => {
    const user = userEvent.setup();
    render(<HoverCardMember />);
    await user.tab();
    await waitFor(() => expect(preview()).toBeInTheDocument(), { timeout: 2000 });
    await user.keyboard('{Escape}');
    await waitFor(() => expect(preview()).not.toBeInTheDocument());
    expect(screen.getByRole('link', { name: 'Maria Ruiz' })).toHaveFocus();
  });

  it('Enter follows the link', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    render(
      <HoverCard>
        <HoverCardTrigger href="/projects/atlas" onClick={onClick}>Atlas</HoverCardTrigger>
        <HoverCardContent>Atlas project</HoverCardContent>
      </HoverCard>,
    );
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('opens on hover', async () => {
    const user = userEvent.setup();
    render(<HoverCardMember />);
    await user.hover(screen.getByRole('link', { name: 'Maria Ruiz' }));
    await waitFor(() => expect(preview()).toBeInTheDocument(), { timeout: 2000 });
  });

  it('open preview has no axe violations', async () => {
    const user = userEvent.setup();
    render(<HoverCardMember />);
    await user.tab();
    await waitFor(() => expect(preview()).toBeInTheDocument(), { timeout: 2000 });
    await expectNoAxeViolations();
  });
});
