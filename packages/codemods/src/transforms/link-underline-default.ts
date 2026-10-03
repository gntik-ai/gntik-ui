import type { API, FileInfo } from 'jscodeshift';
import type { Codemod, CodemodMeta } from '../types.js';
import { hasAttribute, hasSpread, importedLocals, jsxName, line } from './utils.js';

export const meta: CodemodMeta = {
  id: 'link-underline-default',
  package: '@gntik-ai/ui',
  fromVersion: '0.1.0',
  toVersion: '0.2.0',
  description:
    'Link is underlined by default (underline="always", WCAG 1.4.1). Report only: lists <Link> usages without `underline` so standalone links (nav, cards, menus) can opt out with underline="hover" or "none".',
  reportOnly: true,
};

export function transform(file: FileInfo, api: API): null {
  const j = api.jscodeshift;
  const root = j(file.source);
  const names = importedLocals(j, root, (s) => s === '@gntik-ai/ui', 'Link');
  if (!names.size) return null;
  root.find(j.JSXOpeningElement).forEach((p) => {
    const el = p.node;
    const name = jsxName(el);
    if (!name || !names.has(name) || hasAttribute(el, 'underline')) return;
    const spread = hasSpread(el) ? ' (spread props may set it)' : '';
    api.report(`line ${line(el)}: <${name}> without underline now renders underlined${spread}; keep it for inline links, pass underline="hover" or "none" for standalone ones.`);
  });
  return null;
}

export const parser = 'tsx';
export default transform;
export const codemod: Codemod = { meta, transform };
