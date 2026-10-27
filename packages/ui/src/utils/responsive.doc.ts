import type { ComponentDoc } from '../doc';

export const doc: ComponentDoc = {
  name: 'Responsive values',
  group: 'Layout',
  status: 'stable',
  description:
    'BREAKPOINTS orders base, sm, md, lg, xl and 2xl. Responsive<T> accepts a scalar or a partial breakpoint object. responsiveClasses(value, tableOrFunction) maps defined entries in that order, looking up String(value), including booleans; unknown keys and missing entries emit nothing. Every table entry or callback result must be a full literal class string so Tailwind can scan it. responsiveVars(name, value) creates --name and --name-breakpoint variables and stringifies numbers; consuming static classes must provide mobile-first variable fallbacks. resolveResponsive(value, breakpoint) returns the nearest defined value at or below the breakpoint; isResponsiveObject distinguishes objects from scalars. Grid columns, spans and all three gaps, and Section padding, accept responsive values. The example uses shipped literal Grid tables, CSS variable fallbacks and JavaScript resolution.',
  tokens: ['border', 'card', 'card-foreground', 'foreground', 'muted-foreground'],
};
