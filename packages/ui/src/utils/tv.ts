import { createTV } from 'tailwind-variants';
import { densityMergeConfig } from './density-merge';

export { type VariantProps } from 'tailwind-variants';

/** `tv()` with tailwind-merge aware of the density utilities (h-control, px-control…). */
export const tv = createTV({ twMergeConfig: densityMergeConfig });
