import { Eye, PanelLeft } from '@gntik-ai/icons';
import { Badge, Button, SplitLayout, useTheme, useToast, type ResolvedTheme } from '@gntik-ai/ui';
import { useEffect, useState } from 'react';
import { EXAMPLES } from './examples';
import { PreviewPane, type PreviewStatus } from './PreviewPane';
import type { BrandId } from './protocol';
import { SandboxToolbar, type DeviceWidth } from './SandboxToolbar';
import { decodeShare, encodeShare } from './share';
import { SourceEditor } from './SourceEditor';

const STATUS_BADGE: Record<PreviewStatus, { tone: 'neutral' | 'success' | 'destructive'; label: string }> = {
  pending: { tone: 'neutral', label: 'Compiling…' },
  ok: { tone: 'success', label: 'Rendered' },
  error: { tone: 'destructive', label: 'Error' },
};

export interface SandboxProps {
  brand: BrandId;
  onBrand: (brand: BrandId) => void;
}

/** The playground: editor on the left, live preview on the right. */
export function Sandbox({ brand, onBrand }: SandboxProps) {
  const toast = useToast();
  const { resolved, setMode } = useTheme();
  const [code, setCode] = useState(EXAMPLES[0].code);
  const [exampleId, setExampleId] = useState<string | null>(EXAMPLES[0].id);
  const [device, setDevice] = useState<DeviceWidth>('desktop');
  const [status, setStatus] = useState<PreviewStatus>('pending');
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load a shared link on start, and whenever the hash changes (a link pasted in this tab).
  useEffect(() => {
    let alive = true;
    const load = () => {
      if (!location.hash) return;
      void decodeShare(location.hash).then((shared) => {
        if (!alive) return;
        if (!shared) {
          toast.add({ tone: 'warning', title: 'This link could not be opened', description: 'Its code is damaged or was made by a newer sandbox.' });
          return;
        }
        setCode(shared.code);
        setExampleId(EXAMPLES.find((e) => e.code === shared.code)?.id ?? null);
        setStatus('pending');
        if (shared.theme) setMode(shared.theme);
        if (shared.brand) onBrand(shared.brand);
      });
    };
    load();
    window.addEventListener('hashchange', load);
    return () => {
      alive = false;
      window.removeEventListener('hashchange', load);
    };
    // Mount-only: the hash is the source of truth when the page (re)loads.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const edit = (next: string) => {
    setCode(next);
    setStatus('pending');
  };

  const pickExample = (id: string) => {
    const example = EXAMPLES.find((e) => e.id === id);
    if (!example) return;
    setExampleId(id);
    edit(example.code);
  };

  const share = async () => {
    const hash = await encodeShare({ code, theme: resolved, brand });
    // replaceState: no hashchange event, so the editor is not reloaded from the hash.
    history.replaceState(null, '', `#${hash}`);
    try {
      await navigator.clipboard.writeText(location.href);
      setCopied(true);
    } catch {
      toast.add({ tone: 'info', title: 'Link ready', description: 'Clipboard access was blocked: copy the link from the address bar.' });
    }
  };

  const badge = STATUS_BADGE[status];

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      <SandboxToolbar
        exampleId={exampleId}
        onExample={pickExample}
        theme={resolved}
        onTheme={(t: ResolvedTheme) => setMode(t)}
        brand={brand}
        onBrand={onBrand}
        device={device}
        onDevice={setDevice}
        copied={copied}
        onShare={() => void share()}
      />
      <main className="min-h-0 flex-1">
        <SplitLayout
          listLabel="Source"
          detailLabel="Preview"
          backLabel="Code"
          showDetail={showPreview}
          onShowDetailChange={setShowPreview}
          defaultListSize={45}
          autoSaveId="gntik-sandbox-split"
          listHeader={
            <>
              <PanelLeft size={15} aria-hidden className="text-muted-foreground" />
              <span className="font-mono text-[12.5px] text-foreground">App.tsx</span>
              <Badge tone={badge.tone} dot className="ml-auto" aria-live="polite">
                {badge.label}
              </Badge>
              <Button size="sm" variant="ghost" icon={Eye} className="lg:hidden" onClick={() => setShowPreview(true)}>
                Preview
              </Button>
            </>
          }
          list={<SourceEditor value={code} onChange={edit} />}
          detailHeader={<span className="truncate text-[12.5px] text-muted-foreground">Imports: @gntik-ai/ui · blocks · templates · charts · icons · chat · flow</span>}
          detail={<PreviewPane code={code} theme={resolved} brand={brand} device={device} onStatus={setStatus} />}
        />
      </main>
    </div>
  );
}
