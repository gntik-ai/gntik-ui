import type { API, ASTPath, FileInfo, Identifier, JSXIdentifier } from 'jscodeshift';
import type { Codemod, CodemodMeta } from '../types.js';
import { nameOf } from './utils.js';

export const meta: CodemodMeta = {
  id: 'templates-renamed-ids',
  package: '@gntik-ai/templates',
  fromVersion: '0.1.0',
  toVersion: '0.2.0',
  description:
    'Template ids flow-builder and mfa-challenge became workflow-builder and mfa: renames FlowBuilderPage → WorkflowBuilderPage, MfaChallengePage → MfaPage and their template metas in imports from @gntik-ai/templates.',
  reportOnly: false,
};

export const RENAMES: Readonly<Record<string, string>> = {
  FlowBuilderPage: 'WorkflowBuilderPage',
  MfaChallengePage: 'MfaPage',
  flowBuilderTemplateMeta: 'workflowBuilderTemplateMeta',
  mfaChallengeTemplateMeta: 'mfaTemplateMeta',
};

const SOURCE = '@gntik-ai/templates';

/** True for identifier positions that are not a reference to a binding (`a.name`, `{ name: x }` keys). */
function isNonReference(path: ASTPath<Identifier | JSXIdentifier>): boolean {
  const parent = path.parent?.node as { type: string; property?: unknown; key?: unknown; computed?: boolean; shorthand?: boolean; name?: unknown } | undefined;
  if (!parent) return false;
  const node = path.node;
  if ((parent.type === 'MemberExpression' || parent.type === 'OptionalMemberExpression' || parent.type === 'JSXMemberExpression') && parent.property === node && !parent.computed) return true;
  if ((parent.type === 'ObjectProperty' || parent.type === 'Property' || parent.type === 'ClassProperty' || parent.type === 'ObjectMethod' || parent.type === 'TSPropertySignature') && parent.key === node && !parent.computed) return true;
  if (parent.type === 'JSXAttribute' && parent.name === node) return true;
  if (parent.type === 'ImportSpecifier' || parent.type === 'ExportSpecifier') return true;
  return false;
}

export function transform(file: FileInfo, api: API): string | null {
  const j = api.jscodeshift;
  const root = j(file.source);
  let changed = false;
  const renameLocals = new Map<string, string>();
  const bound = new Set<string>();
  root.find(j.Identifier).forEach((p) => {
    bound.add(p.node.name);
  });

  root.find(j.ImportDeclaration, { source: { value: SOURCE } }).forEach((p) => {
    for (const s of p.node.specifiers ?? []) {
      if (s.type !== 'ImportSpecifier') continue;
      const old = nameOf(s.imported);
      const to = RENAMES[old];
      if (!to) continue;
      const local = s.local ? nameOf(s.local) : old;
      s.imported = j.identifier(to);
      if (local === old && !bound.has(to)) {
        s.local = j.identifier(to);
        renameLocals.set(old, to);
      } else {
        // Keep the existing local name (aliased import, or the new name is already taken).
        s.local = j.identifier(local);
      }
      changed = true;
    }
  });

  root.find(j.ExportNamedDeclaration, { source: { value: SOURCE } }).forEach((p) => {
    const specifiers = p.node.specifiers ?? [];
    specifiers.forEach((s, i) => {
      if (s.type !== 'ExportSpecifier') return;
      const old = nameOf(s.local ?? s.exported);
      const to = RENAMES[old];
      if (!to) return;
      // Re-exports keep their public name so consumers of this module don't break.
      specifiers[i] = j.exportSpecifier.from({ local: j.identifier(to), exported: j.identifier(nameOf(s.exported)) });
      changed = true;
    });
  });

  if (renameLocals.size) {
    const rename = (p: ASTPath<Identifier | JSXIdentifier>) => {
      const to = renameLocals.get(p.node.name);
      if (!to || isNonReference(p)) return;
      const parent = p.parent?.node as { type: string; shorthand?: boolean; value?: unknown } | undefined;
      // `{ FlowBuilderPage }` keeps its key: `{ FlowBuilderPage: WorkflowBuilderPage }`.
      if (parent && (parent.type === 'ObjectProperty' || parent.type === 'Property') && parent.shorthand) parent.shorthand = false;
      p.node.name = to;
    };
    root.find(j.Identifier).forEach(rename);
    root.find(j.JSXIdentifier).forEach(rename);
  }

  return changed ? root.toSource({ quote: 'single' }) : null;
}

export const parser = 'tsx';
export default transform;
export const codemod: Codemod = { meta, transform };
