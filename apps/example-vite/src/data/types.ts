import type { ComponentProps, JSXElementConstructor } from 'react';

/**
 * The templates export their pages, not their data types: read the shape of a prop straight
 * from the page, e.g. `ItemOf<typeof NotificationInboxPage, 'notifications'>`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Page = JSXElementConstructor<any>;
export type PropOf<P extends Page, K extends keyof ComponentProps<P>> = NonNullable<ComponentProps<P>[K]>;
export type ItemOf<P extends Page, K extends keyof ComponentProps<P>> = PropOf<P, K> extends ReadonlyArray<infer T> ? T : never;
