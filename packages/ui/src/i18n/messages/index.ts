import { en, type Messages } from './en';
import { es } from './es';

/** Built-in catalogs, by language subtag. */
export const catalogs = { en, es } satisfies Record<string, Messages>;
export type CatalogLocale = keyof typeof catalogs;
