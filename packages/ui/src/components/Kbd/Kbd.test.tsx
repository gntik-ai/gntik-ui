import { render, screen } from '@testing-library/react';
import { expectNoAxeViolations } from '../../test/a11y';
import { Kbd, KbdCombo } from './Kbd';
import KbdShortcuts from './examples/KbdShortcuts';

describe('Kbd', () => {
  afterEach(() => vi.unstubAllGlobals());

  it.each([
    [{ platform: 'MacIntel' }, '⌘', 'Command'],
    [{ platform: 'MacIntel', maxTouchPoints: 5 }, '⌘', 'Command'],
    [{ platform: 'Win32' }, 'Ctrl', 'Control'],
    [undefined, 'Ctrl', 'Control'],
  ])('resolves mod for %j', (navigatorValue, visible, spoken) => {
    vi.stubGlobal('navigator', navigatorValue);
    render(<KbdCombo keys={['mod', 'K']} />);
    expect(screen.getByText(visible)).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText(spoken)).toHaveClass('sr-only');
    expect(screen.getByText('K')).toBeInTheDocument();
    expect(screen.queryByText('mod')).not.toBeInTheDocument();
  });

  it('preserves explicit glyphs and gives literal Ctrl its spoken name', () => {
    vi.stubGlobal('navigator', { platform: 'Win32' });
    render(<KbdCombo keys={['⌘', 'Ctrl']} />);
    expect(screen.getByText('⌘')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Command')).toHaveClass('sr-only');
    expect(screen.getByText('Ctrl')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Control')).toHaveClass('sr-only');
  });

  it('keeps a custom label in preference to the resolved modifier name', () => {
    vi.stubGlobal('navigator', { platform: 'Win32' });
    render(<Kbd label="Primary modifier">mod</Kbd>);
    expect(screen.getByText('Ctrl')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Primary modifier')).toHaveClass('sr-only');
    expect(screen.queryByText('Control')).not.toBeInTheDocument();
  });

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
    expect(screen.getAllByText('+')).toHaveLength(2);
    for (const separator of screen.getAllByText('+')) expect(separator).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['dark', '', 'high_contrast'])('example has no axe violations in theme %s', async (theme) => {
    document.documentElement.className = theme;
    render(<KbdShortcuts />);
    await expectNoAxeViolations();
  });
});
