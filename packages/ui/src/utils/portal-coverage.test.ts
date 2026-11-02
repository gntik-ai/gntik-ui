// Structural guard required by the scope contract; behavioral coverage lives in ThemeScope.test.tsx.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import ts from 'typescript';

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? files(path) : path.endsWith('.tsx') ? [path] : [];
  });
}

it('every Base UI Portal uses its enclosing component scope container', () => {
  let count = 0;
  for (const path of files(join(import.meta.dirname, '..'))) {
    const source = ts.createSourceFile(
      path,
      readFileSync(path, 'utf8'),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function visit(node: ts.Node) {
      if (
        (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
        /\.Portal$/.test(node.tagName.getText(source))
      ) {
        count++;
        let component: ts.Node | undefined = node.parent;
        while (
          component &&
          !ts.isFunctionDeclaration(component) &&
          !ts.isArrowFunction(component) &&
          !ts.isFunctionExpression(component)
        )
          component = component.parent;
        expect(component, path).toBeDefined();
        const hookBindings: string[] = [];
        function findHooks(part: ts.Node) {
          if (
            ts.isVariableDeclaration(part) &&
            part.initializer &&
            ts.isCallExpression(part.initializer) &&
            part.initializer.expression.getText(source) === 'usePortalContainer'
          )
            hookBindings.push(part.name.getText(source));
          ts.forEachChild(part, findHooks);
        }
        if (component) findHooks(component);
        expect(hookBindings, path).toHaveLength(1);
        const attr = node.attributes.properties.find(
          (p) => ts.isJsxAttribute(p) && p.name.getText(source) === 'container',
        );
        const value =
          attr && ts.isJsxAttribute(attr) && attr.initializer && ts.isJsxExpression(attr.initializer)
            ? attr.initializer.expression?.getText(source)
            : undefined;
        expect([hookBindings[0], `container ?? ${hookBindings[0]}`], path).toContain(value);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
  // WorkspaceSearch now reuses ComboboxContent's scoped Portal instead of owning one.
  expect(count).toBeGreaterThanOrEqual(18);
});

it('the full-screen Dropzone React portal uses the shared container with a body fallback', () => {
  const path = join(import.meta.dirname, '../components/Dropzone/Dropzone.tsx');
  const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let hookBinding: string | undefined;
  const destinations: string[] = [];
  function visit(node: ts.Node) {
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      node.initializer.expression.getText(source) === 'usePortalContainer'
    )
      hookBinding = node.name.getText(source);
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'createPortal')
      destinations.push(node.arguments[1]?.getText(source) ?? '');
    ts.forEachChild(node, visit);
  }
  visit(source);
  expect(hookBinding).toBeDefined();
  expect(destinations).toEqual([`${hookBinding} ?? document.body`]);
});
