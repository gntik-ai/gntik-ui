import { breakpointQuery } from '@gntik-ai/tokens/runtime';
import { useMediaQuery, usePrefersReducedMotion } from '../useMediaQuery';

export default function MediaQueryExample() {
  const wide = useMediaQuery(breakpointQuery('lg'), false);
  const reducedMotion = usePrefersReducedMotion();
  return (
    <div className="space-y-2 text-sm text-foreground" aria-live="polite">
      <p>Wide-screen behaviour: {wide ? 'enabled' : 'disabled'}</p>
      <p>Motion preference: {reducedMotion ? 'reduced' : 'standard'}</p>
      <p className="text-muted-foreground">Resize the viewport or change your system motion preference.</p>
    </div>
  );
}
