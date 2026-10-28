import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import ConversationListGrouped from './examples/ConversationListGrouped';
import ConversationListLinks from './examples/ConversationListLinks';
import ConversationListWindowed from './examples/ConversationListWindowed';
import ChatLayoutWithSidebar from '../ChatLayout/examples/ChatLayoutWithSidebar';

describe('Conversation history examples', () => {
  it.each(['dark', 'light', 'high_contrast'])('examples have no axe violations in %s', async (theme) => {
    document.documentElement.className = theme;
    for (const Example of [
      ConversationListGrouped,
      ConversationListLinks,
      ConversationListWindowed,
      ChatLayoutWithSidebar,
    ]) {
      const { container, unmount } = render(<Example />);
      await expectNoAxeViolations(container);
      unmount();
    }
  });

  it('the open menu and inline rename have no nested-interactive or other axe violations', async () => {
    const user = userEvent.setup();
    render(<ConversationListGrouped />);
    await user.click(screen.getByRole('button', { name: 'More actions for Budget review' }));
    await screen.findByRole('menu');
    await expectNoAxeViolations();
    await user.click(screen.getByRole('menuitem', { name: 'Rename' }));
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Rename' })).toHaveFocus());
    await expectNoAxeViolations();
  });

  it('the responsive example opens history in the kit Drawer on small screens', async () => {
    const user = userEvent.setup();
    render(<ChatLayoutWithSidebar />);
    await user.click(screen.getByRole('button', { name: 'Conversations' }));
    await screen.findByRole('dialog', { name: 'Conversations' });
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: /^Project plan/ }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.getByText('Project plan')).toBeVisible();
  });
});
