import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoAxeViolations } from '../test/a11y';
import MarkdownReply from './examples/MarkdownReply';
import MarkdownStreaming from './examples/MarkdownStreaming';
import MarkdownCustom from './examples/MarkdownCustom';
import { I18nProvider } from '@gntik-ai/ui';
import { Markdown, repairStreamingMarkdown, safeUrl, useMarkdownContext } from './Markdown';
import type { MarkdownProps } from './Markdown';
import type { MarkdownCustomTagProps } from './Markdown';

function Reasoning({ children, attributes, complete, streaming }: MarkdownCustomTagProps) {
  return (
    <section
      data-testid="reasoning"
      data-attributes={JSON.stringify(attributes)}
      data-complete={String(complete)}
      data-streaming={String(streaming)}
      data-context={String(useMarkdownContext().streaming)}
    >
      {children}
    </section>
  );
}
const customTags = { think: Reasoning };

describe('Markdown opt-in HTML', () => {
  it('unwraps raw internal-looking tags without invoking a registered renderer', async () => {
    const { container } = render(
      <Markdown allowHtml customTags={customTags}>
        {
          '<think>\nPlan\n</think>\n\n<markdown-custom-tag data-markdown-tag="0">Keep this prose</markdown-custom-tag>\n\n<b>Loaded</b>'
        }
      </Markdown>,
    );
    await waitFor(() => expect(container.querySelector('b')).not.toBeNull());
    expect(screen.getAllByTestId('reasoning')).toHaveLength(1);
    expect(screen.getByTestId('reasoning')).toHaveTextContent('Plan');
    expect(container).toHaveTextContent('Keep this prose');
    expect(container.querySelector('markdown-custom-tag, [data-markdown-tag]')).toBeNull();
  });

  it('lazily renders the fixed subset and removes unsafe HTML, attributes and URLs', async () => {
    const { container, rerender } = render(
      <Markdown allowHtml>
        {
          '<b style="color:red" onclick="x">bold</b>\n\n<details open><summary>More</summary>x</details>\n\n<script>alert(1)</script>\n\n<iframe>bad frame</iframe>\n\n<img src=x onerror=alert(1)>\n\n<embed src=x>\n\n<a href="javascript:alert(1)">unsafe link</a>'
        }
      </Markdown>,
    );
    await waitFor(() => expect(container.querySelector('b')).toHaveTextContent('bold'));
    expect(screen.getByText('More').tagName).toBe('SUMMARY');
    expect(container.querySelector('details')).toHaveTextContent('Morex');
    expect(container.querySelector('script, iframe, img, embed, [style], [onclick], [onerror], a')).toBeNull();
    expect(container.textContent).toContain('unsafe link');
    expect(container.innerHTML).not.toContain('javascript:');
    rerender(<Markdown>{'<b>bold</b>'}</Markdown>);
    expect(container.querySelector('b')).toBeNull();
  });

  it('unwraps raw elements outside the subset without losing inline words or later paragraphs', async () => {
    const source =
      'Press <kbd>Ctrl</kbd>, see <a href="https://example.com/docs">the docs</a> and <code>npm i</code>.\n\n<div>\n\nInside\n\nLater paragraph\n\n<think>\n\nUnclosed\n\nFinal paragraph\n\n<b>Loaded</b>';
    const { container } = render(
      <Markdown allowHtml customTags={customTags}>
        {source}
      </Markdown>,
    );
    await waitFor(() => expect(container.querySelector('b')).toHaveTextContent('Loaded'));
    expect(container.textContent).toContain('Press Ctrl, see the docs and npm i.');
    expect(container.querySelector('a, code, think')).toBeNull();
    expect(screen.getByText('Inside')).toBeInTheDocument();
    expect(screen.getByText('Later paragraph')).toBeInTheDocument();
    expect(screen.getByText('Final paragraph')).toBeInTheDocument();
    expect(screen.queryByTestId('reasoning')).toBeNull();
  });

  it.each(['script', 'style', 'iframe', 'object', 'form', 'audio', 'video', 'svg', 'math', 'template', 'textarea'])(
    'drops %s content',
    async (tag) => {
      const { container } = render(
        <Markdown allowHtml>{`<${tag}>DROP THIS</${tag}>\n\nAfter\n\n<b>Loaded</b>`}</Markdown>,
      );
      await waitFor(() => expect(container.querySelector('b')).not.toBeNull());
      expect(container.querySelector(tag)).toBeNull();
      expect(container.textContent).not.toContain('DROP THIS');
      expect(screen.getByText('After')).toBeInTheDocument();
    },
  );

  it.each([
    '<br>',
    '<div>',
    '<kbd>Ctrl</kbd>',
    '<details>\n\nInside\n\n</details>',
    '<foo>\n\nBetween\n\n</foo>',
    '<think>\n\nUnclosed',
    '</think>',
  ])('keeps prose after %s with HTML enabled', async (tag) => {
    const { container } = render(
      <Markdown
        allowHtml
        customTags={customTags}
      >{`${tag}\n\nLater paragraph\n\nFinal paragraph\n\n<b>Loaded</b>`}</Markdown>,
    );
    await waitFor(() => expect(container.querySelector('b')).not.toBeNull());
    expect(screen.getByText('Later paragraph')).toBeInTheDocument();
    expect(screen.getByText('Final paragraph')).toBeInTheDocument();
    if (tag.includes('Between')) expect(screen.getByText('Between')).toBeInTheDocument();
  });

  it('preserves Markdown links, fences, GFM and custom tags with the HTML pipeline', async () => {
    const { container } = render(
      <Markdown allowHtml customTags={customTags}>
        {
          '<think>\nPlan **steps**\n</think>\n\n[guide](/docs)\n\n```ts\nconst x = 1\n```\n\n| A |\n| - |\n| B |\n\n<b>Loaded</b>'
        }
      </Markdown>,
    );
    await waitFor(() => expect(container.querySelector('b')).not.toBeNull());
    expect(screen.getByRole('link', { name: 'guide' })).toHaveAttribute('href', '/docs');
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
    expect(container.querySelector('section strong')).toHaveTextContent('steps');
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});

describe('Markdown custom tags', () => {
  it.each([false, true])(
    'preserves footnote and reference definitions across registered tags in one parse (allowHtml=%s)',
    async (allowHtml) => {
      const spy = vi.fn();
      const source =
        'Text[^1] and [link][ref].\n\n<think>\nPlan [guide][ref].\n</think>\n\n[^1]: Footnote prose\n\n[ref]: https://example.com\n\n<b>Loaded</b>';
      const { container } = render(
        <Markdown allowHtml={allowHtml} customTags={customTags} remarkPlugins={[() => spy]}>
          {source}
        </Markdown>,
      );
      if (allowHtml) {
        // The optional pipeline renders again once loaded; count a single parse per render.
        await waitFor(() => expect(container.querySelector('b')).not.toBeNull());
      }
      expect(screen.getByRole('link', { name: /^link/ })).toHaveAttribute('href', 'https://example.com');
      expect(screen.getByText('Footnote prose')).toBeInTheDocument();
      expect(screen.getByTestId('reasoning').querySelector('a')).toHaveAttribute('href', 'https://example.com');
      expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('data-footnote-ref');
      if (!allowHtml) expect(spy).toHaveBeenCalledTimes(1);
    },
  );

  it('keeps custom tags independent of an ordinary div override', () => {
    render(
      <Markdown customTags={customTags} components={{ div: ({ children }) => <aside>{children}</aside> }}>
        {'<think>\nPlan\n</think>'}
      </Markdown>,
    );
    expect(screen.getByTestId('reasoning')).toHaveTextContent('Plan');
  });

  it('accepts quoted attribute values containing angle brackets', () => {
    render(<Markdown customTags={customTags}>{'<think kind="x > 0" title=\'a < b\'>\nPlan\n</think>'}</Markdown>);
    expect(screen.getByTestId('reasoning')).toHaveAttribute('data-attributes', '{"kind":"x > 0","title":"a < b"}');
  });
  it.each(['', '\n'])('renders inner Markdown with %j padding and filters attributes', (padding) => {
    const { container } = render(
      <Markdown
        customTags={customTags}
      >{`<think onclick="x" ONFOCUS="x" style="color:red" kind="plan">\n${padding}Plan **steps**\n${padding}</think>\n\nAfter`}</Markdown>,
    );
    expect(screen.getByTestId('reasoning')).toHaveAttribute('data-attributes', '{"kind":"plan"}');
    expect(screen.getByTestId('reasoning')).toHaveAttribute('data-complete', 'true');
    expect(screen.getByTestId('reasoning')).toHaveAttribute('data-context', 'false');
    expect(container.querySelector('section strong')).toHaveTextContent('steps');
    expect(screen.getByText('After').closest('section')).toBeNull();
  });

  it('renders only registered partial blocks while streaming, and ignores tags in fences', () => {
    const { container, rerender } = render(
      <Markdown streaming customTags={customTags}>
        {'<think>\nPlanning'}
      </Markdown>,
    );
    expect(screen.getByTestId('reasoning')).toHaveTextContent('Planning');
    expect(screen.getByTestId('reasoning')).toHaveAttribute('data-complete', 'false');
    expect(screen.getByTestId('reasoning')).toHaveAttribute('data-streaming', 'true');
    expect(screen.getByTestId('reasoning')).toHaveAttribute('data-context', 'true');
    rerender(
      <Markdown customTags={customTags}>
        {'<foo>\n\nStill here\n\n</foo>\n\n```html\n<think>\ncode\n</think>\n```'}
      </Markdown>,
    );
    expect(container.querySelector('foo')).toBeNull();
    expect(screen.queryByTestId('reasoning')).toBeNull();
    expect(container.querySelector('pre')).toHaveTextContent('<think> code </think>');
    expect(screen.getByText('Still here')).toBeInTheDocument();
  });

  it.each([
    '<br>',
    '<div>',
    '<kbd>Ctrl</kbd>',
    '<details>\n\nInside\n\n</details>',
    '<foo>\n\nBetween\n\n</foo>',
    '<think>\n\nUnclosed',
    '</think>',
  ])('preserves the default prose for %s', (tag) => {
    const source = `Before\n\n${tag}\n\nLater paragraph\n\nFinal paragraph`;
    const baseline = render(<Markdown>{source}</Markdown>);
    const html = baseline.container.innerHTML;
    baseline.unmount();
    const extended = render(<Markdown customTags={customTags}>{source}</Markdown>);
    expect(extended.container.innerHTML).toBe(html);
    expect(screen.getByText('Later paragraph')).toBeInTheDocument();
    expect(screen.getByText('Final paragraph')).toBeInTheDocument();
  });

  it.each([false, true])('parses 800 HTML lines once, with a registered block=%s', (registered) => {
    const htmlLines = Array.from({ length: 800 }, (_, n) => `<b>Step ${n}</b>`).join('\n');
    const source = registered ? `<think>\n${htmlLines}\n\nVisible\n</think>` : htmlLines;
    const spy = vi.fn();
    const remarkPlugins = [() => spy];
    const baseline = render(<Markdown remarkPlugins={remarkPlugins}>{source}</Markdown>);
    const html = baseline.container.innerHTML;
    expect(spy).toHaveBeenCalledTimes(1);
    baseline.unmount();
    spy.mockClear();
    const extended = render(
      <Markdown customTags={customTags} remarkPlugins={remarkPlugins}>
        {source}
      </Markdown>,
    );
    if (registered) expect(screen.getByTestId('reasoning')).toHaveTextContent('Visible');
    else expect(extended.container.innerHTML).toBe(html);
    // Parse count is deterministic under CI load and catches document splitting too.
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('Markdown extensions', () => {
  it.each(['  ```chart', '~~~chart'])('marks a repaired %s fence incomplete', (opener) => {
    function Chart({ complete }: { complete: boolean }) {
      return <output>{String(complete)}</output>;
    }
    render(<Markdown streaming codeRenderers={{ chart: Chart }}>{`${opener}\npartial`}</Markdown>);
    expect(screen.getByRole('status')).toHaveTextContent('false');
  });

  it('provides a non-streaming context outside Markdown', () => {
    function Probe() {
      return <output>{String(useMarkdownContext().streaming)}</output>;
    }
    render(<Probe />);
    expect(screen.getByRole('status')).toHaveTextContent('false');
  });
  it('merges overrides, exposes context and enforces safety after hostile props', () => {
    function Callout({ children }: { children?: React.ReactNode }) {
      return <aside data-stream={String(useMarkdownContext().streaming)}>{children}</aside>;
    }
    const unsafeProps = { skipHtml: false, urlTransform: (url: string) => url };
    const { container, rerender } = render(
      <Markdown
        {...unsafeProps}
        streaming
        components={{
          blockquote: Callout,
          a: ({ href, children }) => <a href={href}>{children}</a>,
          img: ({ src }) => <span data-src={src} />,
        }}
      >
        {
          '> Heads up\n\n# Heading\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n[x](javascript:alert(1))\n\n![x](data:text/html,bad)\n\n<b>hidden</b>'
        }
      </Markdown>,
    );
    expect(container.querySelector('aside')).toHaveAttribute('data-stream', 'true');
    expect(container.querySelector('h1')).toHaveClass('font-semibold');
    expect(screen.getByRole('table')).toHaveClass('w-full');
    expect(container.querySelector('a')).toHaveAttribute('href', '');
    expect(container.querySelector('[data-src]')).toHaveAttribute('data-src', '');
    expect(container.querySelector('b')).toBeNull();
    rerender(<Markdown components={{ blockquote: Callout }}>{'> Heads up'}</Markdown>);
    expect(container.querySelector('aside')).toHaveAttribute('data-stream', 'false');
  });

  it('runs user remark after GFM and filters URLs created by user rehype', () => {
    let sawTable = false;
    const remark: NonNullable<MarkdownProps['remarkPlugins']> = [
      () => (tree: { children: { type: string }[] }) => {
        sawTable = tree.children.some((child) => child.type === 'table');
      },
    ];
    const rehype: NonNullable<MarkdownProps['rehypePlugins']> = [
      () => (tree: { children: unknown[] }) => {
        tree.children.push({
          type: 'element',
          tagName: 'a',
          properties: { href: 'javascript:alert(1)' },
          children: [{ type: 'text', value: 'Injected' }],
        });
      },
    ];
    const { container } = render(
      <Markdown remarkPlugins={remark} rehypePlugins={rehype}>
        {'| A |\n| - |\n| B |'}
      </Markdown>,
    );
    expect(sawTable).toBe(true);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Injected')).toBeInTheDocument();
    expect(container.innerHTML).not.toContain('javascript:');
  });

  it('maps fence languages case-insensitively and marks only the repaired fence incomplete', () => {
    function Chart(props: { code: string; language: string; streaming: boolean; complete: boolean }) {
      return (
        <output
          data-language={props.language}
          data-complete={String(props.complete)}
          data-streaming={String(props.streaming)}
          data-context={String(useMarkdownContext().streaming)}
        >
          {props.code}
        </output>
      );
    }
    const codeRenderers = { cHaRt: Chart };
    const { container, rerender } = render(
      <Markdown codeRenderers={codeRenderers}>{'```CHART\nclosed\n```\n\n```ts\nconst x = 1\n```'}</Markdown>,
    );
    expect(screen.getByText('closed')).toHaveAttribute('data-language', 'chart');
    expect(screen.getByText('closed')).toHaveAttribute('data-complete', 'true');
    expect(screen.getByText('closed')).toHaveAttribute('data-streaming', 'false');
    expect(screen.getByRole('button', { name: 'Copy code' })).toBeInTheDocument();
    expect(container.querySelector('pre')).toHaveTextContent('const x = 1');
    rerender(
      <Markdown streaming codeRenderers={codeRenderers}>
        {'```chart\nclosed\n```\n\n```chart\npartial'}
      </Markdown>,
    );
    expect(screen.getByText('closed')).toHaveAttribute('data-complete', 'true');
    expect(screen.getByText('partial')).toHaveAttribute('data-complete', 'false');
    expect(screen.getByText('partial')).toHaveAttribute('data-streaming', 'true');
    expect(screen.getByText('partial')).toHaveAttribute('data-context', 'true');
  });
});

describe('Markdown safety', () => {
  it('never renders raw HTML', () => {
    const { container } = render(
      <Markdown>
        {
          'Hello <script>alert(1)</script> <img src=x onerror="alert(2)"> <b>bold</b>\n\n<iframe src="https://evil.example"></iframe>'
        }
      </Markdown>,
    );
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
    expect(container.innerHTML).not.toContain('onerror');
  });

  it('strips javascript:, data: and vbscript: links', () => {
    const { container } = render(
      <Markdown>
        {
          '[a](javascript:alert(1)) [b](JaVaScRiPt:alert(1)) [c](data:text/html;base64,PHNjcmlwdD4=) [d](vbscript:x) <javascript:alert(1)>'
        }
      </Markdown>,
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
    expect(screen.getByRole('link', { name: /Image: usage chart/ })).toHaveAttribute(
      'href',
      'https://example.com/chart.png',
    );
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
  it.each(['rejected', 'missing'] as const)('reports a %s clipboard write as failed', async (failure) => {
    userEvent.setup();
    const clipboard = navigator.clipboard;
    if (failure === 'missing') Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    else vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));
    try {
      render(<Markdown>{'```ts\nconst a = 1;\n```'}</Markdown>);
      fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
      const button = await screen.findByRole('button', { name: 'Copy failed' });
      expect(button).toHaveTextContent('Copy failed');
      expect(screen.queryByText('Copied')).toBeNull();
      expect(button.querySelector('.lucide-check')).toBeNull();
    } finally {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
      vi.restoreAllMocks();
    }
  });
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
  it('keeps the code Copy button and keyboard focus across streaming updates', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Markdown streaming>{'```ts\nconst a = 1;'}</Markdown>);
    const copy = screen.getByRole('button', { name: 'Copy code' });
    await user.click(copy);
    expect(copy).toHaveFocus();
    expect(copy).toHaveAccessibleName('Copied code');

    rerender(<Markdown streaming>{'```ts\nconst a = 1;\nconst b = 2;'}</Markdown>);
    expect(screen.getByRole('button', { name: 'Copied code' })).toBe(copy);
    expect(copy).toHaveFocus();
  });

  it.each(['dark', 'light', 'high_contrast'])('custom example is axe clean in %s', async (theme) => {
    document.documentElement.className = theme;
    const { container } = render(<MarkdownCustom />);
    await waitFor(() => expect(container.querySelector('details')).not.toBeNull());
    await expectNoAxeViolations(container);
  });

  it('shows the custom example in Spanish', () => {
    render(
      <I18nProvider locale="es">
        <MarkdownCustom />
      </I18nProvider>,
    );
    expect(screen.getAllByRole('progressbar', { name: 'Gráfico de Markdown' })).toHaveLength(2);
  });
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
