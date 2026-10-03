// Messages between the sandbox shell (index.html) and the preview frame (preview.html).
import type { ResolvedTheme } from '@gntik-ai/ui';

export type BrandId = 'gntik' | 'musematic' | 'falcone';

export interface SandboxError {
  /** `compile`: sucrase rejected the source. `runtime`: evaluating or rendering it threw. */
  kind: 'compile' | 'runtime';
  message: string;
  details?: string;
}

/** Shell → preview: render this source with this theme and brand. */
export interface RenderMessage {
  type: 'gntik-sandbox:render';
  code: string;
  theme: ResolvedTheme;
  brand: BrandId;
}

/** Preview → shell. `ready` once listening; `rendered` after a successful mount; `error` otherwise. */
export type PreviewMessage =
  | { type: 'gntik-sandbox:ready' }
  | { type: 'gntik-sandbox:rendered' }
  | { type: 'gntik-sandbox:error'; error: SandboxError };

const PREVIEW_TYPES = new Set(['gntik-sandbox:ready', 'gntik-sandbox:rendered', 'gntik-sandbox:error']);

export function isPreviewMessage(data: unknown): data is PreviewMessage {
  return typeof data === 'object' && data !== null && PREVIEW_TYPES.has((data as { type?: unknown }).type as string);
}

export function isRenderMessage(data: unknown): data is RenderMessage {
  if (typeof data !== 'object' || data === null) return false;
  const m = data as Partial<RenderMessage>;
  return m.type === 'gntik-sandbox:render' && typeof m.code === 'string';
}

export const THEMES: ReadonlyArray<{ value: ResolvedTheme; label: string }> = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'high_contrast', label: 'High contrast' },
];

export const BRANDS: ReadonlyArray<{ value: BrandId; label: string }> = [
  { value: 'gntik', label: 'gntik' },
  { value: 'musematic', label: 'musematic' },
  { value: 'falcone', label: 'Falcone' },
];
