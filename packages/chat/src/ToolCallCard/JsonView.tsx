import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from '@gntik-ai/ui';
import { toJson } from '../utils/format';
import { toolCallCardStyles } from './toolCallCard.variants';

const s = toolCallCardStyles.json;

export interface JsonViewProps {
  /** Section title ("Arguments", "Result"). */
  label: string;
  /** Any value: objects are pretty-printed, strings shown as-is. */
  value: unknown;
  defaultOpen?: boolean;
}

/** A small collapsible, scrollable JSON block. */
export function JsonView({ label, value, defaultOpen = true }: JsonViewProps) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className={s.trigger}>{label}</CollapsibleTrigger>
      <CollapsiblePanel className={s.content}>
        <pre tabIndex={0} aria-label={label} className={s.pre}>
          <code>{toJson(value)}</code>
        </pre>
      </CollapsiblePanel>
    </Collapsible>
  );
}
