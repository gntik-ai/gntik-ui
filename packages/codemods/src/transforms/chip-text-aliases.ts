import type { API, FileInfo } from 'jscodeshift';
import type { Codemod, CodemodMeta } from '../types.js';

export const meta: CodemodMeta = {
  id: 'chip-text-aliases',
  package: '@gntik-ai/tokens',
  fromVersion: '0.1.0',
  toVersion: '0.2.0',
  description:
    'Text on tinted fills uses the chip aliases: in class strings that combine bg-<tone>/NN with text-<tone>-text (primary, success, warning, destructive), the text class becomes text-<tone>-chip-text (AA on the tint in all three themes).',
  reportOnly: false,
};

const TONES = 'primary|success|warning|destructive';
const BG = new RegExp(String.raw`(?:^|[\s:"'\`])bg-(${TONES})\/\d+(?=$|[\s"'\`])`, 'g');
const TEXT = new RegExp(String.raw`(^|[\s"'\`])((?:[^\s:"'\`]+:)*)text-(${TONES})-text(?=$|[\s"'\`])`, 'g');

/** Tones that appear as a tinted background (`bg-success/14`, `hover:bg-primary/10`) in the class text. */
export function tintedTones(classes: string): Set<string> {
  return new Set([...classes.matchAll(BG)].map((m) => m[1] as string));
}

/** Rewrites `text-<tone>-text` to `text-<tone>-chip-text` for the given tones (variant prefixes kept). */
export function rewriteChipText(classes: string, tones: Set<string>): string {
  if (!tones.size) return classes;
  return classes.replace(TEXT, (all, lead: string, prefix: string, tone: string) => (tones.has(tone) ? `${lead}${prefix}text-${tone}-chip-text` : all));
}

interface Ranged {
  start?: number | null;
  end?: number | null;
}

/**
 * Edits are spliced into the source text at the literal's offsets (rather than reprinted), so quotes,
 * escapes and formatting stay exactly as written.
 */
export function transform(file: FileInfo, api: API): string | null {
  const j = api.jscodeshift;
  const root = j(file.source);
  const edits: Array<{ start: number; end: number; text: string }> = [];
  const edit = (node: Ranged, tones: Set<string>) => {
    if (typeof node.start !== 'number' || typeof node.end !== 'number') return;
    const text = file.source.slice(node.start, node.end);
    const next = rewriteChipText(text, tones);
    if (next !== text) edits.push({ start: node.start, end: node.end, text: next });
  };

  root.find(j.StringLiteral).forEach((p) => {
    edit(p.node as Ranged, tintedTones(p.node.value));
  });
  root.find(j.TemplateLiteral).forEach((p) => {
    const tones = tintedTones(p.node.quasis.map((q) => q.value.cooked ?? q.value.raw).join(' '));
    if (tones.size) for (const q of p.node.quasis) edit(q as Ranged, tones);
  });

  if (!edits.length) return null;
  let out = file.source;
  for (const e of edits.sort((a, b) => b.start - a.start)) out = out.slice(0, e.start) + e.text + out.slice(e.end);
  return out;
}

export const parser = 'tsx';
export default transform;
export const codemod: Codemod = { meta, transform };
