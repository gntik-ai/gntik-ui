import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';
import { densityMergeConfig } from './density-merge';

const twMerge = extendTailwindMerge(densityMergeConfig);

/** Joins class names and resolves Tailwind conflicts (last one wins), density utilities included. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
