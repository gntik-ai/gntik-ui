import pkg from '../package.json' with { type: 'json' };

export const VERSION: string = pkg.version;

export type { Codemod, CodemodMeta, TransformFn } from './types.js';
export { codemods, transforms, getCodemod, selectTransforms, appliesTo, type SelectOptions } from './registry.js';
export { runCodemods, applyCodemods, collectFiles, SOURCE_EXTENSIONS, type RunOptions, type RunResult, type FileResult, type CodemodReport } from './run.js';
export { compareVersions, parseVersion } from './semver.js';
export { RENAMES as templateRenames } from './transforms/templates-renamed-ids.js';
export { rewriteChipText, tintedTones } from './transforms/chip-text-aliases.js';
