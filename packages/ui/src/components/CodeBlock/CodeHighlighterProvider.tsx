import { createContext, useContext, type ReactNode } from 'react';
import type { CodeToken } from './tokenize';

/** A whole-source tokenizer. Return null for languages that are unavailable or not handled. */
export interface CodeHighlighter {
  tokenize(code: string, language: string): CodeToken[][] | null;
  load?(language: string): Promise<boolean>;
}

export interface CodeHighlighterProviderProps {
  highlighter: CodeHighlighter;
  children: ReactNode;
}

const Context = createContext<CodeHighlighter | null>(null);

/** Shares an optional, token-coloured highlighter with every descendant CodeBlock. */
export function CodeHighlighterProvider({ highlighter, children }: CodeHighlighterProviderProps) {
  return <Context.Provider value={highlighter}>{children}</Context.Provider>;
}

export function useCodeHighlighter(): CodeHighlighter | null {
  return useContext(Context);
}

const loads = new WeakMap<CodeHighlighter, Map<string, Promise<boolean>>>();
const warnedLanguages = new Set<string>();

/** Internal shared promise cache; rejected loads are cached as unavailable too. */
export function loadCodeLanguage(highlighter: CodeHighlighter, language: string): Promise<boolean> {
  let languages = loads.get(highlighter);
  if (!languages) {
    languages = new Map();
    loads.set(highlighter, languages);
  }
  let promise = languages.get(language);
  if (!promise) {
    promise = Promise.resolve()
      .then(() => highlighter.load?.(language) ?? false)
      .catch(() => false);
    languages.set(language, promise);
  }
  return promise;
}

export function warnUnavailableLanguage(language: string) {
  if (process.env.NODE_ENV !== 'production' && !warnedLanguages.has(language)) {
    warnedLanguages.add(language);
    console.warn(`CodeBlock: no highlighter available for language "${language}".`);
  }
}
