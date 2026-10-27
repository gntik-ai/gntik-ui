import { Button, DownloadButton, cn } from '@gntik-ai/ui';
import { observeTheme, currentTheme } from '@gntik-ai/tokens/runtime';
import { Check, Copy, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { CodeBlock } from '../Markdown/CodeBlock';
import { useChatI18n } from '../utils/i18n';
import { useCopy } from '../utils/useCopy';
import { renderMermaid } from './loadMermaid';
import { themeVariables } from './themeVariables';
import { useDiagramViewport } from './useDiagramViewport';
import { mermaidDiagramStyles as s } from './mermaidDiagram.variants';

export type DiagramView = 'diagram' | 'code';
export interface MermaidDiagramProps {
  code: string;
  streaming?: boolean;
  defaultView?: DiagramView;
  onViewChange?: (view: DiagramView) => void;
  label?: string;
  className?: string;
}

export function MermaidDiagram({
  code,
  streaming = false,
  defaultView = 'diagram',
  onViewChange,
  label,
  className,
}: MermaidDiagramProps) {
  const { tc, t } = useChatI18n();
  const { copied, status, copy } = useCopy();
  const viewport = useDiagramViewport();
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [result, setResult] = useState<{ code: string; theme: string; svg?: string; failed?: boolean }>();
  const [theme, setTheme] = useState(currentTheme);
  const [view, setView] = useState(defaultView);
  useEffect(() => observeTheme(setTheme), []);
  useEffect(() => {
    let active = true;
    if (!streaming) {
      void renderMermaid(code, id, themeVariables(), () => active)
        .then((svg) => {
          if (active && svg) setResult({ code, theme, svg });
        })
        .catch(() => {
          if (active) setResult({ code, theme, failed: true });
        });
    }
    return () => {
      active = false;
    };
  }, [code, id, streaming, theme]);
  const current = !streaming && result?.code === code && result.theme === theme ? result : undefined;
  const svg = current?.svg ?? '';
  const failed = current?.failed ?? false;
  const showingDiagram = !streaming && !failed && !!svg && view === 'diagram';
  const changeView = (next: DiagramView) => {
    if (view === next) return;
    setView(next);
    onViewChange?.(next);
  };
  return (
    <figure aria-label={label ?? tc('chat.diagram')} className={cn(s.root, className)}>
      <div className={s.toolbar}>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={showingDiagram}
          disabled={!svg || streaming || failed}
          aria-label={tc('chat.showDiagram')}
          onClick={() => changeView('diagram')}
        >
          {tc('chat.diagram')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={!showingDiagram}
          aria-label={tc('chat.showCode')}
          onClick={() => changeView('code')}
        >
          {tc('chat.showCode')}
        </Button>
        {showingDiagram && (
          <Button
            size="sm"
            variant="ghost"
            icon={status === 'failed' ? X : copied ? Check : Copy}
            aria-label={status === 'failed' ? t('common.copyFailed') : t('chat.copyCode')}
            onClick={() => void copy(code)}
          >
            {status === 'failed' ? t('common.copyFailed') : copied ? t('common.copied') : t('common.copy')}
          </Button>
        )}
        <DownloadButton
          size="sm"
          variant="ghost"
          data={svg}
          fileName="diagram.svg"
          mimeType="image/svg+xml"
          disabled={!svg || streaming || failed}
        >
          {tc('chat.downloadSvg')}
        </DownloadButton>
        <Button
          size="sm"
          variant="ghost"
          icon={ZoomIn}
          aria-label={tc('chat.zoomIn')}
          disabled={!showingDiagram}
          onClick={() => viewport.zoom(0.2)}
        />
        <Button
          size="sm"
          variant="ghost"
          icon={ZoomOut}
          aria-label={tc('chat.zoomOut')}
          disabled={!showingDiagram}
          onClick={() => viewport.zoom(-0.2)}
        />
        <Button
          size="sm"
          variant="ghost"
          icon={RotateCcw}
          aria-label={tc('chat.resetZoom')}
          disabled={!showingDiagram}
          onClick={viewport.reset}
        />
      </div>
      {showingDiagram ? (
        <div
          role="region"
          aria-label={label ?? tc('chat.diagram')}
          tabIndex={0}
          className={s.viewport}
          {...viewport.handlers}
        >
          <div
            className={s.canvas}
            style={{ transform: viewport.transform }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </div>
      ) : (
        <CodeBlock code={code} language="mermaid" />
      )}
      {!streaming && (failed || !svg) && (
        <p role="status" className={s.note}>
          {tc(failed ? 'chat.diagramFailed' : 'chat.renderingDiagram')}
        </p>
      )}
    </figure>
  );
}
