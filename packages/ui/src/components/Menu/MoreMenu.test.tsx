import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MoreMenu } from './MoreMenu';

describe('MoreMenu links', () => {
  it('renders mixed navigation and action items, retaining onSelect and disabled behavior', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <MoreMenu
        items={[
          { label: 'View logs', href: '/logs?run=42', onSelect },
          { label: 'Restart' },
          { label: 'Docs', href: 'https://docs.example.test', external: true },
          { label: 'Unavailable logs', href: '/unavailable', disabled: true },
        ]}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'More actions' }));
    const link = await screen.findByRole('menuitem', { name: 'View logs' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/logs?run=42');
    expect(screen.getByRole('menuitem', { name: 'Restart' }).tagName).toBe('DIV');
    const disabled = screen.getByRole('menuitem', { name: 'Unavailable logs' });
    expect(disabled.tagName).not.toBe('A');
    expect(disabled).not.toHaveAttribute('href');
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('menuitem', { name: /^Docs/ })).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('menuitem', { name: /^Docs/ })).toHaveAttribute('rel', 'noopener noreferrer');
    await user.click(link);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
