import { useRef, useState } from 'react';
import { CircleX, FileCode, Info, TriangleAlert } from '@gntik-ai/icons';
import { CodeEditor, DiffEditor, type CodeEditorProps, type MonacoLoader } from '@gntik-ai/editor';
import { Tabs, TabsList, TabsPanel, TabsTab, Toggle, ToggleGroup, cn } from '@gntik-ai/ui';
import { codeFiles, codeProblems, type CodeFile, type CodeProblem, type ProblemSeverity } from './fixtures';

export type { CodeFile, CodeProblem, ProblemSeverity } from './fixtures';

type CodeEditorInstance = Parameters<NonNullable<CodeEditorProps['onMount']>>[0];
type View = 'code' | 'diff';

const SEVERITY: Record<ProblemSeverity, { label: string; icon: typeof CircleX; className: string }> = {
  error: { label: 'Error', icon: CircleX, className: 'text-destructive-text' },
  warning: { label: 'Warning', icon: TriangleAlert, className: 'text-warning-text' },
  info: { label: 'Info', icon: Info, className: 'text-muted-foreground' },
};

export interface CodePanelProps {
  files?: CodeFile[];
  problems?: CodeProblem[];
  /** Path of the file opened first (uncontrolled; defaults to the first file). */
  defaultFile?: string;
  /** Path of the open file (controlled). Pair with `onActiveFileChange`. */
  activeFile?: string;
  /** Called with the path of the file to open (tab click, arrow keys, or a problem in another file). */
  onActiveFileChange?: (path: string) => void;
  /** Heading level of the "Problems" heading, to fit the page outline (default 3). */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  defaultView?: View;
  /** Editor height (px or CSS length). */
  height?: number | string;
  /** Called with the file path and its new text on every edit. */
  onChange?: (path: string, value: string) => void;
  /** Called when a problem is picked in the list (the editor also jumps to it). */
  onProblemSelect?: (problem: CodeProblem) => void;
  /** Monaco loader passed to the editors (self-hosting, tests). Monaco loads lazily by default. */
  loader?: MonacoLoader;
  className?: string;
}

function basename(path: string) {
  return path.split('/').pop() ?? path;
}

/**
 * Multi-file code panel: file tabs, Monaco editor (or diff against the previous version) and
 * a problems list that jumps to the reported line. Monaco is loaded lazily by @gntik-ai/editor.
 */
export function CodePanel({
  files = codeFiles,
  problems = codeProblems,
  defaultFile,
  activeFile: activeProp,
  onActiveFileChange,
  headingLevel = 3,
  defaultView = 'code',
  height = 360,
  onChange,
  onProblemSelect,
  loader,
  className,
}: CodePanelProps) {
  const [innerActive, setInnerActive] = useState(defaultFile ?? files[0]?.path ?? '');
  const active = activeProp ?? innerActive;
  const setActive = (path: string) => {
    if (path === active) return;
    setInnerActive(path);
    onActiveFileChange?.(path);
  };
  const ProblemsHeading = `h${headingLevel}` as const;
  const [view, setView] = useState<View>(defaultView);
  const [values, setValues] = useState<Record<string, string>>({});
  const editors = useRef(new Map<string, CodeEditorInstance>());
  const pending = useRef<CodeProblem | null>(null);

  const currentFile = files.find((f) => f.path === active);
  const canDiff = currentFile?.original !== undefined;
  const effectiveView: View = canDiff ? view : 'code';
  const errors = problems.filter((p) => p.severity === 'error').length;
  const warnings = problems.filter((p) => p.severity === 'warning').length;

  const reveal = (ed: CodeEditorInstance, problem: CodeProblem) => {
    try {
      ed.setPosition({ lineNumber: problem.line, column: problem.column ?? 1 });
      ed.revealLineInCenter(problem.line);
      ed.focus();
    } catch {
      /* editor not ready or disposed */
    }
  };

  const selectProblem = (problem: CodeProblem) => {
    onProblemSelect?.(problem);
    setActive(problem.file);
    setView('code');
    const ed = editors.current.get(problem.file);
    if (ed && ed.getModel() && problem.file === active && effectiveView === 'code') reveal(ed, problem);
    else pending.current = problem;
  };

  const onMount = (path: string) => (ed: CodeEditorInstance) => {
    editors.current.set(path, ed);
    const p = pending.current;
    if (p && p.file === path) {
      pending.current = null;
      reveal(ed, p);
    }
  };

  const valueOf = (f: CodeFile) => values[f.path] ?? f.content;

  return (
    <section
      aria-label="Code panel"
      className={cn('flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm', className)}
    >
      <Tabs value={active} onValueChange={(v) => setActive(String(v))} className="gap-0">
        <div className="flex flex-col gap-2 border-b border-border bg-secondary/35 px-3 pt-1 sm:flex-row sm:items-end sm:justify-between">
          <TabsList aria-label="Open files" className="-mb-px gap-4 overflow-x-auto border-b-0">
            {files.map((f) => {
              const count = problems.filter((p) => p.file === f.path).length;
              return (
                <TabsTab key={f.path} value={f.path} icon={FileCode} count={count || undefined} className="font-mono text-[12px]">
                  {basename(f.path)}
                </TabsTab>
              );
            })}
          </TabsList>
          <ToggleGroup
            aria-label="Editor view"
            size="sm"
            value={[effectiveView]}
            onValueChange={(v) => v[0] && setView(v[0] as View)}
            className="mb-2 self-start sm:self-auto"
          >
            <Toggle value="code">Edit</Toggle>
            <Toggle value="diff" disabled={!canDiff}>
              Diff
            </Toggle>
          </ToggleGroup>
        </div>
        {files.map((f) => (
          <TabsPanel key={f.path} value={f.path} className="rounded-none">
            {effectiveView === 'diff' && f.original !== undefined ? (
              <DiffEditor
                original={f.original}
                modified={valueOf(f)}
                language={f.language}
                height={height}
                aria-label={`${f.path} changes`}
                loader={loader}
              />
            ) : (
              <CodeEditor
                value={valueOf(f)}
                language={f.language}
                height={height}
                aria-label={f.path}
                loader={loader}
                onMount={onMount(f.path)}
                onChange={(v) => {
                  setValues((prev) => ({ ...prev, [f.path]: v }));
                  onChange?.(f.path, v);
                }}
              />
            )}
          </TabsPanel>
        ))}
      </Tabs>
      <div className="border-t border-border">
        <div className="flex items-center gap-3 bg-secondary/35 px-3 py-2">
          <ProblemsHeading className="text-[12px] font-semibold tracking-wide text-foreground uppercase">Problems</ProblemsHeading>
          <span className="font-mono text-[11px] text-muted-foreground">
            {errors} {errors === 1 ? 'error' : 'errors'} · {warnings} {warnings === 1 ? 'warning' : 'warnings'}
          </span>
        </div>
        {problems.length === 0 ? (
          <p className="px-3 py-3 text-[12.5px] text-muted-foreground">No problems detected.</p>
        ) : (
          <ul aria-label="Problems" className="max-h-40 overflow-y-auto py-1">
            {problems.map((p) => {
              const sev = SEVERITY[p.severity];
              const SevIcon = sev.icon;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => selectProblem(p)}
                    className="flex w-full items-start gap-2 px-3 py-1.5 text-start text-[12.5px] hover:bg-secondary/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-focus-ring"
                  >
                    <SevIcon size={14} aria-hidden className={cn('mt-0.5 shrink-0', sev.className)} />
                    <span className="sr-only">{sev.label}:</span>
                    <span className="min-w-0 flex-1 text-foreground">{p.message}</span>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                      {basename(p.file)}:{p.line}
                      {p.column !== undefined ? `:${p.column}` : ''}
                      {p.source ? ` · ${p.source}` : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
