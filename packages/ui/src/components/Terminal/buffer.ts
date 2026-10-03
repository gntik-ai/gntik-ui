/** One line of terminal output: raw text (ANSI escapes allowed) and an optional timestamp. */
export type TerminalLine = string | { text: string; timestamp?: Date | number | string };

export interface BufferLine {
  text: string;
  timestamp?: number;
}

export interface TerminalBuffer {
  lines: BufferLine[];
  /** Absolute index of `lines[0]` (lines dropped by `maxLines` keep the numbering stable). */
  first: number;
  /** The last line has no trailing newline yet: the next chunk continues it. */
  open: boolean;
}

export const EMPTY_BUFFER: TerminalBuffer = { lines: [], first: 0, open: false };

/**
 * A carriage return rewrites the line (progress bars): keep what follows the last one. A trailing
 * `\r` on an open line is kept (the rewrite may arrive in the next chunk); on a complete line it is CRLF.
 */
function collapseCarriageReturns(text: string, complete: boolean): string {
  const t = complete && text.endsWith('\r') ? text.slice(0, -1) : text;
  const end = t.endsWith('\r') ? t.length - 1 : t.length;
  const at = end > 0 ? t.lastIndexOf('\r', end - 1) : -1;
  return at < 0 ? t : t.slice(at + 1);
}

export function toBufferLine(line: TerminalLine): BufferLine {
  if (typeof line === 'string') return { text: line };
  const ts = line.timestamp === undefined ? undefined : new Date(line.timestamp).getTime();
  return { text: line.text, timestamp: Number.isNaN(ts) ? undefined : ts };
}

/** Drops the oldest lines beyond `maxLines`. */
export function trimBuffer(buffer: TerminalBuffer, maxLines: number): TerminalBuffer {
  const extra = buffer.lines.length - Math.max(1, maxLines);
  if (extra <= 0) return buffer;
  return { ...buffer, lines: buffer.lines.slice(extra), first: buffer.first + extra };
}

/** Appends a streamed chunk: splits on newlines, continues an open last line, honours `\r`. */
export function appendChunk(buffer: TerminalBuffer, chunk: string, maxLines: number, now = Date.now()): TerminalBuffer {
  if (chunk === '') return buffer;
  const lines = buffer.lines.slice();
  const parts = chunk.split('\n');
  const tail = parts.pop() ?? '';
  let open = buffer.open;
  const add = (part: string, complete: boolean) => {
    const last = lines[lines.length - 1];
    if (open && last) lines[lines.length - 1] = { ...last, text: collapseCarriageReturns(last.text + part, complete) };
    else lines.push({ text: collapseCarriageReturns(part, complete), timestamp: now });
  };
  for (const part of parts) {
    add(part, true);
    open = false;
  }
  if (tail !== '') {
    add(tail, false);
    open = true;
  }
  return trimBuffer({ lines, first: buffer.first, open }, maxLines);
}
