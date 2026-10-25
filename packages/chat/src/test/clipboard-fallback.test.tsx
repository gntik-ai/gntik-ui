import { act, fireEvent, render, screen, cleanup } from '@testing-library/react';
import { TooltipProvider } from '@gntik-ai/ui';
import { afterEach, expect, it, vi } from 'vitest';
import { MessageFeedback } from '../MessageFeedback/MessageFeedback';
import { ChatMessage } from '../ChatMessage/ChatMessage';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it.each([
  ['MessageFeedback', () => <MessageFeedback copyText="Answer" />],
  [
    'ChatMessage',
    () => (
      <ChatMessage role="assistant" copyText="Answer">
        Answer
      </ChatMessage>
    ),
  ],
] as const)('%s confirms only successful fallback copies', async (_, view) => {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  const exec = vi.fn(() => true);
  Object.defineProperty(document, 'execCommand', { configurable: true, value: exec });
  const { unmount } = render(<TooltipProvider>{view()}</TooltipProvider>);
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Copy message' })));
  expect(exec).toHaveBeenCalledWith('copy');
  expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
  unmount();
  exec.mockReturnValue(false);
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
  });
  render(<TooltipProvider>{view()}</TooltipProvider>);
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Copy message' })));
  expect(screen.getByRole('button', { name: 'Copy failed' })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Copied' })).not.toBeInTheDocument();
});
