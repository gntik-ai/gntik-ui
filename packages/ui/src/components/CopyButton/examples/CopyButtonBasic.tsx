import { CopyButton } from '../CopyButton';

export default function CopyButtonBasic() {
  const command = 'pnpm add @gntik-ai/ui';
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="inline-flex items-center gap-1 rounded-md border border-border bg-background ps-3 font-mono text-[12.5px] text-foreground">
        <code>{command}</code>
        <CopyButton value={command} label="Copy command" size="sm" />
      </div>
      <CopyButton value="ws_8f2a91c4" display="label" variant="secondary" label="Copy workspace ID" />
    </div>
  );
}
