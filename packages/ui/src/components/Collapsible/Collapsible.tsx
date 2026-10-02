import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { ChevronDown } from 'lucide-react';
import { createContext, useContext, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { collapsibleVariants, type CollapsibleVariantProps } from './collapsible.variants';

type CollapsibleVariant = NonNullable<CollapsibleVariantProps['variant']>;
const CollapsibleContext = createContext<CollapsibleVariant>('subtle');

export interface CollapsibleProps extends Omit<BaseCollapsible.Root.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** `subtle` (inline toggle) or `row` (full-width row with a divider, like an accordion item). */
  variant?: CollapsibleVariant;
}

/** A single show/hide section. Controlled with `open` + `onOpenChange`, or uncontrolled with `defaultOpen`. */
export function Collapsible({ variant = 'subtle', className, ...props }: CollapsibleProps) {
  return (
    <CollapsibleContext.Provider value={variant}>
      <BaseCollapsible.Root className={cn(collapsibleVariants({ variant }).root(), className)} {...props} />
    </CollapsibleContext.Provider>
  );
}

export interface CollapsibleTriggerProps extends Omit<BaseCollapsible.Trigger.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  /** Show the rotating chevron. */
  showChevron?: boolean;
  children?: ReactNode;
}

/** The toggle button (aria-expanded, aria-controls). */
export function CollapsibleTrigger({ showChevron = true, className, children, ...props }: CollapsibleTriggerProps) {
  const variant = useContext(CollapsibleContext);
  const s = collapsibleVariants({ variant });
  return (
    <BaseCollapsible.Trigger className={cn(s.trigger(), className)} {...props}>
      {children}
      {showChevron && <ChevronDown size={variant === 'row' ? 16 : 15} className={s.chevron()} aria-hidden />}
    </BaseCollapsible.Trigger>
  );
}

export interface CollapsiblePanelProps extends Omit<BaseCollapsible.Panel.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

/** The hidden content. Height animates; reduced motion turns the animation off. */
export function CollapsiblePanel({ className, children, ...props }: CollapsiblePanelProps) {
  const variant = useContext(CollapsibleContext);
  const s = collapsibleVariants({ variant });
  return (
    <BaseCollapsible.Panel className={s.panel()} {...props}>
      <div className={cn(s.content(), className)}>{children}</div>
    </BaseCollapsible.Panel>
  );
}
