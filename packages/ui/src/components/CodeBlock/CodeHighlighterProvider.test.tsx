import { act, render, screen, waitFor } from '@testing-library/react';
import { CodeBlock, CodeHighlighterProvider, useCodeHighlighter, type CodeHighlighter } from './index';

const yaml = 'name: "api"\nreplicas: 2';
const yamlTokens = [
  [
    { kind: 'property' as const, value: 'name' },
    { kind: 'plain' as const, value: ': ' },
    { kind: 'string' as const, value: '"api"' },
  ],
  [{ kind: 'plain' as const, value: 'replicas: 2' }],
];

function HookBlock() {
  const highlighter = useCodeHighlighter();
  return <CodeBlock code="name" language="yaml" showLineNumbers={Boolean(highlighter)} />;
}

describe('CodeHighlighterProvider', () => {
  it('tokenizes whole source and memoizes across unrelated re-renders', () => {
    const tokenize = vi.fn(() => yamlTokens);
    const tree = (filename: string) => (
      <CodeHighlighterProvider highlighter={{ tokenize }}>
        <CodeBlock code={yaml} language="yaml" filename={filename} />
      </CodeHighlighterProvider>
    );
    const highlighter = { tokenize };
    const view = (filename: string) => (
      <CodeHighlighterProvider highlighter={highlighter}>
        <CodeBlock code={yaml} language="yaml" filename={filename} />
      </CodeHighlighterProvider>
    );
    const { rerender } = render(view('one.yaml'));
    expect(screen.getByText('name')).toHaveClass('text-primary-text');
    expect(screen.getByText('"api"')).toHaveClass('text-warning-text');
    expect(tokenize).toHaveBeenCalledExactlyOnceWith(yaml, 'yaml');
    rerender(view('two.yaml'));
    expect(tokenize).toHaveBeenCalledTimes(1);
    // Changing the instance invalidates the memo, even with the same tokenize function.
    rerender(tree('three.yaml'));
    expect(tokenize).toHaveBeenCalledTimes(2);
  });

  it('preserves the per-line highlight override and never calls the provider', () => {
    const highlighter: CodeHighlighter = { tokenize: vi.fn(), load: vi.fn() };
    const highlight = vi.fn((line: string) => <mark>{line}</mark>);
    render(
      <CodeHighlighterProvider highlighter={highlighter}>
        <CodeBlock code={'a\nb'} language="yaml" highlight={highlight} />
      </CodeHighlighterProvider>,
    );
    expect(highlight.mock.calls).toEqual([
      ['a', 'yaml'],
      ['b', 'yaml'],
    ]);
    expect(screen.getByText('b').tagName).toBe('MARK');
    expect(highlighter.tokenize).not.toHaveBeenCalled();
    expect(highlighter.load).not.toHaveBeenCalled();
  });

  it('exposes the highlighter to consumers and keeps provider-free markup identical', () => {
    const highlighter: CodeHighlighter = { tokenize: () => null };
    const { container, rerender } = render(<CodeBlock code={'const n = 42;\n'} language="ts" showLineNumbers />);
    const original = container.innerHTML;
    rerender(
      <CodeHighlighterProvider highlighter={highlighter}>
        <CodeBlock code={'const n = 42;\n'} language="ts" showLineNumbers />
      </CodeHighlighterProvider>,
    );
    expect(container.innerHTML).toBe(original);
    rerender(
      <CodeHighlighterProvider highlighter={highlighter}>
        <HookBlock />
      </CodeHighlighterProvider>,
    );
    expect(screen.getByText('1')).toHaveAttribute('aria-hidden', 'true');
  });
});

function deferredLoad() {
  let finish!: (loaded: boolean) => void;
  const promise = new Promise<boolean>((resolve) => {
    finish = resolve;
  });
  return { promise, finish };
}

describe('lazy provider languages', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('renders fallback first, shares one load across blocks, then preserves text and lines', async () => {
    const pending = deferredLoad();
    let loaded = false;
    const highlighter: CodeHighlighter = {
      tokenize: () => (loaded ? yamlTokens : null),
      load: vi.fn(() =>
        pending.promise.then((value) => {
          loaded = value;
          return value;
        }),
      ),
    };
    const blocks = (
      <>
        <CodeBlock code={yaml} language="yaml" />
        <CodeBlock code={yaml} language="yaml" />
      </>
    );
    const { container, rerender } = render(
      <CodeHighlighterProvider highlighter={highlighter}>{blocks}</CodeHighlighterProvider>,
    );
    const text = [...container.querySelectorAll('code')].map((code) => code.textContent);
    expect(container.querySelectorAll('code .text-warning-text')).toHaveLength(0);
    await waitFor(() => expect(highlighter.load).toHaveBeenCalledExactlyOnceWith('yaml'));
    await act(async () => pending.finish(true));
    expect(screen.getAllByText('"api"')).toHaveLength(2);
    expect(screen.getAllByText('"api"')[0]).toHaveClass('text-warning-text');
    expect(container.querySelectorAll('[data-line]')).toHaveLength(4);
    expect([...container.querySelectorAll('code')].map((code) => code.textContent)).toEqual(text);
    rerender(
      <CodeHighlighterProvider highlighter={highlighter}>
        {blocks}
        <CodeBlock code={yaml} language="yaml" />
      </CodeHighlighterProvider>,
    );
    expect(highlighter.load).toHaveBeenCalledTimes(1);
  });

  it.each(['false', 'reject'] as const)('warns once per unavailable language when load returns %s', async (mode) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const language = mode === 'false' ? 'cobol' : 'unavailable-rejection';
    const highlighter: CodeHighlighter = {
      tokenize: () => null,
      load: vi.fn(() => (mode === 'false' ? Promise.resolve(false) : Promise.reject(new Error('unsupported')))),
    };
    const view = () => (
      <CodeHighlighterProvider highlighter={highlighter}>
        <CodeBlock code="unchanged" language={language} />
        <CodeBlock code="unchanged" language={language} />
      </CodeHighlighterProvider>
    );
    const { rerender } = render(view());
    await waitFor(() => expect(warn).toHaveBeenCalledTimes(1));
    expect(warn.mock.calls[0]?.[0]).toContain(language);
    rerender(view());
    await act(async () => {});
    expect(warn).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText('unchanged')).toHaveLength(2);
    // A different instance still uses the per-page warning budget.
    rerender(
      <CodeHighlighterProvider highlighter={{ tokenize: () => null, load: () => Promise.resolve(false) }}>
        <CodeBlock code="unchanged" language={language} />
      </CodeHighlighterProvider>,
    );
    await act(async () => {});
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('keeps built-in colours without warning and never warns in production', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const highlighter: CodeHighlighter = { tokenize: () => null, load: vi.fn(() => Promise.resolve(false)) };
    const { rerender } = render(
      <CodeHighlighterProvider highlighter={highlighter}>
        <CodeBlock code="const n = 42;" language="ts" />
      </CodeHighlighterProvider>,
    );
    await waitFor(() => expect(highlighter.load).toHaveBeenCalled());
    await act(async () => {});
    expect(screen.getByText('const')).toHaveClass('text-primary-text');
    expect(warn).not.toHaveBeenCalled();
    vi.stubEnv('NODE_ENV', 'production');
    rerender(
      <CodeHighlighterProvider highlighter={highlighter}>
        <CodeBlock code="unchanged" language="cobol-production" />
      </CodeHighlighterProvider>,
    );
    await act(async () => {});
    expect(warn).not.toHaveBeenCalled();
  });

  it('isolates caches by instance and ignores load completion after unmount', async () => {
    const pending = deferredLoad();
    const first: CodeHighlighter = { tokenize: () => null, load: vi.fn(() => pending.promise) };
    const second: CodeHighlighter = { tokenize: () => null, load: vi.fn(() => pending.promise) };
    const { unmount } = render(
      <>
        <CodeHighlighterProvider highlighter={first}>
          <CodeBlock code="x" language="yaml" />
        </CodeHighlighterProvider>
        <CodeHighlighterProvider highlighter={second}>
          <CodeBlock code="x" language="yaml" />
        </CodeHighlighterProvider>
      </>,
    );
    await waitFor(() => {
      expect(first.load).toHaveBeenCalledTimes(1);
      expect(second.load).toHaveBeenCalledTimes(1);
    });
    unmount();
    await act(async () => pending.finish(true));
  });
});

describe('provider token boundary', () => {
  it('accepts only token kinds and ignores supplied style, colour and class fields', () => {
    const highlighter: CodeHighlighter = {
      tokenize: () =>
        [
          [
            { kind: 'property', value: 'name', className: 'foreign', style: { color: 'red' }, color: 'red' },
            { kind: 'alien', value: ': ' },
            { kind: 'constructor', value: 'api' },
            { kind: '__proto__', value: '!' },
          ],
        ] as unknown as ReturnType<CodeHighlighter['tokenize']>,
    };
    const { container } = render(
      <CodeHighlighterProvider highlighter={highlighter}>
        <CodeBlock code="name: api!" language="yaml" showLineNumbers />
      </CodeHighlighterProvider>,
    );
    const code = container.querySelector('code')!;
    expect(screen.getByText('name')).toHaveClass('text-primary-text');
    expect(code.querySelectorAll('span[style]')).toHaveLength(1);
    expect(code.querySelector('span[style]')).toHaveAttribute('aria-hidden', 'true');
    expect([...code.querySelectorAll('[data-line] > span:last-child span')].map((span) => span.className)).toEqual([
      'text-primary-text',
    ]);
    expect(code.querySelector('[data-line] > span:last-child')?.textContent).toBe('name: api!');
    expect(code.querySelector('.foreign')).toBeNull();
  });

  it.each(
    [
      [[{ kind: 'keyword', value: 'changed' }]],
      [[{ kind: 'keyword', value: 'const n = 42;\nconst m = 3;' }]],
      [[{ kind: 'keyword', value: 'const n = 42;' }], [], [{ kind: 'plain', value: 'const m = 3;' }]],
      [[{ kind: 'plain', value: 123 }]],
      [null],
    ].map((tokens) => [tokens]),
  )('falls back to built-in tokens when text, lines or shape is invalid: %j', (tokens) => {
    const highlighter: CodeHighlighter = {
      tokenize: () => tokens as unknown as ReturnType<CodeHighlighter['tokenize']>,
    };
    const { container } = render(
      <CodeHighlighterProvider highlighter={highlighter}>
        <CodeBlock code={'const n = 42;\nconst m = 3;'} language="ts" />
      </CodeHighlighterProvider>,
    );
    expect(screen.getAllByText('const')).toHaveLength(2);
    expect(screen.getByText('42')).toHaveClass('text-destructive-text');
    expect(container.querySelectorAll('[data-line]')).toHaveLength(2);
    expect([...container.querySelectorAll('[data-line]')].map((line) => line.textContent)).toEqual([
      'const n = 42;',
      'const m = 3;',
    ]);
  });

  it('keeps the built-in fallback when a third-party tokenizer throws', () => {
    render(
      <CodeHighlighterProvider
        highlighter={{
          tokenize: () => {
            throw new Error('unsupported regex');
          },
        }}
      >
        <CodeBlock code="const n = 42;" language="ts" />
      </CodeHighlighterProvider>,
    );
    expect(screen.getByText('42')).toHaveClass('text-destructive-text');
  });
});
