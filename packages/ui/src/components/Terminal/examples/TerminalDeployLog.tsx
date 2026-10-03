import { Terminal, type TerminalLine } from '../Terminal';

const E = '\u001b[';
const start = Date.UTC(2026, 0, 12, 9, 30, 0);
const at = (s: number) => start + s * 1000;

const LINES: TerminalLine[] = [
  { text: `${E}36m→${E}0m pulling image registry.example.com/api:4.18.0`, timestamp: at(0) },
  { text: `${E}36m→${E}0m starting 3 replicas in ${E}1meu-west-1${E}0m`, timestamp: at(4) },
  { text: `${E}32m✓${E}0m replica api-7f9c ready`, timestamp: at(9) },
  { text: `${E}32m✓${E}0m replica api-2b41 ready`, timestamp: at(10) },
  { text: `${E}33m!${E}0m replica api-c03e slow health check (2.4s)`, timestamp: at(14) },
  { text: `${E}32m✓${E}0m replica api-c03e ready`, timestamp: at(16) },
  { text: `${E}35mtraffic${E}0m shifted 100% to 4.18.0`, timestamp: at(18) },
  { text: `${E}7m DONE ${E}0m deployment finished in 18s`, timestamp: at(18) },
];

export default function TerminalDeployLog() {
  return (
    <Terminal
      lines={LINES}
      title="deploy · api"
      showTimestamps
      formatTimestamp={(d) => d.toISOString().slice(11, 19)}
      defaultWrap
      className="h-64 w-full max-w-2xl"
    />
  );
}
