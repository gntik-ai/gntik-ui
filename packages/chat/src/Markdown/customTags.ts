export type MarkdownSegment =
  | { type: 'markdown'; source: string }
  | { type: 'tag'; name: string; attributes: Record<string, string>; complete: boolean; children: MarkdownSegment[] };

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
export function splitCustomTags(source: string, names: ReadonlySet<string>, streaming: boolean): MarkdownSegment[] {
  if (!names.size) return [{ type: 'markdown', source }];
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
  function segments(start: number, end: number, from: number, to: number): MarkdownSegment[] {
    const result: MarkdownSegment[] = [];
    let cursor = start;
    for (let i = from; i < to; i++) {
      const tag = tags[i]!;
      if (tag.closing) continue;
      const close = tag.close !== undefined && tag.close < to ? tags[tag.close] : undefined;
      if (!close && !streaming) continue;
      if (tag.start > cursor) result.push({ type: 'markdown', source: source.slice(cursor, tag.start) });
      result.push({
        type: 'tag',
        name: tag.name,
        attributes: tag.attributes,
        complete: !!close,
        children: segments(tag.end, close?.start ?? end, i + 1, close ? tag.close! : to),
      });
      cursor = close?.end ?? end;
      i = close ? tag.close! : to;
    }
    if (cursor < end) result.push({ type: 'markdown', source: source.slice(cursor, end) });
    return result;
  }
  return segments(0, source.length, 0, tags.length);
}
