import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import MessagingPage from './Page';
import { conversations } from './data';

describe('MessagingPage', () => {
  it('renders the conversation list and the empty thread', { timeout: 15000 }, async () => {
    render(<MessagingPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Messages' })).toBeInTheDocument();
    const list = screen.getByRole('navigation', { name: 'Conversations' });
    expect(
      within(list)
        .getAllByRole('button')
        .filter((el) => !el.hasAttribute('aria-haspopup')),
    ).toHaveLength(conversations.length);
    expect(within(list).queryByRole('heading')).toBeNull();
    expect([...list.querySelectorAll<HTMLElement>('button')].filter((el) => el.tabIndex === 0)).toHaveLength(1);
    expect(within(list).getByText('2')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Select a conversation' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('opens a thread with attachments and sends a message', { timeout: 15000 }, async () => {
    const onSend = vi.fn();
    render(<MessagingPage onSend={onSend} />);
    await userEvent.click(
      within(screen.getByRole('navigation', { name: 'Conversations' })).getByRole('button', { name: /^Release 2\.14/ }),
    );
    expect(screen.queryByLabelText('2 unread messages')).toBeNull();
    const log = screen.getByRole('log', { name: 'Messages in Release 2.14' });
    expect(within(log).getAllByRole('article')).toHaveLength(4);
    expect(within(log).getByText('rollback-runbook.pdf')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: 'Message Release 2.14' }), 'Ship it.{Enter}');
    expect(onSend).toHaveBeenCalledWith('c-release', 'Ship it.', []);
    expect(within(log).getAllByRole('article')).toHaveLength(5);
    expect(within(log).getByText('Ship it.')).toBeInTheDocument();
    await expectNoAxeViolations();
  });
});

it.each(['dark', 'light', 'high_contrast'])(
  'history and thread are axe clean in %s',
  { timeout: 15000 },
  async (theme) => {
    document.documentElement.className = theme;
    render(<MessagingPage defaultConversationId="c-release" />);
    await expectNoAxeViolations();
  },
);
