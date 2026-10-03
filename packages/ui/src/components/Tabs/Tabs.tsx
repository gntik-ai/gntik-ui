import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { createContext, useContext, type ComponentType, type ReactNode, type Ref } from 'react';
import { cn } from '../../utils/cn';
import { tabsVariants } from './tabs.variants';

type IconComponent = ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
type TabsVariant = 'underline' | 'pills';

interface TabsContextValue {
  variant: TabsVariant;
  indicator: boolean;
  fullWidth: boolean;
}

const TabsContext = createContext<TabsContextValue>({ variant: 'underline', indicator: true, fullWidth: false });

export interface TabsProps extends Omit<BaseTabs.Root.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Visual style: an underline bar (default) or pills inside a container. */
  variant?: TabsVariant;
}

/**
 * Tab set. Controlled with `value` + `onValueChange`, or uncontrolled with `defaultValue`.
 * Arrow keys move between tabs; Enter or Space activates (or pass `activateOnFocus` to TabsList).
 */
export function Tabs({ variant = 'underline', className, children, ...props }: TabsProps) {
  const ctx = useContext(TabsContext);
  return (
    <TabsContext.Provider value={{ ...ctx, variant }}>
      <BaseTabs.Root className={cn(tabsVariants({ variant }).root(), className)} {...props}>
        {children}
      </BaseTabs.Root>
    </TabsContext.Provider>
  );
}

export interface TabsListProps extends Omit<BaseTabs.List.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
  /** Render the sliding TabsIndicator automatically. When false the active tab is styled statically. */
  indicator?: boolean;
  /** Stretch the tabs into equal columns that fill the width. */
  fullWidth?: boolean;
  /** Accessible name for the tab list (recommended when the page has several tab sets). */
  'aria-label'?: string;
}

/** The row of tabs (role="tablist"). */
export function TabsList({ indicator = true, fullWidth = false, className, children, ...props }: TabsListProps) {
  const { variant } = useContext(TabsContext);
  const s = tabsVariants({ variant, indicator, fullWidth });
  return (
    <TabsContext.Provider value={{ variant, indicator, fullWidth }}>
      <BaseTabs.List className={cn(s.list(), className)} {...props}>
        {children}
        {indicator && <TabsIndicator />}
      </BaseTabs.List>
    </TabsContext.Provider>
  );
}

export interface TabsTabProps extends Omit<BaseTabs.Tab.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLButtonElement>;
  /** Leading icon (a lucide icon component); turns brand green when active. */
  icon?: IconComponent;
  /** Count badge shown after the label (numbers are formatted with thousands separators). */
  count?: number | string;
  children?: ReactNode;
}

/** A single tab (role="tab"). `value` links it to the TabsPanel with the same value. */
export function TabsTab({ icon: IconCmp, count, className, children, ...props }: TabsTabProps) {
  const { variant, indicator, fullWidth } = useContext(TabsContext);
  const s = tabsVariants({ variant, indicator, fullWidth });
  return (
    <BaseTabs.Tab className={cn(s.tab(), className)} {...props}>
      {IconCmp && <IconCmp size={variant === 'pills' ? 15 : 16} className={s.icon()} aria-hidden />}
      {children}
      {count != null && (
        <span className={s.count()}>{typeof count === 'number' ? count.toLocaleString('en-US') : count}</span>
      )}
    </BaseTabs.Tab>
  );
}

export interface TabsIndicatorProps extends Omit<BaseTabs.Indicator.Props, 'className'> {
  className?: string;
}

/** Sliding marker under (underline) or behind (pills) the active tab. TabsList renders one by default. */
export function TabsIndicator({ className, ...props }: TabsIndicatorProps) {
  const { variant } = useContext(TabsContext);
  return <BaseTabs.Indicator className={cn(tabsVariants({ variant }).indicator(), className)} {...props} />;
}

export interface TabsPanelProps extends Omit<BaseTabs.Panel.Props, 'className'> {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** Content for one tab (role="tabpanel"), labelled by its tab. */
export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return <BaseTabs.Panel className={cn(tabsVariants().panel(), className)} {...props} />;
}
