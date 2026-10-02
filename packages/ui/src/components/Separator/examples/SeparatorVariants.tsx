import { Separator } from '../Separator';

export default function SeparatorVariants() {
  return (
    <div className="grid max-w-md gap-8">
      <Separator />
      <Separator variant="subtle" />
      <Separator variant="strong" />
      <Separator label="Today's deployments" />
      <Separator label="This week" labelStyle="kicker" labelPosition="start" />
      <Separator label="Yesterday" labelStyle="pill" />
      <div className="flex h-5 items-center gap-3 text-[13px] text-muted-foreground">
        <span>Docs</span>
        <Separator orientation="vertical" />
        <span>Changelog</span>
        <Separator orientation="vertical" />
        <span>Status</span>
      </div>
    </div>
  );
}
