import ts from 'typescript';

export interface LabelLiteral {
  file: string;
  line: number;
  kind: string;
  text: string;
}

/** Location-independent identity: unrelated edits must not make the baseline grow. */
export function labelLiteralKey({ file, kind, text }: LabelLiteral): string {
  return `${file}:${kind}:${text}`;
}

/** Scan syntax, rather than regex, so multiline JSX and function-valued defaults are covered. */
export function findLiteralLabels(source: string, file: string): LabelLiteral[] {
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const lines = source.split('\n');
  const found: LabelLiteral[] = [];
  const add = (node: ts.Node, kind: string, text: string) => {
    const line = ast.getLineAndCharacterOfPosition(node.getStart(ast)).line;
    // Explicit escape hatch for symbols/technical identifiers that have no translation.
    if (/i18n-literal-allow:/.test(lines[line] ?? '') || /i18n-literal-allow:/.test(lines[line - 1] ?? '')) return;
    if (text.trim()) found.push({ file, line: line + 1, kind, text });
  };
  const strings = (node: ts.Node, kind: string) => {
    // The message key and placeholder names are identifiers, not rendered literals.
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 't') return;
    if (ts.isStringLiteralLike(node)) {
      add(node, kind, node.text);
      return;
    }
    if (ts.isTemplateExpression(node)) {
      const text = [node.head.text, ...node.templateSpans.map((span) => span.literal.text)].join('');
      if (/\p{L}/u.test(text)) add(node, kind, node.getText(ast));
      // A nested conditional can contain English even when the surrounding template has none.
      for (const span of node.templateSpans) strings(span.expression, kind);
      return;
    }
    if (ts.isJsxExpression(node) && node.expression) strings(node.expression, kind);
    else if (ts.isPropertyAssignment(node)) strings(node.initializer, kind);
    else if (ts.isObjectLiteralExpression(node)) node.properties.forEach((prop) => strings(prop, kind));
    else if (ts.isArrayLiteralExpression(node)) node.elements.forEach((item) => strings(item, kind));
    else if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) strings(node.body, kind);
    else if (ts.isBlock(node)) node.statements.forEach((statement) => strings(statement, kind));
    else if (ts.isReturnStatement(node) && node.expression) strings(node.expression, kind);
    else if (ts.isConditionalExpression(node)) {
      strings(node.whenTrue, kind);
      strings(node.whenFalse, kind);
    } else if (
      ts.isBinaryExpression(node) &&
      [ts.SyntaxKind.PlusToken, ts.SyntaxKind.QuestionQuestionToken, ts.SyntaxKind.BarBarToken].includes(
        node.operatorToken.kind,
      )
    ) {
      strings(node.left, kind);
      strings(node.right, kind);
    } else if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node))
      strings(node.expression, kind);
    // Calls, element accesses and other expressions supply data; their argument strings are
    // not necessarily rendered (format options, property keys, translation keys, etc.).
  };

  const visit = (node: ts.Node) => {
    if (ts.isJsxAttribute(node) && ['aria-label', 'title'].includes(node.name.getText(ast)) && node.initializer) {
      strings(node.initializer, node.name.getText(ast));
    }
    if (
      ts.isVariableDeclaration(node) &&
      /labels/i.test(node.name.getText(ast)) &&
      node.initializer &&
      !node.type?.getText(ast).includes('MessageKey')
    ) {
      strings(node.initializer, 'labels');
    }
    if (
      ts.isBindingElement(node) &&
      node.initializer &&
      /^(label|emptyText|removeLabel|labels)$/i.test((node.propertyName ?? node.name).getText(ast))
    ) {
      strings(node.initializer, 'default');
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return found;
}

/** Both unexpected literals and stale exceptions fail; fixing a literal shrinks the baseline. */
export function checkLabelBaseline(literals: LabelLiteral[], baseline: readonly string[]): string[] {
  const actual = new Set(literals.map(labelLiteralKey));
  return [
    ...literals
      .filter((literal) => !baseline.includes(labelLiteralKey(literal)))
      .map(({ file, line, kind, text }) => `${file}:${line}: hard-coded default ${kind}: ${text}`),
    ...baseline.filter((key) => !actual.has(key)).map((key) => `Remove fixed baseline entry: ${key}`),
  ];
}
