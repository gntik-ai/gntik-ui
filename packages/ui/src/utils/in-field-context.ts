import { createContext } from 'react';

/** True below a kit `Field` (and so a `FormField`): its label, not a default aria-label, names the control. */
export const InFieldContext = createContext(false);
