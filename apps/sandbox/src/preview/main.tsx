// The preview frame: receives source from the shell, compiles it and renders it in its own
// document, so the theme class, breakpoints (frame width) and crashes stay isolated.
import '../index.css';
import { Component, StrictMode, useEffect, useState, type ComponentPropsWithRef, type ComponentType, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LinkProvider,
  ThemeProvider,
  ToastProvider,
  Toaster,
  TooltipProvider,
  presets,
  type ResolvedTheme,
} from '@gntik-ai/ui';
import { isRenderMessage, type BrandId, type PreviewMessage, type SandboxError } from '../protocol';
import { build, toSandboxError } from './runtime';

function post(message: PreviewMessage) {
  if (window.parent !== window) window.parent.postMessage(message, location.origin);
}

/** Links inside the preview never navigate the frame away. */
function InertLink(props: ComponentPropsWithRef<'a'>) {
  return (
    <a
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        e.preventDefault();
      }}
    />
  );
}

interface BoundaryProps {
  children: ReactNode;
  /** False for a stale render kept on screen behind a newer error: its failure is not news. */
  report: boolean;
}

/** Catches render errors of the user component; the shell shows them in its error panel. */
class PreviewBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown, info: ErrorInfo) {
    if (!this.props.report) return;
    const err = toSandboxError(error);
    post({ type: 'gntik-sandbox:error', error: { ...err, details: [err.details, info.componentStack].filter(Boolean).join('\n') } });
  }
  render() {
    if (this.state.failed) {
      return <p className="p-6 text-[13px] text-muted-foreground">The component threw while rendering. See the error panel.</p>;
    }
    return this.props.children;
  }
}

/** Reports a successful mount (after the user tree's own effects ran). */
function Mounted({ children }: { children: ReactNode }) {
  useEffect(() => post({ type: 'gntik-sandbox:rendered' }), []);
  return children;
}

interface Job {
  id: number;
  theme: ResolvedTheme;
  brand: BrandId;
  App: ComponentType | null;
  error: SandboxError | null;
}

let nextId = 0;

function Preview() {
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== location.origin || !isRenderMessage(event.data)) return;
      const { code, theme, brand } = event.data;
      let App: ComponentType | null = null;
      let error: SandboxError | null = null;
      try {
        App = build(code);
      } catch (e) {
        error = toSandboxError(e);
      }
      if (error) post({ type: 'gntik-sandbox:error', error });
      nextId += 1;
      setJob((prev) => ({
        id: nextId,
        theme,
        brand,
        // Keep the last good render on screen while the source has an error.
        App: App ?? prev?.App ?? null,
        error,
      }));
    };
    window.addEventListener('message', onMessage);
    post({ type: 'gntik-sandbox:ready' });
    return () => window.removeEventListener('message', onMessage);
  }, []);

  if (!job) return <p className="p-6 text-[13px] text-muted-foreground">Waiting for code…</p>;
  const { App } = job;
  return (
    <ThemeProvider key={job.theme} defaultMode={job.theme} storageKey={null} brand={presets[job.brand]}>
      <TooltipProvider>
        <ToastProvider>
          <LinkProvider component={InertLink}>
            {!App && <p className="p-6 text-[13px] text-muted-foreground">Fix the error to see the preview.</p>}
            {App && (
              <PreviewBoundary key={job.id} report={!job.error}>
                {job.error ? (
                  <App />
                ) : (
                  <Mounted>
                    <App />
                  </Mounted>
                )}
              </PreviewBoundary>
            )}
          </LinkProvider>
          <Toaster />
        </ToastProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

// Errors thrown outside render (event handlers, timers, promises) go to the shell too.
window.addEventListener('error', (e) => post({ type: 'gntik-sandbox:error', error: toSandboxError(e.error ?? e.message) }));
window.addEventListener('unhandledrejection', (e) => post({ type: 'gntik-sandbox:error', error: toSandboxError(e.reason) }));

createRoot(document.getElementById('root')!, {
  // The boundary already reports caught errors to the shell; keep the console for real problems.
  onCaughtError: () => {},
}).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
