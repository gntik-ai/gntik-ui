import { useState } from 'react';
import { Alert } from '../../Alert/Alert';
import { Button } from '../../Button/Button';
import { Progress } from '../../Progress/Progress';
import { Token } from '../../Token/Token';
import { Badge } from '../Badge';

const TONES = [
  'primary',
  'success',
  'warning',
  'destructive',
  'info',
  'neutral',
  'violet',
  'cyan',
  'amber',
  'rose',
] as const;
const STATUS_TONES = ['success', 'warning', 'destructive'] as const;

/** The same public tone utilities work on product markup and kit components. */
export default function SharedToneUtilities() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  return (
    <div className="grid gap-4">
      <p className="text-sm text-muted-foreground">
        Set data-tone to primary, success, warning, destructive, info, neutral, violet, cyan, amber or rose. Descendants
        inherit the tone; an unknown value clears it. Use text-tone-text on surfaces and text-tone-chip-text on tints.
        Each kit component keeps its own tint strength.
      </p>
      {TONES.map((tone) => (
        <div key={tone} className="flex flex-wrap items-center gap-2" data-example-tone={tone}>
          <span data-tone={tone} className="rounded-md bg-tone/15 px-2 py-1 text-sm text-tone-chip-text">
            Product {tone}
          </span>
          {(['soft', 'outline', 'solid'] as const).map((variant) => (
            <Badge key={variant} tone={tone} variant={variant} dot data-example-variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      ))}
      <div data-tone="success" className="flex flex-wrap gap-2">
        {['purple', 'failed'].map((tone) => (
          <span key={tone} data-tone={tone} className="bg-tone/15 text-foreground">
            Unsupported: {tone} (no tint)
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {(['neutral', 'primary', ...STATUS_TONES] as const).map((tone) => (
          <Token data-example-kind="token" key={tone} tone={tone} label={tone} icon={<span aria-hidden>●</span>} />
        ))}
      </div>
      {(['primary', ...STATUS_TONES] as const).map((tone) => (
        <Progress key={tone} tone={tone} label={tone} value={60} showValue />
      ))}
      {(['info', ...STATUS_TONES] as const).map((tone) =>
        dismissed.includes(tone) ? null : (
          <Alert key={tone} tone={tone} title={tone} onDismiss={() => setDismissed((current) => [...current, tone])} />
        ),
      )}
      {dismissed.length > 0 && <Button onClick={() => setDismissed([])}>Restore alerts</Button>}
    </div>
  );
}
