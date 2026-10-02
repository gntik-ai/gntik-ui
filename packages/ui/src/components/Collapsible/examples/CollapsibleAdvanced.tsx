import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '../Collapsible';

export default function CollapsibleAdvanced() {
  return (
    <Collapsible className="max-w-md">
      <CollapsibleTrigger>Advanced settings</CollapsibleTrigger>
      <CollapsiblePanel>
        <label className="flex items-center gap-2 text-foreground">
          <input type="checkbox" className="size-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring" />
          Keep build cache between deployments
        </label>
      </CollapsiblePanel>
    </Collapsible>
  );
}
