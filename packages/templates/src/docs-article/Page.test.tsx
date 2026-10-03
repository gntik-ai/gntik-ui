import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../test/a11y';
import DocsArticlePage from './Page';

describe('DocsArticlePage', () => {
  it('renders the article, outline, code and quote', { timeout: 15000 }, async () => {
    render(<DocsArticlePage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Verify webhook signatures' })).toBeInTheDocument();
    const outline = screen.getByRole('navigation', { name: 'On this page' });
    expect(within(outline).getByRole('link', { name: 'Node.js example' })).toHaveAttribute('href', '#verify-node');
    expect(screen.getByText('verify.ts')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Previous and next articles' })).toBeInTheDocument();
    await expectNoAxeViolations();
  });

  it('collects negative feedback with a comment', { timeout: 15000 }, async () => {
    const onFeedback = vi.fn();
    render(<DocsArticlePage onFeedback={onFeedback} />);
    const feedback = screen.getByRole('region', { name: 'Was this helpful?' });
    await userEvent.click(within(feedback).getByRole('button', { name: 'No' }));
    await userEvent.type(within(feedback).getByRole('textbox', { name: 'What was missing?' }), 'A Python example');
    await userEvent.click(within(feedback).getByRole('button', { name: 'Send feedback' }));
    expect(onFeedback).toHaveBeenCalledWith({ helpful: false, comment: 'A Python example' });
    expect(within(feedback).getByText('Thanks for your feedback.')).toBeInTheDocument();
  });
});
