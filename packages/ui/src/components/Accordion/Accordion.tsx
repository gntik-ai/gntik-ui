import { Accordion as BaseAccordion } from '@base-ui/react/accordion';
import { ChevronDown } from 'lucide-react';
import { createContext, useContext, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { accordionVariants, type AccordionVariantProps } from './accordion.variants';

type AccordionVariant = NonNullable<AccordionVariantProps['variant']>;
const AccordionContext = createContext<AccordionVariant>('flush');

const ROOT_SELECTOR = '[data-slot="accordion"]';
const TRIGGER_SELECTOR = '[data-slot="accordion-trigger"]';

/**
 * Moves focus between the triggers of one accordion (ArrowDown/ArrowUp wrap, Home/End jump).
 * Base UI 1.8 dropped roving focus for accordions, so the kit adds it back as plain focus moves:
 * every trigger stays in the Tab order.
 */
function moveTriggerFocus(event: KeyboardEvent<HTMLElement>) {
  const root = event.currentTarget;
  const target = event.target as HTMLElement;
  if (!target.matches(TRIGGER_SELECTOR) || target.closest(ROOT_SELECTOR) !== root) return;
  const triggers = Array.from(root.querySelectorAll<HTMLElement>(TRIGGER_SELECTOR)).filter(
    (el) => el.closest(ROOT_SELECTOR) === root && !el.hasAttribute('disabled') && !el.hasAttribute('data-disabled'),
  );
  const index = triggers.indexOf(target);
  if (index === -1 || triggers.length === 0) return;
  let next: number | undefined;
  if (event.key === 'ArrowDown') next = (index + 1) % triggers.length;
  else if (event.key === 'ArrowUp') next = (index - 1 + triggers.length) % triggers.length;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = triggers.length - 1;
  if (next === undefined) return;
  event.preventDefault();
  triggers[next]?.focus();
}

export interface AccordionProps<Value = string> extends Omit<BaseAccordion.Root.Props<Value>, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** `flush` (dividers only) or `card` (bordered surface). */
  variant?: AccordionVariant;
}

/**
 * A stack of collapsible sections. One open at a time by default; pass `multiple` to allow several.
 * Controlled with `value` + `onValueChange` (an array of item values), or uncontrolled with `defaultValue`.
 */
export function Accordion<Value = string>({ variant = 'flush', className, onKeyDown, ...props }: AccordionProps<Value>) {
  return (
    <AccordionContext.Provider value={variant}>
      <BaseAccordion.Root<Value>
        data-slot="accordion"
        className={cn(accordionVariants({ variant }).root(), className)}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (!event.defaultPrevented) moveTriggerFocus(event);
        }}
        {...props}
      />
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends Omit<BaseAccordion.Item.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** One section. Give it a `value` to control it from the root. */
export function AccordionItem({ className, ...props }: AccordionItemProps) {
  const variant = useContext(AccordionContext);
  return <BaseAccordion.Item className={cn(accordionVariants({ variant }).item(), className)} {...props} />;
}

export interface AccordionTriggerProps extends Omit<BaseAccordion.Trigger.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  /** Heading level of the wrapping header element. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  children?: ReactNode;
}

/** The section heading + toggle button. The chevron rotates when the panel is open. */
export function AccordionTrigger({ headingLevel = 3, className, children, ...props }: AccordionTriggerProps) {
  const variant = useContext(AccordionContext);
  const s = accordionVariants({ variant });
  const Heading = `h${headingLevel}` as const;
  return (
    <BaseAccordion.Header className={s.header()} render={<Heading />}>
      <BaseAccordion.Trigger data-slot="accordion-trigger" className={cn(s.trigger(), className)} {...props}>
        {children}
        <ChevronDown size={16} className={s.chevron()} aria-hidden />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

export interface AccordionPanelProps extends Omit<BaseAccordion.Panel.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

/** The collapsible content. Height animates; reduced motion turns the animation off. */
export function AccordionPanel({ className, children, ...props }: AccordionPanelProps) {
  const variant = useContext(AccordionContext);
  const s = accordionVariants({ variant });
  return (
    <BaseAccordion.Panel className={s.panel()} {...props}>
      <div className={cn(s.content(), className)}>{children}</div>
    </BaseAccordion.Panel>
  );
}
