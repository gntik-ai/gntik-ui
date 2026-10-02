import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Kbd, KbdCombo } from './Kbd';
import KbdShortcuts from './examples/KbdShortcuts';

describe('Kbd', () => {
  it('renders a kbd element with plain text keys', () => {
    render(<Kbd>esc</Kbd>);
    const key = screen.getByText('esc');
    expect(key.tagName).toBe('KBD');
    expect(key).toHaveClass('font-mono', 'border-border');
  });

  it('hides symbol glyphs and announces the key name', () => {
    const { container } = render(<Kbd>⌘</Kbd>);
    expect(screen.getByText('⌘')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Command')).toHaveClass('sr-only');
    expect(container.querySelector('kbd')).toHaveTextContent('⌘Command');
  });

  it('accepts a custom spoken label', () => {
    render(<Kbd label="Function">fn</Kbd>);
    expect(screen.getByText('Function')).toHaveClass('sr-only');
  });

  it('KbdCombo nests one kbd per key inside an outer kbd, with an optional separator', () => {
    const { container } = render(<KbdCombo keys={['Ctrl', 'Shift', 'P']} separator="+" />);
    const outer = container.firstElementChild;
    expect(outer?.tagName).toBe('KBD');
    expect(outer?.querySelectorAll(':scope > kbd')).toHaveLength(3);
    expect(outer?.querySelectorAll('[aria-hidden]')).toHaveLength(2);
  });

  it('example has no axe violations', async () => {
    render(<KbdShortcuts />);
    await expectNoAxeViolations();
  });
});
