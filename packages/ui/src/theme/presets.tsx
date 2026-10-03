import type { ReactNode } from 'react';
import { MUSEMATIC_MARK_PATH } from './musematic-mark';

/**
 * A brand preset is a product skin: name and logo only. Colours never change
 * between presets — every product renders the frozen tokens of @gntik-ai/tokens.
 */
export interface BrandPreset {
  id: string;
  /** Product name, used in the wordmark and as the logo's accessible name. */
  name: string;
  /** Renders the square mark at `size` px. */
  mark: (size: number) => ReactNode;
}

/** Neutral default: a token-coloured monogram, no product named. */
export const gntikPreset: BrandPreset = {
  id: 'gntik',
  name: 'gntik',
  mark: (size) => (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="block shrink-0">
      <rect width="64" height="64" rx="14" className="fill-chrome" />
      <path
        d="M41 24.5A11 11 0 1 0 43 32h-11"
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        className="stroke-primary"
      />
    </svg>
  ),
};

export const musematicPreset: BrandPreset = {
  id: 'musematic',
  name: 'musematic',
  mark: (size) => (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="block shrink-0">
      <rect width="64" height="64" rx="14" fill="#0C2017" />
      <svg x="9" y="9" width="46" height="46" viewBox="0 0 512 512">
        <path fill="#33CE73" fillRule="evenodd" d={MUSEMATIC_MARK_PATH} />
      </svg>
    </svg>
  ),
};

/**
 * Falcone — PLACEHOLDER until the product's logo artwork lands: a token-coloured "F" monogram.
 * Swap `mark` for the real artwork (as musematic does); the name and id stay.
 */
export const falconePreset: BrandPreset = {
  id: 'falcone',
  name: 'Falcone',
  mark: (size) => (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="block shrink-0">
      <rect width="64" height="64" rx="14" className="fill-chrome" />
      <path d="M24 46V18h18M24 32h13" fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="stroke-primary" />
    </svg>
  ),
};

export const presets = { gntik: gntikPreset, musematic: musematicPreset, falcone: falconePreset } as const;
