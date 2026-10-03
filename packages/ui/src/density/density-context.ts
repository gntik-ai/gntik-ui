import { createContext, useContext } from 'react';

/** Control density. `comfortable` is the default; `compact` suits data-heavy consoles. */
export type Density = 'compact' | 'comfortable';

export const DensityContext = createContext<Density | null>(null);

/** The nearest DensityProvider's density, or `comfortable` outside any provider. */
export function useDensity(): Density {
  return useContext(DensityContext) ?? 'comfortable';
}

/** The nearest provider's density, or `undefined` outside any provider (for components with their own fallback). */
export function useDensityContext(): Density | undefined {
  return useContext(DensityContext) ?? undefined;
}
