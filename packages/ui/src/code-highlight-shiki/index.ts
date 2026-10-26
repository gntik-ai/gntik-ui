import type { HighlighterCore, LanguageInput, ThemedTokenScopeExplanation } from 'shiki';
import type { CodeHighlighter } from '../components/CodeBlock/CodeHighlighterProvider';
import type { CodeToken, TokenKind } from '../components/CodeBlock/tokenize';

export interface ShikiHighlighterOptions {
  /** Additional grammars keyed by their language id; overrides the corresponding default loader. */
  languages?: Record<string, () => Promise<LanguageInput>>;
}

const defaultLanguages: Record<string, () => Promise<LanguageInput>> = {
  yaml: () => import('shiki/langs/yaml.mjs').then((module) => module.default),
  python: () => import('shiki/langs/python.mjs').then((module) => module.default),
  go: () => import('shiki/langs/go.mjs').then((module) => module.default),
  sql: () => import('shiki/langs/sql.mjs').then((module) => module.default),
};
const aliases: Record<string, string> = { yml: 'yaml', py: 'python', golang: 'go', postgresql: 'sql' };
const scopeKinds: readonly (readonly [string, TokenKind])[] = [
  ['comment', 'comment'],
  ['string', 'string'],
  ['constant.numeric', 'number'],
  ['constant.language', 'number'],
  ['keyword', 'keyword'],
  ['storage', 'keyword'],
  ['entity.name.function', 'function'],
  ['support.function', 'function'],
  ['entity.name.type', 'type'],
  ['entity.name.class', 'type'],
  ['support.type.property-name', 'property'],
  ['support.type', 'type'],
  ['support.class', 'type'],
  ['entity.name.tag', 'property'],
  ['variable.other.property', 'property'],
  ['punctuation', 'punctuation'],
];

function kindForScopes(scopes: ThemedTokenScopeExplanation[]): TokenKind {
  for (let index = scopes.length - 1; index >= 0; index--) {
    const scope = scopes[index]?.scopeName;
    for (const [prefix, kind] of scopeKinds) {
      if (scope === prefix || scope?.startsWith(`${prefix}.`)) return kind;
    }
  }
  return 'plain';
}

/** Optional-peer adapter. No Shiki runtime, regex engine or grammar is imported until load(). */
export function createShikiHighlighter(options: ShikiHighlighterOptions = {}): CodeHighlighter {
  const languages = { ...defaultLanguages, ...options.languages };
  const normalize = (language: string) => {
    const id = language.toLowerCase();
    return Object.hasOwn(languages, id) ? id : Object.hasOwn(aliases, id) ? aliases[id]! : id;
  };
  const loads = new Map<string, Promise<boolean>>();
  const loaded = new Set<string>();
  let core: HighlighterCore | undefined;
  let corePromise: Promise<HighlighterCore> | undefined;
  const getCore = () => {
    corePromise ??= Promise.all([import('shiki/core'), import('shiki/engine/javascript')]).then(
      async ([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) => {
        core = await createHighlighterCore({
          engine: createJavaScriptRegexEngine(),
          themes: [{ name: 'kit-token-scopes', settings: [] }],
          langs: [],
        });
        return core;
      },
    );
    return corePromise;
  };

  return {
    load(language) {
      const id = normalize(language);
      if (!Object.hasOwn(languages, id)) return Promise.resolve(false);
      let promise = loads.get(id);
      if (!promise) {
        promise = Promise.all([getCore(), languages[id]!()])
          .then(async ([highlighter, grammar]) => {
            await highlighter.loadLanguage(grammar);
            if (!highlighter.getLoadedLanguages().includes(id)) return false;
            loaded.add(id);
            return true;
          })
          .catch(() => false);
        loads.set(id, promise);
      }
      return promise;
    },
    tokenize(code, language) {
      const id = normalize(language);
      if (!core || !loaded.has(id)) return null;
      try {
        return core
          .codeToTokensBase(code, { lang: id, theme: 'kit-token-scopes', includeExplanation: 'scopeName' })
          .map((line) => {
            const tokens: CodeToken[] = [];
            for (const token of line) {
              const parts = token.explanation?.map((part) => ({
                kind: kindForScopes(part.scopes),
                value: part.content,
              })) ?? [{ kind: 'plain' as const, value: token.content }];
              for (const part of parts) {
                const previous = tokens[tokens.length - 1];
                if (previous?.kind === part.kind) previous.value += part.value;
                else tokens.push(part);
              }
            }
            return tokens;
          });
      } catch {
        return null;
      }
    },
  };
}
