import { createContext } from 'react';

/** What `useDocumentTitle` talks to inside a NavigationProvider: one entry per mounted override. */
export interface TitleOverrides {
  /**
   * A rank for a new override. Hooks take one while rendering, and a parent renders before its
   * children, so a deeper component always ranks higher; the highest rank wins.
   */
  rank: () => number;
  /** Set (or update, keeping its rank) the override owned by `owner`. */
  set: (owner: object, rank: number, title: string) => void;
  /** Drop the override owned by `owner`. */
  remove: (owner: object) => void;
}

export const TitleOverridesContext = createContext<TitleOverrides | null>(null);
