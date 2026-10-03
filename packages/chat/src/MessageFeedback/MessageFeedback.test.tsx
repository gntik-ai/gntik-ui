import { TooltipProvider } from '@gntik-ai/ui';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import { MessageFeedback, type FeedbackValue, type MessageFeedbackProps } from './MessageFeedback';
import MessageFeedbackReply from './examples/MessageFeedbackReply';

function Controlled(props: Partial<MessageFeedbackProps> & { spy?: (v: FeedbackValue) => void }) {
  const [value, setValue] = useState<FeedbackValue>({ rating: null });
  return (
    <TooltipProvider>
      <MessageFeedback
        value={value}
        onFeedback={(v) => {
          setValue(v);
          props.spy?.(v);
        }}
        {...props}
      />
    </TooltipProvider>
  );
}

describe('MessageFeedback', () => {
  it('Tab reaches copy, regenerate, good and bad in order', async () => {
    const user = userEvent.setup();
    render(<Controlled copyText="x" onRegenerate={() => {}} />);
    expect(screen.getByRole('group', { name: 'Response feedback' })).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Copy message' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Regenerate' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Good response' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Bad response' })).toHaveFocus();
  });

  it('Enter / Space toggle thumbs up (aria-pressed) and a second press clears', async () => {
    const spy = vi.fn();
    const user = userEvent.setup();
    render(<Controlled spy={spy} />);
    const up = screen.getByRole('button', { name: 'Good response' });
    up.focus();
    await user.keyboard('{Enter}');
    expect(up).toHaveAttribute('aria-pressed', 'true');
    expect(spy).toHaveBeenLastCalledWith({ rating: 'up' });
    expect(screen.getByRole('status')).toHaveTextContent('Thanks for your feedback');
    await user.keyboard(' ');
    expect(up).toHaveAttribute('aria-pressed', 'false');
    expect(spy).toHaveBeenLastCalledWith({ rating: null });
  });

  it('thumbs down opens the details popover; sending reports reason and comment', async () => {
    const spy = vi.fn();
    const user = userEvent.setup();
    render(<Controlled spy={spy} />);
    const down = screen.getByRole('button', { name: 'Bad response' });
    down.focus();
    await user.keyboard('{Enter}');
    expect(spy).toHaveBeenLastCalledWith({ rating: 'down' });
    expect(down).toHaveAttribute('aria-pressed', 'true');
    const dialog = await screen.findByRole('dialog', { name: 'What went wrong?' });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    await user.click(screen.getByRole('radio', { name: 'Incomplete' }));
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('radio', { name: 'Harmful or unsafe' })).toBeChecked();
    await user.type(screen.getByRole('textbox', { name: 'Comment (optional)' }), '  Missing the cost  ');
    await user.click(screen.getByRole('button', { name: 'Send feedback' }));
    expect(spy).toHaveBeenLastCalledWith({ rating: 'down', reason: 'unsafe', comment: 'Missing the cost' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Escape closes the popover, keeps the rating and returns focus to the thumb', async () => {
    const user = userEvent.setup();
    render(<Controlled />);
    const down = screen.getByRole('button', { name: 'Bad response' });
    await user.click(down);
    await screen.findByRole('dialog');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(down).toHaveAttribute('aria-pressed', 'true');
    await waitFor(() => expect(down).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(down).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('askDetails={false} rates without a popover; reasons can be custom', async () => {
    const spy = vi.fn();
    const user = userEvent.setup();
    const { unmount } = render(<Controlled spy={spy} askDetails={false} />);
    await user.click(screen.getByRole('button', { name: 'Bad response' }));
    expect(spy).toHaveBeenLastCalledWith({ rating: 'down' });
    expect(screen.queryByRole('dialog')).toBeNull();
    unmount();
    render(<Controlled reasons={[{ value: 'slow', label: 'Too slow' }]} />);
    await user.click(screen.getByRole('button', { name: 'Bad response' }));
    expect(await screen.findByRole('radio', { name: 'Too slow' })).toBeInTheDocument();
  });

  it('copy and regenerate call through', async () => {
    const onRegenerate = vi.fn();
    const user = userEvent.setup();
    render(<Controlled copyText="hello" onRegenerate={onRegenerate} />);
    await user.click(screen.getByRole('button', { name: 'Regenerate' }));
    expect(onRegenerate).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Copy message' }));
    expect(await screen.findByRole('button', { name: 'Copied' })).toBeInTheDocument();
  });

  it('example has no axe violations, closed and with the popover open', async () => {
    const user = userEvent.setup();
    const { container } = render(<MessageFeedbackReply />);
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole('button', { name: 'Bad response' }));
    await screen.findByRole('dialog');
    await expectNoAxeViolations(document.body);
  });
});
