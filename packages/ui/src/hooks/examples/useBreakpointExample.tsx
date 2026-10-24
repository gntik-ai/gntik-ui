import { breakpoints } from '@gntik-ai/tokens/runtime';
import { useBreakpoint, useBreakpointValue } from '../useBreakpoint';

export default function BreakpointExample() {
  const breakpoint = useBreakpoint({ fallback: 'base' });
  const navigation = useBreakpointValue({ base: 'drawer', lg: 'inline' }, { fallback: 'base' });
  const columns = useBreakpointValue({ md: 2 });
  return (
    <div className="space-y-2 text-sm text-foreground" aria-live="polite">
      <p>Current breakpoint: {breakpoint}</p>
      <p>Navigation behaviour: {navigation}</p>
      <p>Optional columns: {columns ?? 'undefined below md'}</p>
      <p className="text-muted-foreground">
        {Object.entries(breakpoints)
          .map(([name, value]) => `${name}: ${value}`)
          .join(' · ')}
      </p>
      <p className="text-muted-foreground">CSS should handle layout; these hooks select behaviour after hydration.</p>
    </div>
  );
}
