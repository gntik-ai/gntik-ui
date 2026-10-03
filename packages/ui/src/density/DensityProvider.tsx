import { useLayoutEffect, type ReactNode, type Ref } from 'react';
import { cn } from '../utils/cn';
import { DensityContext, type Density } from './density-context';

export interface DensityProviderProps {
  /** Density for the subtree: control heights, paddings, table rows. */
  density: Density;
  /**
   * Where the `data-density` attribute goes. `wrapper` (default) renders a `display: contents`
   * div around the children; `document` sets it on <html> (restored on unmount) and renders no element.
   */
  applyTo?: 'wrapper' | 'document';
  /** Classes for the wrapper div (`applyTo="wrapper"` only). Replaces the default `contents` display when it sets one. */
  className?: string;
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

/**
 * Sets `data-density` so the density variables from @gntik-ai/tokens (density.css) re-scope for
 * the subtree, and exposes the value through `useDensity()` for JS-side choices (icon sizes,
 * Table's default density). Components with an explicit `size` keep it; the rest follow density.
 *
 * Data-heavy consoles default to compact: wrap the screen (e.g. a ConsoleShell page) once,
 * `<DensityProvider density="compact"><ConsoleShell>…</ConsoleShell></DensityProvider>`, or use
 * `applyTo="document"` so portalled popups (menus, selects) are compact too.
 */
export function DensityProvider({ density, applyTo = 'wrapper', className, ref, children }: DensityProviderProps) {
  useLayoutEffect(() => {
    if (applyTo !== 'document') return undefined;
    const root = document.documentElement;
    const previous = root.getAttribute('data-density');
    root.setAttribute('data-density', density);
    return () => {
      if (previous == null) root.removeAttribute('data-density');
      else root.setAttribute('data-density', previous);
    };
  }, [applyTo, density]);

  return (
    <DensityContext value={density}>
      {applyTo === 'document' ? (
        children
      ) : (
        <div ref={ref} data-density={density} className={cn('contents', className)}>
          {children}
        </div>
      )}
    </DensityContext>
  );
}
