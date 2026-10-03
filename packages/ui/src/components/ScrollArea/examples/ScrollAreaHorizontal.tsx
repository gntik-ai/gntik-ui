import { ScrollArea } from '../ScrollArea';

const TAGS = ['production', 'staging', 'preview', 'eu-west-1', 'us-east-2', 'ap-south-1', 'canary', 'nightly', 'v2.14.0', 'v2.13.4', 'hotfix'];

export default function ScrollAreaHorizontal() {
  return (
    <ScrollArea orientation="horizontal" aria-label="Environments" className="max-w-[360px]" contentClassName="pb-3">
      <div className="flex gap-2">
        {TAGS.map((t) => (
          <span key={t} className="shrink-0 rounded-md border border-border bg-secondary/50 px-2.5 py-1 font-mono text-[12px] text-foreground">
            {t}
          </span>
        ))}
      </div>
    </ScrollArea>
  );
}
