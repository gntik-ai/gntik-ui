// Standalone renderer for the docs viewers: /preview.html?kind=block|layout|template&id=…&theme=…
// Each viewer embeds this page in an iframe, so breakpoints follow the frame width and every
// frame can show its own theme.
import './styles.css';
import { StrictMode, Suspense, lazy, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, ToastProvider, Toaster, TooltipProvider } from '@gntik-ai/ui';
import { PREVIEW_LOADERS } from './preview-registry.js';

const params = new URLSearchParams(location.search);
const kind = params.get('kind') ?? 'block';
const id = params.get('id') ?? '';
const theme = ['dark', 'light', 'high_contrast'].includes(params.get('theme')) ? params.get('theme') : 'dark';
const padded = params.get('pad') !== '0';

function Preview() {
  const Comp = useMemo(() => {
    const load = PREVIEW_LOADERS[kind]?.[id];
    return load ? lazy(load) : null;
  }, []);
  if (!Comp) return <p className="p-6 text-[13px] text-muted-foreground">Nothing to preview for {kind} “{id}”.</p>;
  return (
    <Suspense fallback={<p className="p-6 text-[13px] text-muted-foreground">Loading…</p>}>
      <Comp />
    </Suspense>
  );
}

// Report the content height so block viewers can size their iframe to fit.
if (window.parent !== window) {
  const post = () => window.parent.postMessage({ type: 'gntik-preview-height', id, kind, height: document.documentElement.scrollHeight }, '*');
  new ResizeObserver(post).observe(document.body);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultMode={theme} storageKey={null}>
      <TooltipProvider>
        <ToastProvider>
          <div className={kind === 'block' ? (padded ? 'p-6' : '') : 'h-dvh'}>
            <Preview />
          </div>
          <Toaster />
        </ToastProvider>
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
);
