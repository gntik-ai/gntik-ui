import { createContext } from 'react';

/** What `useDocumentTitle` talks to inside a NavigationProvider: one entry per mounted override. */
export interface TitleOverrides {
  /** Set (or update, keeping its place in the stack) the override owned by `owner`. */
  set: (owner: object, title: string) => void;
  /** Drop the override owned by `owner`. */
  remove: (owner: object) => void;
}

export const TitleOverridesContext = createContext<TitleOverrides | null>(null);
