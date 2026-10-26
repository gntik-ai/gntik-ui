import { createShikiHighlighter } from './index';

it('loads YAML lazily and maps keys and quoted string content without altering source', async () => {
  const highlighter = createShikiHighlighter();
  const code = 'name: "api"\nreplicas: 2\n# comment';
  expect(highlighter.tokenize(code, 'yaml')).toBeNull();
  expect(await highlighter.load?.('yaml')).toBe(true);
  const lines = highlighter.tokenize(code, 'yaml')!;
  expect(lines.map((line) => line.map((token) => token.value).join('')).join('\n')).toBe(code);
  expect(lines[0]).toContainEqual({ kind: 'property', value: 'name' });
  expect(
    lines[0]
      ?.filter((token) => token.kind === 'string')
      .map((token) => token.value)
      .join(''),
  ).toContain('api');
  expect(lines[1]).toContainEqual({ kind: 'number', value: '2' });
  expect(lines[2]).toContainEqual({ kind: 'comment', value: ' comment' });
  // Delimiter scopes are innermost, so they remain punctuation.
  expect(lines[2]).toContainEqual({ kind: 'punctuation', value: '#' });
  expect(highlighter.tokenize('const x = 1', 'ts')).toBeNull();
  expect(await highlighter.load?.('ts')).toBe(false);
  expect(await highlighter.load?.('cobol')).toBe(false);
});

it('preserves Python grammar state across a three-line string and maps function names', async () => {
  const highlighter = createShikiHighlighter();
  expect(await highlighter.load?.('py')).toBe(true);
  const code = 'def greet():\n    """first\n    second\n    third"""\n    return True';
  const lines = highlighter.tokenize(code, 'python')!;
  expect(lines.map((line) => line.map((token) => token.value).join('')).join('\n')).toBe(code);
  expect(lines[0]).toContainEqual({ kind: 'keyword', value: 'def' });
  expect(lines[0]).toContainEqual({ kind: 'function', value: 'greet' });
  for (const index of [1, 2, 3]) {
    expect(lines[index]?.some((token) => token.kind === 'string')).toBe(true);
  }
  expect(lines[4]).toContainEqual({ kind: 'number', value: 'True' });
});

it.each([
  ['golang', 'go', 'func greet() {}', 'func'],
  ['postgresql', 'sql', 'SELECT name FROM users;', 'SELECT'],
  ['yml', 'yaml', 'name: "api"', 'name'],
])('loads %s as an alias of %s', async (alias, language, code, word) => {
  const highlighter = createShikiHighlighter();
  expect(await highlighter.load?.(alias)).toBe(true);
  expect(highlighter.tokenize(code, alias)).toEqual(highlighter.tokenize(code, language));
  const tokens = highlighter.tokenize(code, language)!.flat();
  expect(tokens).toContainEqual({ kind: language === 'yaml' ? 'property' : 'keyword', value: word });
});

it('shares concurrent canonical and alias loads and supports additional grammars', async () => {
  const yamlLoader = vi.fn(() => import('shiki/langs/yaml.mjs').then((module) => module.default));
  const tsLoader = vi.fn(() => import('shiki/langs/typescript.mjs').then((module) => module.default));
  const highlighter = createShikiHighlighter({ languages: { yaml: yamlLoader, typescript: tsLoader } });
  expect(yamlLoader).not.toHaveBeenCalled();
  expect(tsLoader).not.toHaveBeenCalled();
  expect(
    await Promise.all([highlighter.load?.('yaml'), highlighter.load?.('yml'), highlighter.load?.('yaml')]),
  ).toEqual([true, true, true]);
  expect(yamlLoader).toHaveBeenCalledTimes(1);
  expect(tsLoader).not.toHaveBeenCalled();
  expect(await highlighter.load?.('typescript')).toBe(true);
  expect(highlighter.tokenize('const answer = 42;', 'typescript')?.flat()).toContainEqual({
    kind: 'keyword',
    value: 'const',
  });
});

it('keeps unavailable grammars safe and caches their failures', async () => {
  const loader = vi.fn(() => Promise.reject(new Error('grammar unavailable')));
  const highlighter = createShikiHighlighter({ languages: { broken: loader } });
  expect(await highlighter.load?.('broken')).toBe(false);
  expect(await highlighter.load?.('broken')).toBe(false);
  expect(loader).toHaveBeenCalledTimes(1);
  expect(highlighter.tokenize('unchanged', 'broken')).toBeNull();
  expect(await highlighter.load?.('constructor')).toBe(false);
  expect(await highlighter.load?.('__proto__')).toBe(false);
});
