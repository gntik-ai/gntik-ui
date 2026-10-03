import { ErrorPanel } from '@gntik-ai/blocks';
import { useEffect, useRef, useState } from 'react';
import type { ResolvedTheme } from '@gntik-ai/ui';
import { isPreviewMessage, type BrandId, type RenderMessage, type SandboxError } from './protocol';
import { DEVICES, type DeviceWidth } from './SandboxToolbar';

export type PreviewStatus = 'pending' | 'ok' | 'error';

export interface PreviewPaneProps {
  code: string;
  theme: ResolvedTheme;
  brand: BrandId;
  device: DeviceWidth;
  /** Called with every status change reported by the frame. */
  onStatus: (status: PreviewStatus) => void;
}

const PREVIEW_URL = `${import.meta.env.BASE_URL}preview.html`;
const DEBOUNCE_MS = 250;

/**
 * The preview frame plus the error panel. The frame compiles and renders the code itself, so a
 * crash there never takes the editor down; errors come back as messages.
 */
export function PreviewPane({ code, theme, brand, device, onStatus }: PreviewPaneProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [readyCount, setReadyCount] = useState(0);
  const [error, setError] = useState<SandboxError | null>(null);
  const onStatusRef = useRef(onStatus);
  useEffect(() => {
    onStatusRef.current = onStatus;
  });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow || !isPreviewMessage(event.data)) return;
      const msg = event.data;
      if (msg.type === 'gntik-sandbox:ready') setReadyCount((n) => n + 1);
      else if (msg.type === 'gntik-sandbox:rendered') {
        setError(null);
        onStatusRef.current('ok');
      } else {
        setError(msg.error);
        onStatusRef.current('error');
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const send = (msg: RenderMessage) => frame.current?.contentWindow?.postMessage(msg, location.origin);

  useEffect(() => {
    if (readyCount === 0) return undefined;
    const timer = setTimeout(() => send({ type: 'gntik-sandbox:render', code, theme, brand }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [code, theme, brand, readyCount]);

  const width = DEVICES.find((d) => d.value === device)?.px ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-muted/40">
        <iframe
          ref={frame}
          src={PREVIEW_URL}
          title="Preview"
          className={width ? 'h-full shrink-0 border-x border-border bg-background' : 'h-full w-full bg-background'}
          style={width ? { width } : undefined}
        />
      </div>
      {error && (
        <div className="max-h-[45%] shrink-0 overflow-y-auto border-t border-border bg-background p-3" role="alert">
          <ErrorPanel
            title={error.kind === 'compile' ? 'The code doesn’t compile' : 'The code threw an error'}
            message={error.message}
            code={error.kind}
            requestId=""
            details={error.details ?? ''}
            secondaryAction={null}
            onRetry={() => send({ type: 'gntik-sandbox:render', code, theme, brand })}
            retryLabel="Run again"
          />
        </div>
      )}
    </div>
  );
}
