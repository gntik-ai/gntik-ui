import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import MarkdownReply from './examples/MarkdownReply';
import MarkdownStreaming from './examples/MarkdownStreaming';
import { Markdown, repairStreamingMarkdown, safeUrl } from './Markdown';

describe('Markdown safety', () => {
  it('never renders raw HTML', () => {
    const { container } = render(
      <Markdown>{'Hello <script>alert(1)</script> <img src=x onerror="alert(2)"> <b>bold</b>\n\n<iframe src="https://evil.example"></iframe>'}</Markdown>,
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
    expect(container.innerHTML).not.toContain('onerror');
  });

  it('strips javascript:, data: and vbscript: links', () => {
    const { container } = render(
      <Markdown>{'[a](javascript:alert(1)) [b](JaVaScRiPt:alert(1)) [c](data:text/html;base64,PHNjcmlwdD4=) [d](vbscript:x) <javascript:alert(1)>'}</Markdown>,
    );
    for (const a of Array.from(container.querySelectorAll('a'))) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^(javascript|data|vbscript):/i);
    }
    expect(container.innerHTML).not.toMatch(/href="(javascript|data|vbscript):/i);
  });

  it('safeUrl keeps http(s), mailto, relative and anchors', () => {
    expect(safeUrl('https://example.com/a')).toBe('https://example.com/a');
    expect(safeUrl('mailto:team@example.com')).toBe('mailto:team@example.com');
    expect(safeUrl('/docs/start')).toBe('/docs/start');
    expect(safeUrl('#install')).toBe('#install');
    expect(safeUrl('java\tscript:alert(1)')).toBe('');
    expect(safeUrl('javascript:alert(1)')).toBe('');
  });

  it('renders images as links instead of loading them', () => {
    render(<Markdown>{'![usage chart](https://example.com/chart.png)'}</Markdown>);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByRole('link', { name: /Image: usage chart/ })).toHaveAttribute('href', 'https://example.com/chart.png');
  });

  it('marks external links and opens them in a new tab', () => {
    render(<Markdown>{'[guide](https://example.com/guide) and [local](/settings)'}</Markdown>);
    const ext = screen.getByRole('link', { name: /^guide.*\(opens in a new tab\)$/ });
    expect(ext).toHaveAttribute('target', '_blank');
    expect(ext).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(screen.getByRole('link', { name: 'local' })).not.toHaveAttribute('target');
  });
});

describe('Markdown rendering', () => {
  it('renders GFM tables, task lists, blockquotes and inline code', () => {
    render(<MarkdownReply />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Region' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Done' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Not done' })).not.toBeChecked();
    expect(screen.getByText(/does not revert database migrations/).closest('blockquote')).not.toBeNull();
    expect(screen.getByText('deploy rollback --to previous').tagName).toBe('CODE');
  });

  it('fenced code gets a language label and a copy button that copies the code', async () => {
    const user = userEvent.setup();
    render(<Markdown>{'```ts\nconst a = 1;\n```'}</Markdown>);
    expect(screen.getByText('ts')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(await navigator.clipboard.readText()).toBe('const a = 1;');
    expect(screen.getByRole('button', { name: 'Copied code' })).toBeInTheDocument();
  });
});

describe('Markdown streaming', () => {
  it('closes an unclosed fence so the partial code renders as a code block', () => {
    const { container } = render(<Markdown streaming>{'Run this:\n\n```bash\nnpm run build\nnpm run te'}</Markdown>);
    const pre = container.querySelector('pre');
    expect(pre).not.toBeNull();
    expect(pre).toHaveTextContent('npm run build npm run te');
    expect(screen.getByText('bash')).toBeInTheDocument();
    expect(container.textContent).not.toContain('```');
    expect(container.firstElementChild).toHaveAttribute('data-streaming', 'true');
  });

  it('handles a fence that has only just opened', () => {
    const { container } = render(<Markdown streaming>{'Here:\n\n```'}</Markdown>);
    expect(container.textContent).not.toContain('```');
  });

  it('repairStreamingMarkdown only touches odd fences', () => {
    expect(repairStreamingMarkdown('a\n```js\nx')).toBe('a\n```js\nx\n```');
    expect(repairStreamingMarkdown('a\n```js\nx\n```\n')).toBe('a\n```js\nx\n```\n');
    expect(repairStreamingMarkdown('~~~\ny')).toBe('~~~\ny\n~~~');
    expect(repairStreamingMarkdown('plain **bold')).toBe('plain **bold');
  });

  it('examples have no axe violations', async () => {
    const { container, unmount } = render(<MarkdownReply />);
    await expectNoAxeViolations(container);
    unmount();
    const r = render(<MarkdownStreaming />);
    await expectNoAxeViolations(r.container);
  });
});
