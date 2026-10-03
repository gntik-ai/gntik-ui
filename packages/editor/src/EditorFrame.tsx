import type { CSSProperties, ReactNode, Ref } from 'react';
import type { MonacoState } from './loader';

export interface EditorFrameProps {
  state: MonacoState;
  height: number | string;
  label: string;
  className?: string;
  hostRef: Ref<HTMLDivElement>;
}

const SKELETON_LINES = ['w-2/5', 'w-3/4', 'w-1/2', 'w-2/3', 'w-1/3', 'w-3/5'];

/** Token-styled placeholder shown until Monaco has loaded. */
export function EditorSkeleton({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={`Loading ${label}`}
      data-slot="editor-skeleton"
      className="absolute inset-0 flex flex-col gap-3 bg-card px-4 py-3.5"
    >
      {SKELETON_LINES.map((width, i) => (
        <div key={i} className="flex items-center gap-4">
          <span className="h-2.5 w-4 rounded-sm bg-muted motion-safe:animate-pulse" />
          <span className={`h-2.5 ${width} rounded-sm bg-muted motion-safe:animate-pulse`} />
        </div>
      ))}
    </div>
  );
}

function EditorError({ label }: { label: string }): ReactNode {
  return (
    <div
      role="alert"
      data-slot="editor-error"
      className="absolute inset-0 grid place-items-center border border-dashed border-border bg-card px-8 text-center"
    >
      <div>
        <p className="font-sans text-sm font-semibold text-foreground">The {label} could not load</p>
        <p className="mt-1 font-sans text-xs text-muted-foreground">
          Check that <span className="font-mono">monaco-editor</span> is installed and its workers are configured.
        </p>
      </div>
    </div>
  );
}

/** Sized host for a Monaco instance plus its loading and error states. */
export function EditorFrame({ state, height, label, className, hostRef }: EditorFrameProps) {
  const style: CSSProperties = { height };
  return (
    <div
      data-slot="editor"
      data-state={state.status}
      aria-busy={state.status === 'loading' || undefined}
      className={['relative w-full overflow-hidden bg-card', className].filter(Boolean).join(' ')}
      style={style}
    >
      <div ref={hostRef} className="absolute inset-0" />
      {state.status === 'loading' && <EditorSkeleton label={label} />}
      {state.status === 'error' && <EditorError label={label} />}
    </div>
  );
}
