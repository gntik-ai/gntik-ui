// Standalone renderer for the docs viewers:
// /preview.html?kind=block|layout|template&id=…&theme=…[&density=compact][&dir=rtl]
// Each viewer embeds this page in an iframe, so breakpoints follow the frame width and every
// frame can show its own theme. Density and direction apply to the whole document (no wrapper
// elements, so the default render is unchanged).
import './styles.css';
import { StrictMode, Suspense, lazy, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { DensityProvider, I18nProvider, ThemeProvider, ToastProvider, Toaster, TooltipProvider } from '@gntik-ai/ui';
import { PREVIEW_LOADERS } from './preview-registry.js';

const params = new URLSearchParams(location.search);
const kind = params.get('kind') ?? 'block';
const id = params.get('id') ?? '';
const theme = ['dark', 'light', 'high_contrast'].includes(params.get('theme')) ? params.get('theme') : 'dark';
const padded = params.get('pad') !== '0';
const density = params.get('density') === 'compact' ? 'compact' : 'comfortable';
const dir = params.get('dir') === 'rtl' ? 'rtl' : 'ltr';

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
      <DensityProvider density={density} applyTo="document">
        <I18nProvider locale="en" dir={dir} applyTo="document">
          <TooltipProvider>
            <ToastProvider>
              <div className={kind === 'block' ? (padded ? 'p-6' : '') : 'h-dvh'}>
                <Preview />
              </div>
              <Toaster />
            </ToastProvider>
          </TooltipProvider>
        </I18nProvider>
      </DensityProvider>
    </ThemeProvider>
  </StrictMode>,
);
