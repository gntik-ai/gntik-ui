import { act, fireEvent, render, screen } from '@testing-library/react';
import { createEchoAdapter } from '@gntik-ai/chat';
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

  it.each(['dark', 'light', 'high_contrast'])(
    'streams a custom adapter reply into the assistant Markdown in %s',
    async (theme) => {
      document.documentElement.className = theme;
      render(<AssistantChatPage adapter={createEchoAdapter({ delayMs: 0 })} />);
      const box = screen.getByRole('textbox', { name: 'Message' });
      fireEvent.change(box, { target: { value: '**hello**' } });
      fireEvent.keyDown(box, { key: 'Enter' });
      const assistant = await screen.findByRole('article', { name: 'Assistant' });
      expect(await screen.findByText('hello', { selector: 'strong' })).toBeInTheDocument();
      expect(assistant).toHaveTextContent('hello');
      expect(screen.queryByRole('button', { name: /list_deployments/ })).not.toBeInTheDocument();
      await expectNoAxeViolations();
    },
  );

  describe('with fake timers', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('streams a reply with a tool call and sources after a suggestion', { timeout: 15000 }, async () => {
      const onSend = vi.fn();
      render(<AssistantChatPage onSend={onSend} />);
      await act(async () => fireEvent.click(screen.getByRole('button', { name: /Summarise this week/ })));
      expect(onSend).toHaveBeenCalledWith('Summarise this week’s deployments');
      expect(screen.getByRole('button', { name: /list_deployments/ })).toHaveTextContent('Running');
      await act(async () => vi.advanceTimersByTimeAsync(total));
      expect(screen.getByRole('button', { name: /list_deployments/ })).toHaveTextContent('Succeeded');
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('region', { name: 'Sources' }).length).toBeGreaterThan(0);
    });

    it('keeps the stopped-tool error and retries with the adapter', async () => {
      render(<AssistantChatPage />);
      await act(async () => fireEvent.click(screen.getByRole('button', { name: /Summarise this week/ })));
      fireEvent.click(screen.getByRole('button', { name: 'Stop generating' }));
      fireEvent.click(screen.getByRole('button', { name: /list_deployments/ }));
      expect(screen.getByText('Stopped by the user.')).toHaveAttribute('role', 'alert');
      expect(screen.getByText('0 ms')).toBeInTheDocument();
      await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Retry' })));
      expect(screen.getByRole('button', { name: /list_deployments/ })).toHaveTextContent('Running');
      await act(async () => vi.advanceTimersByTimeAsync(total));
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    it('Stop ends the stream and unmounting clears pending timers', { timeout: 15000 }, async () => {
      const { unmount } = render(<AssistantChatPage />);
      const box = screen.getByRole('textbox', { name: 'Message' });
      fireEvent.change(box, { target: { value: 'How are deployments going?' } });
      await act(async () => fireEvent.keyDown(box, { key: 'Enter' }));
      await act(async () => vi.advanceTimersByTimeAsync(assistantTool.durationMs + 90));
      fireEvent.click(screen.getByRole('button', { name: 'Stop generating' }));
      expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /list_deployments/ })).toHaveTextContent('Succeeded');

      fireEvent.change(box, { target: { value: 'And invoices?' } });
      await act(async () => fireEvent.keyDown(box, { key: 'Enter' }));
      const pending = vi.getTimerCount();
      unmount();
      expect(vi.getTimerCount()).toBeLessThanOrEqual(pending - chunkReply(assistantReply).length);
    });
  });
});
