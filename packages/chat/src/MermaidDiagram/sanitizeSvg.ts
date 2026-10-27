const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
// Static SVG only: no HTML integration points, external resources or animation.
const elements = new Set(
  'svg g defs style title desc path rect circle ellipse line polyline polygon text tspan textPath marker clipPath mask pattern linearGradient radialGradient stop symbol use a'
    .toLowerCase()
    .split(' '),
);
const attributes = new Set(
  'id class style role viewBox width height x y x1 y1 x2 y2 dx dy cx cy r rx ry d points transform fill fill-opacity fill-rule stroke stroke-width stroke-opacity stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit opacity font-family font-size font-weight font-style text-anchor dominant-baseline alignment-baseline textLength lengthAdjust marker-start marker-mid marker-end markerWidth markerHeight markerUnits refX refY orient clip-path clipPathUnits mask maskUnits maskContentUnits patternUnits patternContentUnits patternTransform preserveAspectRatio gradientUnits gradientTransform offset stop-color stop-opacity href xmlns xmlns:xlink xlink:href color overflow visibility direction unicode-bidi'
    .toLowerCase()
    .split(' '),
);

function safeCss(value: string): boolean {
  // CSS escapes/comments can disguise a protocol. Only local fragment URLs survive.
  const withoutFragments = value.replace(/url\(\s*(['"]?)#[\w.-]+\1\s*\)/gi, '');
  return !/[\\@<>]|\/\*|(?:expression|image-set|src)\s*\(|(?:java|vb)script\s*:|(?:https?|data):|url\s*\(/i.test(
    withoutFragments,
  );
}

function staticCss(value: string): string {
  // Mermaid includes keyframes even for static graphs. Discard those balanced
  // blocks, preserving the surrounding token-based styles. Fail closed on CSS
  // escapes, other at-rules or malformed blocks rather than interpreting them.
  const keyframes = /@(?:-[a-z]+-)?keyframes\b[^{}]*\{/gi;
  let match: RegExpExecArray | null;
  while ((match = keyframes.exec(value))) {
    let depth = 1;
    let end = keyframes.lastIndex;
    for (; end < value.length && depth; end++) {
      if (value[end] === '{') depth++;
      if (value[end] === '}') depth--;
    }
    if (depth) return '';
    value = value.slice(0, match.index) + value.slice(end);
    keyframes.lastIndex = match.index;
  }
  if (!safeCss(value)) return '';
  return value.replace(/\b(?:animation|transition)(?:-[a-z-]+)?\s*:[^;{}]*(?:;|(?=}))/gi, '');
}

/** Defence in depth after Mermaid's strict-mode sanitiser. Never receives raw source. */
export function sanitizeSvg(svg: string): string {
  const parsed = new DOMParser().parseFromString(svg, 'image/svg+xml');
  const root = parsed.documentElement;
  if (
    parsed.doctype ||
    parsed.querySelector('parsererror') ||
    root.localName !== 'svg' ||
    root.namespaceURI !== SVG_NAMESPACE
  ) {
    throw new Error('Invalid SVG');
  }
  for (const element of [root, ...root.querySelectorAll('*')]) {
    if (element.namespaceURI !== SVG_NAMESPACE || !elements.has(element.localName.toLowerCase())) {
      element.remove();
      continue;
    }
    if (element.localName.toLowerCase() === 'style') {
      const css = staticCss(element.textContent ?? '');
      if (!css) {
        element.remove();
        continue;
      }
      element.textContent = css;
    }
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      const value = name === 'style' ? staticCss(attribute.value) : attribute.value;
      if (name === 'style') attribute.value = value;
      const compact = Array.from(value)
        .filter((c) => c.charCodeAt(0) > 0x20 && !/\s/.test(c))
        .join('');
      if (
        name.startsWith('on') ||
        (!attributes.has(name) && !/^aria-[a-z-]+$/.test(name)) ||
        (/href$/.test(name) && !/^#[\w.-]+$/.test(value)) ||
        /(?:javascript|vbscript):/i.test(compact) ||
        (!safeCss(value) && name !== 'xmlns' && name !== 'xmlns:xlink')
      )
        element.removeAttributeNode(attribute);
    }
  }
  return new XMLSerializer().serializeToString(root);
}
