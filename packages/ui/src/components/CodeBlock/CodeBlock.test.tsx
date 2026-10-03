import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoAxeViolations } from '../../test/a11y';
import { CodeBlock } from './CodeBlock';
import { tokenize } from './tokenize';
import CodeBlockFile from './examples/CodeBlockFile';
import CodeBlockSnippets from './examples/CodeBlockSnippets';

function mockClipboard(impl: (text: string) => Promise<void> = () => Promise.resolve()) {
  const writeText = vi.fn(impl);
  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
  return writeText;
}

describe('CodeBlock', () => {
  afterEach(() => vi.useRealTimers());

  it.each([['Enter', '{Enter}'], ['Space', ' ']])('%s on the copy button copies the code and announces it', async (_, key) => {
    const user = userEvent.setup();
    const writeText = mockClipboard();
    render(<CodeBlock language="bash" code={'pnpm add @gntik-ai/ui\n'} wrapToggle={false} />);
    await user.tab();
    const button = screen.getByRole('button', { name: 'Copy' });
    expect(button).toHaveFocus();
    await user.keyboard(key);
    expect(writeText).toHaveBeenCalledWith('pnpm add @gntik-ai/ui');
    expect(await screen.findByRole('button', { name: 'Copied' })).toHaveClass('text-primary-text');
    expect(screen.getByRole('status')).toHaveTextContent('Copied to clipboard');
  });

  it('resets the "Copied" feedback after two seconds', async () => {
    vi.useFakeTimers();
    mockClipboard();
    render(<CodeBlock code="x" />);
    await act(async () => screen.getByRole('button', { name: 'Copy' }).click());
    expect(screen.getByRole('button', { name: 'Copied' })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('announces a failed copy', async () => {
    const user = userEvent.setup();
    mockClipboard(() => Promise.reject(new Error('denied')));
    render(<CodeBlock code="x" />);
    await user.click(screen.getByRole('button', { name: 'Copy' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Copy failed'));
  });

  it('wrap toggle is a pressed button that switches soft wrapping', async () => {
    const user = userEvent.setup();
    const { container } = render(<CodeBlock code="const a = 1;" language="ts" />);
    const toggle = screen.getByRole('button', { name: 'Wrap lines' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    toggle.focus();
    await user.keyboard('{Enter}');
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelector('[data-line="1"] > span')).toHaveClass('whitespace-pre-wrap');
  });

  it('renders filename, language, line numbers, highlighted lines and a focusable region', async () => {
    const user = userEvent.setup();
    render(<CodeBlockFile />);
    const region = screen.getByRole('region', { name: 'DeployButton.tsx' });
    expect(screen.getByText('tsx')).toBeInTheDocument();
    expect(region).toHaveStyle({ maxHeight: '320px' });
    const lines = region.querySelectorAll('[data-line]');
    expect(lines).toHaveLength(11);
    expect(lines[4]).toHaveAttribute('data-highlighted', 'true');
    expect(lines[0]).not.toHaveAttribute('data-highlighted');
    expect(within(lines[0] as HTMLElement).getByText('1')).toHaveAttribute('aria-hidden', 'true');
    await user.tab();
    await user.tab();
    await user.tab();
    expect(region).toHaveFocus();
  });

  it('colours tokens with contrast-safe classes only', () => {
    const { container } = render(<CodeBlock code={'const n = 42; // answer\nconst s = "hi";'} language="ts" />);
    for (const kw of screen.getAllByText('const')) expect(kw).toHaveClass('text-primary-text');
    const classes = [...container.querySelectorAll('[data-line] span span[class]')].map((el) => el.className).join(' ');
    expect(classes).not.toMatch(/category|text-(primary|success|warning|destructive|info)(?!-text)\b/);
    expect(screen.getByText('42')).toHaveClass('text-destructive-text');
    expect(screen.getByText('"hi"')).toHaveClass('text-warning-text');
    expect(screen.getByText('// answer')).toHaveClass('text-muted-foreground');
  });

  it('uses a custom highlight function per line', () => {
    const highlight = vi.fn((line: string) => <mark>{line}</mark>);
    render(<CodeBlock code={'a\nb'} language="txt" highlight={highlight} />);
    expect(highlight).toHaveBeenCalledWith('a', 'txt');
    expect(screen.getByText('b').tagName).toBe('MARK');
  });

  it('tokenizes json, bash and css', () => {
    expect(tokenize('{"a": true}', 'json').map((t) => t.kind)).toEqual(['punctuation', 'property', 'punctuation', 'plain', 'number', 'punctuation']);
    expect(tokenize('npm i --save', 'bash')[0]).toEqual({ kind: 'function', value: 'npm' });
    expect(tokenize('a { color: red; }', 'css').find((t) => t.value === 'color')?.kind).toBe('property');
    expect(tokenize('hello', 'unknown')).toEqual([{ kind: 'plain', value: 'hello' }]);
  });

  it('examples have no axe violations', async () => {
    render(<><CodeBlockFile /><CodeBlockSnippets /></>);
    await expectNoAxeViolations();
  });
});
