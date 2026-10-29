import { createContext, type ReactNode } from 'react';

/** Internal adapter preserving the WorkspaceSwitcher presentation; not a package export. */
export const SearchableSelectPresentation = createContext<{
  popupLabel?: string;
  popupClassName?: string;
  listClassName?: string;
  emptyClassName?: string;
  optionClassName?: string;
  sideOffset?: number;
  renderOption?: (key: string) => ReactNode;
  renderAction?: (id: string) => ReactNode;
} | null>(null);
