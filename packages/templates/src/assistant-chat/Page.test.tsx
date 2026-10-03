import { act, fireEvent, render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../test/a11y';
import AssistantChatPage from './Page';
import { assistantReply, assistantTool, chunkReply } from './data';

const total = assistantTool.durationMs + (chunkReply(assistantReply).length + 2) * 30;

describe('AssistantChatPage', () => {
  it('renders the console with the empty conversation', { timeout: 15000 }, async () => {
    render(<AssistantChatPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Assistant' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'How can I help?' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Message' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  describe('with fake timers', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('streams a reply with a tool call and sources after a suggestion', { timeout: 15000 }, () => {
      const onSend = vi.fn();
      render(<AssistantChatPage onSend={onSend} />);
      fireEvent.click(screen.getByRole('button', { name: /Summarise this week/ }));
      expect(onSend).toHaveBeenCalledWith('Summarise this week’s deployments');
      expect(screen.getByRole('button', { name: /list_deployments/ })).toHaveTextContent('Running');
      act(() => vi.advanceTimersByTime(total));
      expect(screen.getByRole('button', { name: /list_deployments/ })).toHaveTextContent('Succeeded');
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('region', { name: 'Sources' }).length).toBeGreaterThan(0);
    });

    it('Stop ends the stream and unmounting clears pending timers', { timeout: 15000 }, () => {
      const { unmount } = render(<AssistantChatPage />);
      const box = screen.getByRole('textbox', { name: 'Message' });
      fireEvent.change(box, { target: { value: 'How are deployments going?' } });
      fireEvent.keyDown(box, { key: 'Enter' });
      act(() => vi.advanceTimersByTime(assistantTool.durationMs + 90));
      fireEvent.click(screen.getByRole('button', { name: 'Stop generating' }));
      expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /list_deployments/ })).toHaveTextContent('Succeeded');

      fireEvent.change(box, { target: { value: 'And invoices?' } });
      fireEvent.keyDown(box, { key: 'Enter' });
      const pending = vi.getTimerCount();
      unmount();
      expect(vi.getTimerCount()).toBeLessThanOrEqual(pending - chunkReply(assistantReply).length);
    });
  });
});
