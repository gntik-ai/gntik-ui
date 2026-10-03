import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import { TypingIndicator } from './TypingIndicator';
import TypingIndicatorStates from './examples/TypingIndicatorStates';

describe('TypingIndicator', () => {
  it('has accessible text and decorative dots', () => {
    const { container } = render(<TypingIndicator />);
    expect(screen.getByText('Assistant is typing')).toHaveClass('sr-only');
    const dots = container.querySelector('[aria-hidden]');
    expect(dots?.children).toHaveLength(3);
  });

  it('names the author and can show the label', () => {
    render(<TypingIndicator author="Reviewer" showLabel />);
    expect(screen.getByText('Reviewer is typing')).not.toHaveClass('sr-only');
  });

  it('dots stop animating under reduced motion', () => {
    const { container } = render(<TypingIndicator />);
    container.querySelectorAll('[aria-hidden] > span').forEach((d) => expect(d.className).toContain('motion-reduce:animate-none'));
  });

  it('is a status region only when asked to announce', () => {
    const { rerender } = render(<TypingIndicator />);
    expect(screen.queryByRole('status')).toBeNull();
    rerender(<TypingIndicator announce />);
    expect(screen.getByRole('status')).toHaveTextContent('Assistant is typing');
  });

  it('example has no axe violations', async () => {
    const { container } = render(<TypingIndicatorStates />);
    await expectNoAxeViolations(container);
  });
});
