import { Switch, cn } from '@gntik-ai/ui';
import { useId, type ReactNode } from 'react';

export interface SettingsRowControlIds {
  /** Id of the label element: pass it as `aria-labelledby` to the control. */
  labelId: string;
  /** Id of the description element (when there is one): pass it as `aria-describedby`. */
  descriptionId: string | undefined;
}

export interface SettingsRowProps {
  label?: ReactNode;
  description?: ReactNode;
  /**
   * Custom control. A function receives the label/description ids to wire the control's
   * accessible name. Without it, a Switch driven by `checked` / `defaultChecked` is rendered.
   */
  control?: ReactNode | ((ids: SettingsRowControlIds) => ReactNode);
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Extra content under the description (status, link). */
  children?: ReactNode;
  className?: string;
}

/** One setting: label and description on the left, its control (a Switch by default) on the right. */
export function SettingsRow({
  label = 'Deployment notifications',
  description = 'Email the project owners when a deployment fails or is rolled back.',
  control,
  checked,
  defaultChecked = true,
  onCheckedChange,
  disabled,
  children,
  className,
}: SettingsRowProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = description != null ? `${id}-desc` : undefined;
  const content =
    typeof control === 'function' ? (
      control({ labelId, descriptionId })
    ) : control !== undefined ? (
      control
    ) : (
      <Switch
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        checked={checked}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        onCheckedChange={(next) => onCheckedChange?.(next)}
        disabled={disabled}
      />
    );
  return (
    <div className={cn('flex items-start justify-between gap-6 py-4', disabled && 'opacity-70', className)}>
      <div className="min-w-0">
        <div id={labelId} className="text-[13.5px] font-medium text-foreground">
          {label}
        </div>
        {description != null && (
          <p id={descriptionId} className="mt-0.5 max-w-xl text-[12.5px] leading-5 text-pretty text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </div>
      <div className="shrink-0 pt-0.5">{content}</div>
    </div>
  );
}
