export { Terminal, type TerminalHandle, type TerminalProps, type TerminalLine } from './Terminal';
export {
  parseAnsi,
  stripAnsi,
  ansiClassName,
  ANSI_TEXT_CLASS,
  ANSI_BG_CLASS,
  type AnsiColor,
  type AnsiBaseColor,
  type AnsiSegment,
  type AnsiStyle,
} from './ansi';
export { terminalVariants, type TerminalVariantProps } from './terminal.variants';
export { doc as terminalDoc } from './Terminal.doc';
