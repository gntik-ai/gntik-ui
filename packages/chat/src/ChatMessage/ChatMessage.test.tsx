import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import { ChatAnnouncer } from './ChatAnnouncer';
import { ChatMessage } from './ChatMessage';
import ChatMessageRoles from './examples/ChatMessageRoles';
import ChatMessageStreaming from './examples/ChatMessageStreaming';
import ChatMessageTeam from './examples/ChatMessageTeam';

describe('ChatMessage', () => {
  it('is an article named by its author, with a timestamp', () => {
    render(
      <ChatMessage role="user" author="Maria Ruiz" timestamp={new Date('2026-10-03T09:41:00Z')}>
        Hello
      </ChatMessage>,
    );
    const article = screen.getByRole('article', { name: 'Maria Ruiz' });
    expect(article).toHaveAttribute('data-role', 'user');
    expect(article.querySelector('time')).toHaveAttribute('dateTime', '2026-10-03T09:41:00.000Z');
  });

  it('Tab reaches the actions in order: copy, retry, good, bad', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">before</button>
        <ChatMessage role="assistant" copyText="Answer" onRetry={() => {}} onFeedback={() => {}}>
          Answer
        </ChatMessage>
      </>,
    );
    expect(screen.getByRole('group', { name: 'Actions for Assistant message' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'before' }));
    await user.tab();
    expect(screen.getByRole('button', { name: 'Copy message' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Retry' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Good response' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Bad response' })).toHaveFocus();
  });

  it('copy writes the text; retry and feedback fire; thumbs are toggle buttons', async () => {
    const onRetry = vi.fn();
    const onFeedback = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <ChatMessage role="assistant" copyText="The answer" onRetry={onRetry} feedback={null} onFeedback={onFeedback}>
        The answer
      </ChatMessage>,
    );
    await user.click(screen.getByRole('button', { name: 'Copy message' }));
    expect(await navigator.clipboard.readText()).toBe('The answer');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalled();
    const up = screen.getByRole('button', { name: 'Good response' });
    expect(up).toHaveAttribute('aria-pressed', 'false');
    up.focus();
    await user.keyboard('{Enter}');
    expect(onFeedback).toHaveBeenLastCalledWith('up');
    rerender(
      <ChatMessage role="assistant" copyText="The answer" onRetry={onRetry} feedback="up" onFeedback={onFeedback}>
        The answer
      </ChatMessage>,
    );
    expect(screen.getByRole('button', { name: 'Good response' })).toHaveAttribute('aria-pressed', 'true');
    screen.getByRole('button', { name: 'Good response' }).focus();
    await user.keyboard(' ');
    expect(onFeedback).toHaveBeenLastCalledWith(null);
  });

  it('streaming: aria-busy, no actions, typing indicator while empty', () => {
    render(<ChatMessage role="assistant" streaming copyText="" onRetry={() => {}} />);
    const article = screen.getByRole('article', { name: 'Assistant' });
    expect(article).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByRole('group')).toBeNull();
    expect(screen.getByText('Assistant is typing')).toBeInTheDocument();
  });

  it('streaming plain text ends with a decorative caret that goes away when done', () => {
    const { container, rerender } = render(<ChatMessage role="user" streaming>Partial answ</ChatMessage>);
    const caret = container.querySelector('[data-slot="streaming-caret"]');
    expect(caret).toHaveAttribute('aria-hidden', 'true');
    expect(caret?.className).toContain('motion-reduce:animate-none');
    expect(screen.queryByText('Assistant is typing')).toBeNull();
    rerender(<ChatMessage role="user">Partial answer</ChatMessage>);
    expect(container.querySelector('[data-slot="streaming-caret"]')).toBeNull();
    expect(screen.getByRole('article')).not.toHaveAttribute('aria-busy');
  });

  it('system notes have no avatar and no actions', () => {
    render(<ChatMessage role="system" copyText="x">Conversation started</ChatMessage>);
    expect(screen.queryByRole('group')).toBeNull();
    expect(screen.getByRole('article', { name: 'System' })).toHaveTextContent('Conversation started');
  });

  it('participant turns: another person, start-aligned outlined bubble with name and initials', () => {
    render(
      <ChatMessage role="participant" author="Daniel Okafor" timestamp="10:02">
        Can we roll back?
      </ChatMessage>,
    );
    const article = screen.getByRole('article', { name: 'Daniel Okafor' });
    expect(article).toHaveAttribute('data-role', 'participant');
    expect(article).not.toHaveClass('flex-row-reverse');
    expect(screen.getByText('DO')).toBeInTheDocument();
    expect(screen.getByText('Can we roll back?')).toHaveClass('border-border', 'bg-card', 'rounded-ss-md');
  });

  it('participant defaults its author and keeps actions reachable with Tab, Enter activating them', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ChatMessage role="participant" onRetry={onRetry}>
        Ping
      </ChatMessage>,
    );
    expect(screen.getByRole('article', { name: 'Participant' })).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Retry' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('examples have no axe violations', async () => {
    const { container, unmount } = render(<ChatMessageRoles />);
    await expectNoAxeViolations(container);
    unmount();
    const r = render(<ChatMessageStreaming />);
    await expectNoAxeViolations(r.container);
    r.unmount();
    const team = render(<ChatMessageTeam />);
    expect(screen.getByRole('article', { name: 'Daniel Okafor' })).toHaveAttribute('data-role', 'participant');
    await expectNoAxeViolations(team.container);
  });
});

describe('ChatAnnouncer', () => {
  it('announces the start once, then the finished reply (not every token)', () => {
    const { rerender } = render(<ChatAnnouncer streaming lastReply="old" />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(status).toHaveTextContent('Assistant is responding…');
    rerender(<ChatAnnouncer streaming lastReply="old" />);
    expect(status).toHaveTextContent('Assistant is responding…');
    rerender(<ChatAnnouncer streaming={false} lastReply="Two invoices are unpaid." />);
    expect(status).toHaveTextContent('Two invoices are unpaid.');
  });

  it('truncates long replies', () => {
    render(<ChatAnnouncer streaming={false} lastReply={'a'.repeat(50)} maxLength={10} />);
    expect(screen.getByRole('status').textContent).toBe(`${'a'.repeat(10)}…`);
  });
});
