import type { BlockMeta } from '../../meta';

export const meta: BlockMeta = {
  name: 'Code panel',
  family: 'builders',
  status: 'beta',
  description:
    'Multi-file code panel with optional readOnly, owned line markers, onValidityChange and onMonacoReady, merging every Monaco marker owner into Problems; the lazy loader example injects inline YAML schemas and same-origin yaml workers under CSP. The open file can be controlled (activeFile, onActiveFileChange) and the heading level set (headingLevel). Optional readOnly prevents editor edits. markers accepts CodePanelMarker entries {id,owner,file,line,column?,endLine?,endColumn?,severity,message,source?}; each owner is reserved for its consumer diagnostics service. The Problems list merges problems, consumer markers, and Monaco model markers from every owner, including worker-backed YAML schema errors. onValidityChange(valid) fires only when errors cross zero (initially clean emits nothing); warnings do not invalidate. onMonacoReady(monaco) configures consumer services once per Monaco instance and may return cleanup. loader can configure monaco-yaml before mounting; the only supported YAML path is consumer-injected, with enableSchemaRequest:false and an inline schema. examples/diagnostics.tsx demonstrates a semantic-worker owner next to schema diagnostics. See packages/editor/README.md for the lazy Vite yaml.worker recipe, Monaco 0.57 compatibility alias, and CSP worker-src self blob: with same-origin scripts and assets. Supplying markers (including []), onMonacoReady or onValidityChange enables model-marker collection; readOnly controls editing independently. Omitting diagnostics extensions preserves the original supplied-problems-only view. No kit runtime dependency on monaco-yaml.',
  uses: ['Tabs', 'ToggleGroup', 'Toggle', 'CodeEditor', 'DiffEditor'],
};
