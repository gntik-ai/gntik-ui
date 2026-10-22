import { createContext, useContext } from 'react';

/** Undefined preserves Base UI's document.body default outside a scope. */
export const PortalContainerContext = createContext<HTMLElement | undefined>(undefined);

export function usePortalContainer(): HTMLElement | undefined {
  return useContext(PortalContainerContext);
}
