import { Play, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../Button';
import { Terminal, type TerminalHandle } from '../Terminal';

const E = '\u001b[';
/** A fake build: ANSI-coloured lines, one progress line rewritten with `\r`, then a summary. */
const SCRIPT: string[] = [
  `${E}2m$ ${E}0mpnpm build\n`,
  `${E}36minfo${E}0m  resolving 412 packages\n`,
  `${E}36minfo${E}0m  compiling ${E}1m@acme/web${E}0m\n`,
  'progress  25%',
  '\rprogress  50%',
  '\rprogress  75%',
  '\rprogress 100%\n',
  `${E}33mwarn${E}0m  bundle "vendor" is 612 kB (limit 500 kB)\n`,
  `${E}32m✓${E}0m built in 4.2s · ${E}1m3 entries${E}0m\n`,
  `${E}31merror${E}0m  test "checkout › applies coupon" failed\n`,
  `${E}90m  at checkout.test.ts:42:7${E}0m\n`,
  `${E}1;31m✗ 1 failed${E}0m, ${E}32m128 passed${E}0m\n`,
];

export default function TerminalBuildLog() {
  const term = useRef<TerminalHandle>(null);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setStep((n) => {
        const chunk = SCRIPT[n];
        if (chunk === undefined) {
          setRunning(false);
          return n;
        }
        term.current?.write(chunk);
        return n + 1;
      });
    }, 350);
    return () => window.clearInterval(id);
  }, [running]);

  return (
    <div className="grid w-full max-w-2xl gap-3">
      <div className="flex gap-2">
        <Button size="sm" icon={Play} disabled={running || step >= SCRIPT.length} onClick={() => setRunning(true)}>
          Run build
        </Button>
        <Button
          size="sm"
          variant="secondary"
          icon={RotateCcw}
          onClick={() => {
            setRunning(false);
            setStep(0);
            term.current?.clear();
          }}
        >
          Reset
        </Button>
      </div>
      <Terminal ref={term} title="build · main" showLineNumbers emptyText="Press “Run build” to stream output." className="h-72" />
    </div>
  );
}
