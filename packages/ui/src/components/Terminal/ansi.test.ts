import { ansiClassName, parseAnsi, stripAnsi } from './ansi';
import { appendChunk, EMPTY_BUFFER } from './buffer';

const E = '\u001b[';

describe('parseAnsi', () => {
  it('returns one plain segment for text without escapes', () => {
    expect(parseAnsi('hello')).toEqual([{ text: 'hello' }]);
  });

  it('maps SGR foreground, bold and reset', () => {
    expect(parseAnsi(`a${E}31mred${E}1m bold${E}0m b`)).toEqual([
      { text: 'a' },
      { text: 'red', fg: 'red' },
      { text: ' bold', fg: 'red', bold: true },
      { text: ' b' },
    ]);
  });

  it('handles bright colours, backgrounds and selective resets', () => {
    expect(parseAnsi(`${E}92;41mx${E}39my${E}49mz`)).toEqual([
      { text: 'x', fg: 'brightGreen', bg: 'red' },
      { text: 'y', bg: 'red' },
      { text: 'z' },
    ]);
    expect(parseAnsi(`${E}1;2;3;4mx${E}22;23;24my`)).toEqual([
      { text: 'x', bold: true, dim: true, italic: true, underline: true },
      { text: 'y' },
    ]);
  });

  it('snaps 256-colour and true-colour values to the 16 colours', () => {
    expect(parseAnsi(`${E}38;5;1ma${E}38;5;12mb${E}38;5;196mc${E}38;2;0;200;0md${E}48;5;244me`)).toEqual([
      { text: 'a', fg: 'red' },
      { text: 'b', fg: 'brightBlue' },
      { text: 'c', fg: 'brightRed' },
      { text: 'd', fg: 'brightGreen' },
      { text: 'e', fg: 'brightGreen', bg: 'brightBlack' },
    ]);
  });

  it('treats an empty SGR as reset and drops non-SGR escapes and control characters', () => {
    expect(parseAnsi(`${E}33mwarn${E}m ok${E}2K${E}1A\u001b]0;title\u0007\u0008!`)).toEqual([
      { text: 'warn', fg: 'yellow' },
      { text: ' ok!' },
    ]);
  });

  it('carries a style passed in as the initial state', () => {
    expect(parseAnsi('still red', { fg: 'red' })).toEqual([{ text: 'still red', fg: 'red' }]);
  });

  it('stripAnsi returns the plain text', () => {
    expect(stripAnsi(`${E}1;32m✓${E}0m done`)).toBe('✓ done');
  });

  it('ansiClassName uses token classes only', () => {
    expect(ansiClassName({ fg: 'red' })).toBe('text-destructive-text');
    expect(ansiClassName({ fg: 'brightGreen', bold: true })).toBe('text-success-text font-semibold');
    expect(ansiClassName({ fg: 'yellow', bg: 'blue', underline: true })).toBe('text-warning-text bg-info/15 underline');
    expect(ansiClassName({ fg: 'cyan', inverse: true })).toBe('bg-foreground text-background');
    expect(ansiClassName({ dim: true })).toBe('text-muted-foreground');
    expect(ansiClassName({})).toBe('');
  });
});

describe('appendChunk', () => {
  it('splits lines, continues an open line and rewrites on carriage return', () => {
    let b = appendChunk(EMPTY_BUFFER, 'one\ntw', 100, 1);
    expect(b.lines.map((l) => l.text)).toEqual(['one', 'tw']);
    expect(b.open).toBe(true);
    b = appendChunk(b, 'o\r\n10%\r', 100, 2);
    expect(b.lines.map((l) => l.text)).toEqual(['one', 'two', '10%\r']);
    b = appendChunk(b, '20%\n', 100, 3);
    expect(b.lines.map((l) => l.text)).toEqual(['one', 'two', '20%']);
    expect(b.open).toBe(false);
  });

  it('drops the oldest lines beyond maxLines and keeps numbering', () => {
    const b = appendChunk(EMPTY_BUFFER, 'a\nb\nc\nd\n', 2);
    expect(b.lines.map((l) => l.text)).toEqual(['c', 'd']);
    expect(b.first).toBe(2);
  });
});
