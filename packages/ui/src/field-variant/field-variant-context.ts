import { createContext, useContext } from 'react';

/** Field chrome; outline preserves the original bordered appearance. */
export type FieldControlVariant = 'outline' | 'filled' | 'ghost';
export const FieldVariantContext = createContext<FieldControlVariant>('outline');

/** Explicit props win over the nearest provider, then the outline default. */
export function useFieldVariant(variant?: FieldControlVariant): FieldControlVariant {
  const inherited = useContext(FieldVariantContext);
  return variant ?? inherited;
}
