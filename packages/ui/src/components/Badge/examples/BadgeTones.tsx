import { Badge } from '../Badge';

const TONES = ['neutral', 'primary', 'success', 'warning', 'destructive', 'info', 'violet', 'cyan', 'amber', 'rose'] as const;

export default function BadgeTones() {
  return (
    <div className="grid gap-3">
      {(['soft', 'outline', 'solid'] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-2">
          {TONES.map((tone) => (
            <Badge key={tone} tone={tone} variant={variant} dot>
              {tone}
            </Badge>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="primary" size="sm">sm</Badge>
        <Badge tone="primary">md</Badge>
        <Badge tone="primary" size="lg">lg</Badge>
        <Badge tone="primary" size="lg" shape="pill">pill</Badge>
      </div>
    </div>
  );
}
