import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ChatCopyFeedback from '../ChatMessage/examples/ResultFeedback';
import FeedbackCopyFeedback from '../MessageFeedback/examples/ResultFeedback';
import MarkdownCopyFeedback from '../Markdown/examples/ResultFeedback';
import { expectNoAxeViolations } from './a11y';

afterEach(() => vi.restoreAllMocks());

describe.each(['dark', 'light', 'high_contrast'])('%s copy examples', (theme) => {
  it.each([
    ['ChatMessage', ChatCopyFeedback, /^Copy message$|^Copiar mensaje$/],
    ['MessageFeedback', FeedbackCopyFeedback, /^Copy message$|^Copiar mensaje$/],
    ['Markdown', MarkdownCopyFeedback, /^Copy code$|^Copiar código$/],
  ] as const)('%s exposes localized failure feedback without axe violations', async (name, Example, copyName) => {
    document.documentElement.className = theme;
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
    const { container } = render(<Example />);
    for (const button of screen.getAllByRole('button', { name: copyName })) await user.click(button);
    const failed = screen.getByRole('button', { name: 'Copy failed' });
    expect(screen.getByRole('button', { name: 'No se pudo copiar' })).toBeInTheDocument();
    expect(container.querySelector('.lucide-check')).toBeNull();
    if (name !== 'Markdown') {
      await user.hover(failed);
      expect(await screen.findByRole('tooltip')).toHaveTextContent('Copy failed');
      await user.unhover(failed);
    }
    await expectNoAxeViolations(container);
  });
});
