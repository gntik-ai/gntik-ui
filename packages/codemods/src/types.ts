import type { API, FileInfo, Options } from 'jscodeshift';

export interface CodemodMeta {
  /** Stable id, used by `gntik-ui upgrade --codemod <id>`. */
  id: string;
  /** Package whose breaking change the transform migrates. */
  package: string;
  /** Last version with the old API. */
  fromVersion: string;
  /** First version with the new API; the transform applies to upgrades that cross it. */
  toVersion: string;
  description: string;
  /** Only reports (warnings); never rewrites code. */
  reportOnly: boolean;
}

/** A jscodeshift transform: returns the new source, or null/undefined to leave the file alone. */
export type TransformFn = (file: FileInfo, api: API, options: Options) => string | null | undefined;

export interface Codemod {
  meta: CodemodMeta;
  transform: TransformFn;
}
