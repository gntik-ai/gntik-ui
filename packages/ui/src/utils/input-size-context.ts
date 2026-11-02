import { createContext, useContext } from 'react';

/** Addons inherit only the enclosing Input size; standalone controls keep auto sizing. */
export const InputSizeContext = createContext<'auto' | 'sm' | 'md' | 'lg'>('auto');

export function useInputSize() {
  return useContext(InputSizeContext);
}
