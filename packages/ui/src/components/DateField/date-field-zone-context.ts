import { createContext } from 'react';

/** Zone identity invalidates incomplete picker drafts without replacing any DOM nodes. */
export const DateFieldZoneContext = createContext('system');
