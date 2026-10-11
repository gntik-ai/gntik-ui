import { TriangleAlert } from '@gntik-ai/icons';
import type { FlowValidationIssue } from './extensions';
import type { PanelHeading } from './parts';

export function FlowProblems({
  issues,
  onSelect,
  titleAs: Title = 'h3',
}: {
  issues: readonly FlowValidationIssue[];
  onSelect: (id: string) => void;
  titleAs?: PanelHeading;
}) {
  if (!issues.length) return null;
  return (
    <div className="max-h-40 shrink-0 overflow-auto border-b border-border px-3 py-2">
      <Title className="text-[12px] font-semibold text-foreground">Problems</Title>
      <ul aria-label="Flow problems" className="text-[12px] text-foreground">
        {issues.map((issue, i) => (
          <li key={`${issue.code}-${issue.nodeId ?? ''}-${i}`} className="flex items-center gap-2">
            <TriangleAlert size={14} aria-hidden className="shrink-0 text-destructive-text" />
            {issue.nodeId ? (
              <button
                type="button"
                onClick={() => onSelect(issue.nodeId!)}
                className="text-start underline focus-visible:outline-2 focus-visible:outline-focus-ring"
              >
                {issue.code}: {issue.message} · {issue.nodeId}
              </button>
            ) : (
              <span>
                {issue.code}: {issue.message} (Flow)
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
