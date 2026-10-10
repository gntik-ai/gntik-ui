import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { StatusLayout } from './StatusLayout';

describe('StatusLayout heading slot', () => {
  it('focuses the built-in title through titleRef without adding a Tab stop', async () => {
    const user = userEvent.setup();
    const titleRef = createRef<HTMLHeadingElement>();
    const { rerender } = render(<StatusLayout title="Not found" titleRef={titleRef} primaryAction={<button>Go home</button>} />);
    const title = screen.getByRole('heading', { level: 1, name: 'Not found' });
    expect(title).toHaveAttribute('tabindex', '-1');
    await user.tab();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Go home' })).toHaveFocus();
    titleRef.current?.focus();
    expect(title).toHaveFocus();
    rerender(<StatusLayout title="Not found" />);
    expect(title).not.toHaveAttribute('tabindex');
  });

  it('uses the slot as the only h1 and keeps the primary action first in tab order', async () => {
    const user = userEvent.setup();
    render(
      <StatusLayout
        heading={<h1>Page unavailable</h1>}
        primaryAction={<button type="button">Go home</button>}
      />,
    );
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1, name: 'Page unavailable' })).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Go home' })).toHaveFocus();
  });
});
