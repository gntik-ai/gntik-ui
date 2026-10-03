import type { API, FileInfo } from 'jscodeshift';
import type { Codemod, CodemodMeta } from '../types.js';
import { hasAttribute, hasSpread, importedLocals, jsxName, line } from './utils.js';

export const meta: CodemodMeta = {
  id: 'flow-builder-controlled-console',
  package: '@gntik-ai/blocks',
  fromVersion: '0.1.0',
  toVersion: '0.2.0',
  description:
    'FlowBuilder `consoleEntries` is now controlled (pair it with onConsoleChange): `<FlowBuilder consoleEntries={x}>` without onConsoleChange becomes `defaultConsoleEntries={x}`.',
  reportOnly: false,
};

/** @gntik-ai/blocks, or a copied block (`…/FlowBuilder`, `…/builders`). */
const isFlowBuilderSource = (source: string) => source === '@gntik-ai/blocks' || /(^|\/)(FlowBuilder|builders)(\/index)?$/.test(source);

export function transform(file: FileInfo, api: API): string | null {
  const j = api.jscodeshift;
  const root = j(file.source);
  const names = importedLocals(j, root, isFlowBuilderSource, 'FlowBuilder');
  if (!names.size) return null;
  let changed = false;
  root.find(j.JSXOpeningElement).forEach((p) => {
    const el = p.node;
    const name = jsxName(el);
    if (!name || !names.has(name) || !hasAttribute(el, 'consoleEntries') || hasAttribute(el, 'onConsoleChange')) return;
    if (hasSpread(el)) {
      api.report(`line ${line(el)}: <${name} consoleEntries> with spread props was left as is; if the spread does not pass onConsoleChange, rename consoleEntries to defaultConsoleEntries.`);
      return;
    }
    for (const attr of el.attributes ?? []) {
      if (attr.type === 'JSXAttribute' && attr.name.type === 'JSXIdentifier' && attr.name.name === 'consoleEntries') {
        attr.name = j.jsxIdentifier('defaultConsoleEntries');
        changed = true;
      }
    }
  });
  return changed ? root.toSource({ quote: 'single' }) : null;
}

export const parser = 'tsx';
export default transform;
export const codemod: Codemod = { meta, transform };
