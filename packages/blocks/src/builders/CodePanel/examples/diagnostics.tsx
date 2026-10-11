import type { MonacoLoader } from '@gntik-ai/editor';
import { CodePanel, type CodePanelMarker, type MonacoReady } from '../CodePanel';

/** Inject the lazy same-origin loader from the editor README; the kit adds no YAML dependency. */
export default function YamlDiagnosticsExample({
  loader,
  onMonacoReady,
  markers,
  readOnly = false,
  onValidityChange,
}: {
  loader: MonacoLoader;
  onMonacoReady?: MonacoReady;
  markers?: readonly CodePanelMarker[];
  readOnly?: boolean;
  onValidityChange?: (valid: boolean) => void;
}) {
  return (
    <CodePanel
      files={[{ path: 'flow.yaml', language: 'yaml', content: 'count: wrong\n' }]}
      problems={[]}
      loader={loader}
      onMonacoReady={onMonacoReady}
      markers={
        markers ?? [
          {
            id: 'terminal',
            owner: 'semantic-worker',
            severity: 'warning',
            file: 'flow.yaml',
            line: 1,
            message: 'Review the terminal step.',
          },
        ]
      }
      readOnly={readOnly}
      onValidityChange={onValidityChange}
    />
  );
}
