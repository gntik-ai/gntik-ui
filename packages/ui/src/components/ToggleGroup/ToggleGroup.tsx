import { Toggle as BaseToggle } from '@base-ui/react/toggle';
import { ToggleGroup as BaseToggleGroup } from '@base-ui/react/toggle-group';
import { useRender } from '@base-ui/react/use-render';
import { Check } from 'lucide-react';
import { createContext, useContext, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import {
  toggleGroupVariants,
  toggleVariants,
  type ToggleGroupVariantProps,
  type ToggleVariantProps,
} from './toggle-group.variants';

type GroupStyle = { variant: 'segmented' | 'joined' | 'chip'; size: 'auto' | 'sm' | 'md' };
const GroupStyleContext = createContext<GroupStyle | null>(null);

export interface ToggleProps extends Omit<BaseToggle.Props, 'className'>, Omit<ToggleVariantProps, 'variant'> {
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  children?: ReactNode;
  /** Trailing count, included in the accessible name. */
  count?: ReactNode;
}

/**
 * Two-state (pressed) button. Standalone: `pressed` / `defaultPressed` / `onPressedChange`.
 * Inside a ToggleGroup: give it a `value`; it inherits the group's look. Icon-only toggles
 * need `aria-label` (set `iconOnly`).
 */
export function Toggle({ size, iconOnly, className, render, children, count, type = 'button', ...props }: ToggleProps) {
  const group = useContext(GroupStyleContext);
  return (
    <BaseToggle
      type={type}
      className={cn(
        toggleVariants({ variant: group?.variant ?? 'standalone', size: size ?? group?.size ?? 'auto', iconOnly }),
        className,
      )}
      {...props}
      children={
        count == null ? (
          children
        ) : (
          <>
            {children} <span className="font-mono tabular-nums text-[11px]">{count}</span>
          </>
        )
      }
      render={
        group?.variant === 'chip'
          ? (elementProps, state) => <ChipButton elementProps={elementProps} state={state} render={render} />
          : render
      }
    />
  );
}

export interface ToggleGroupProps extends Omit<BaseToggleGroup.Props<string>, 'className'>, ToggleGroupVariantProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Item size, passed down to every Toggle. `auto` (default) follows the density. */
  size?: 'auto' | 'sm' | 'md';
  /**
   * Keep at least one item pressed: a change that would leave the value empty is ignored
   * (the pressed item stays pressed and `onValueChange` is not called). Works in single and
   * `multiple` mode, controlled or not. An uncontrolled `defaultValue` is read once. A group
   * that starts empty stays empty until the first press. Default `false`.
   */
  disallowEmptySelection?: boolean;
}

/**
 * A set of Toggles with shared state: segmented control (`multiple={false}`, the default)
 * or multi-select toolbar (`multiple`). Arrow keys move focus; Space/Enter toggles.
 * Give it an `aria-label`. `disallowEmptySelection` keeps one item pressed.
 */
export function ToggleGroup({
  variant = 'segmented',
  size = 'auto',
  className,
  disallowEmptySelection = false,
  onValueChange,
  ...props
}: ToggleGroupProps) {
  const handleValueChange: BaseToggleGroup.Props<string>['onValueChange'] = (next, eventDetails) => {
    if (disallowEmptySelection && next.length === 0) {
      eventDetails.cancel();
      return;
    }
    onValueChange?.(next, eventDetails);
  };
  return (
    <GroupStyleContext.Provider value={{ variant: variant ?? 'segmented', size }}>
      <BaseToggleGroup
        className={cn(toggleGroupVariants({ variant }), className)}
        onValueChange={handleValueChange}
        {...props}
      />
    </GroupStyleContext.Provider>
  );
}

/** Uses Base UI's pressed state without duplicating its selection or focus logic. */
function ChipButton({
  elementProps,
  state,
  render,
}: {
  elementProps: useRender.ElementProps<'button'>;
  state: BaseToggle.State;
  render: BaseToggle.Props['render'];
}) {
  return useRender<{ pressed: boolean; disabled: boolean }, HTMLButtonElement>({
    defaultTagName: 'button',
    render,
    props: {
      ...elementProps,
      children: (
        <>
          {state.pressed && <Check size={14} aria-hidden />}
          {elementProps.children}
        </>
      ),
    },
    state,
  });
}
