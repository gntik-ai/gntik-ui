import type { ReactNode } from 'react';
import { FieldVariantContext, type FieldControlVariant } from './field-variant-context';

export interface FieldVariantProviderProps {
  variant: FieldControlVariant;
  children?: ReactNode;
}

/** Sets field chrome for a subtree without adding a DOM wrapper. Explicit control props win. */
export function FieldVariantProvider({ variant, children }: FieldVariantProviderProps) {
  return <FieldVariantContext value={variant}>{children}</FieldVariantContext>;
}
