export interface CustomBlock {
  id: number;
  name: string;
  attributes: Record<string, string>;
  complete: boolean;
  start: number;
  end: number;
  children: CustomBlock[];
}

interface MarkdownNode {
  type: string;
  children?: MarkdownNode[];
  position?: { start: { offset?: number } };
  data?: { hName: string; hProperties: Record<string, number> };
}

/** Wrap the already-parsed blocks, keeping definitions in the same Markdown document. */
export function remarkCustomTags(blocks: CustomBlock[]) {
  function wrap(nodes: MarkdownNode[], ranges: CustomBlock[]): MarkdownNode[] {
    const result: MarkdownNode[] = [];
    let cursor = 0;
    for (const block of ranges) {
      while (cursor < nodes.length && (nodes[cursor]!.position?.start.offset ?? Infinity) < block.start)
        result.push(nodes[cursor++]!);
      const children: MarkdownNode[] = [];
      while (cursor < nodes.length && (nodes[cursor]!.position?.start.offset ?? Infinity) < block.end)
        children.push(nodes[cursor++]!);
      result.push({
        type: 'markdownCustomTag',
        data: { hName: 'markdown-custom-tag', hProperties: { dataMarkdownTag: block.id } },
        children: wrap(children, block.children),
      });
    }
    return result.concat(nodes.slice(cursor));
  }
  return () => (tree: MarkdownNode) => {
    tree.children = wrap(tree.children ?? [], blocks);
  };
}

interface TagLine {
  start: number;
  end: number;
  name: string;
  closing: boolean;
  attributes: Record<string, string>;
  close?: number;
}

/** Sticky tokenisation never retries a malformed attribute at every later character. */
function attributesFrom(text: string): Record<string, string> | undefined {
  const attributes: Record<string, string> = Object.create(null);
  const attribute = /\s+([a-z_:][\w:.-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/giy;
  let offset = 0;
  while (offset < text.length) {
    attribute.lastIndex = offset;
    const match = attribute.exec(text);
    if (!match) return text.slice(offset).trim() ? undefined : attributes;
    offset = attribute.lastIndex;
    const name = match[1]!.toLowerCase();
    if (name !== 'style' && !name.startsWith('on')) attributes[name] = match[2] ?? match[3] ?? match[4] ?? '';
  }
  return attributes;
}

/**
 * Scan whole lines once, outside fences. Only registered, paired blocks (or a streaming
 * partial block) consume source. Every other byte stays in the normal Markdown pipeline.
 * Pairing first avoids reparsing arbitrary CommonMark HTML nodes or repeatedly searching tails.
 */
export function scanCustomTags(source: string, names: ReadonlySet<string>, streaming: boolean) {
  const byId: Record<number, CustomBlock> = Object.create(null);
  if (!names.size) return { source, blocks: [], byId };
  const tags: TagLine[] = [];
  let offset = 0;
  let fence: { marker: string; length: number } | undefined;
  for (const line of source.split('\n')) {
    const end = Math.min(source.length, offset + line.length + 1);
    const delimiter = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (delimiter) {
      const marker = delimiter[1]!;
      if (!fence) fence = { marker: marker[0]!, length: marker.length };
      else if (marker[0] === fence.marker && marker.length >= fence.length && !delimiter[2]!.trim()) fence = undefined;
    } else if (!fence) {
      const tag = /^ {0,3}<(\/?)([a-z][\w-]*)(?=[\s>])/i.exec(line);
      const name = tag?.[2]?.toLowerCase();
      const tail = line.trimEnd();
      if (tag && name && names.has(name) && tail.endsWith('>')) {
        const closing = tag[1] === '/';
        const text = tail.slice(tag[0].length, -1);
        const attributes = closing ? (text.trim() ? undefined : {}) : attributesFrom(text);
        if (attributes) tags.push({ start: offset, end, name, closing, attributes });
      }
    }
    offset = end;
  }
  const closes = new Map<string, number[]>();
  for (let i = tags.length - 1; i >= 0; i--) {
    const tag = tags[i]!;
    const pending = closes.get(tag.name) ?? [];
    if (tag.closing) {
      pending.push(i);
      closes.set(tag.name, pending);
    } else tag.close = pending.pop();
  }
  const masks: { start: number; end: number }[] = [];
  function blocks(end: number, from: number, to: number): CustomBlock[] {
    const result: CustomBlock[] = [];
    for (let i = from; i < to; i++) {
      const tag = tags[i]!;
      if (tag.closing) continue;
      const close = tag.close !== undefined && tag.close < to ? tags[tag.close] : undefined;
      if (!close && !streaming) continue;
      masks.push(tag);
      const block: CustomBlock = {
        id: i,
        name: tag.name,
        attributes: tag.attributes,
        complete: !!close,
        start: tag.start,
        end: close?.end ?? end,
        children: blocks(close?.start ?? end, i + 1, close ? tag.close! : to),
      };
      if (close) masks.push(close);
      byId[block.id] = block;
      result.push(block);
      i = close ? tag.close! : to;
    }
    return result;
  }
  const ranges = blocks(source.length, 0, tags.length);
  const parts: string[] = [];
  let cursor = 0;
  for (const mask of masks) {
    parts.push(source.slice(cursor, mask.start), source.slice(mask.start, mask.end).replace(/[^\r\n]/g, ' '));
    cursor = mask.end;
  }
  parts.push(source.slice(cursor));
  // Preserve every source offset (including code fences) and parse exactly once. Only valid
  // registered delimiters become blank lines; unknown HTML retains CommonMark handling.
  return { source: parts.join(''), blocks: ranges, byId };
}
