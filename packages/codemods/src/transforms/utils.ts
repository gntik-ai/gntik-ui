import type { Collection, JSCodeshift, JSXOpeningElement } from 'jscodeshift';

/** Local names bound to `imported` from any of the given sources (`import { imported as local }`). */
export function importedLocals(j: JSCodeshift, root: Collection, sources: (source: string) => boolean, imported: string): Set<string> {
  const names = new Set<string>();
  root.find(j.ImportDeclaration).forEach((p) => {
    const source = p.node.source.value;
    if (typeof source !== 'string' || !sources(source)) return;
    for (const s of p.node.specifiers ?? []) {
      if (s.type === 'ImportSpecifier' && nameOf(s.imported) === imported) names.add(s.local ? nameOf(s.local) : imported);
    }
  });
  return names;
}

/** The plain element name of a JSX opening element (`Foo`, not `a.Foo`), or null. */
export function jsxName(el: JSXOpeningElement): string | null {
  return el.name.type === 'JSXIdentifier' ? el.name.name : null;
}

export function hasAttribute(el: JSXOpeningElement, name: string): boolean {
  return (el.attributes ?? []).some((a) => a.type === 'JSXAttribute' && a.name.type === 'JSXIdentifier' && a.name.name === name);
}

export function hasSpread(el: JSXOpeningElement): boolean {
  return (el.attributes ?? []).some((a) => a.type === 'JSXSpreadAttribute');
}

export function line(node: { loc?: { start: { line: number } } | null }): number {
  return node.loc?.start.line ?? 0;
}

/** An identifier's name as a string (the AST types allow nested identifier kinds). */
export function nameOf(id: { name: unknown }): string {
  return typeof id.name === 'string' ? id.name : '';
}
