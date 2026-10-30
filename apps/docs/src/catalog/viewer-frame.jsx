import { useEffect, useState } from 'react';
import { loadSource } from '../preview-registry.js';
import { previewQuery, usePreviewSettings } from '../preview-settings.jsx';

const { CodeBlock } = window;

const DEVICES = [
  ['Desktop', '100%'],
  ['Tablet', '768px'],
  ['Mobile', '390px'],
];
const THEMES = [
  ['dark', 'Dark'],
  ['light', 'Light'],
  ['high_contrast', 'HC'],
];

function Segmented({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md border border-border bg-card p-0.5">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={
            'h-6 rounded px-2 text-[11.5px] font-medium transition-colors ' +
            (value === v ? 'bg-primary/14 text-primary-text' : 'text-muted-foreground hover:text-foreground')
          }
        >
          {text}
        </button>
      ))}
    </div>
  );
}

export function Viewer({ kind, id, title, file, height }) {
  const [device, setDevice] = useState('100%');
  const [theme, setTheme] = useState(() =>
    document.documentElement.classList.contains('high_contrast')
      ? 'high_contrast'
      : document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light',
  );
  const [tab, setTab] = useState('preview');
  const [code, setCode] = useState('');
  const [auto, setAuto] = useState(null);
  const settings = usePreviewSettings();
  const src = `/preview.html?kind=${kind}&id=${encodeURIComponent(id)}&theme=${theme}${previewQuery(settings)}`;

  useEffect(() => {
    if (kind !== 'block') return undefined;
    const onMsg = (e) => {
      if (e.data?.type === 'gntik-preview-height' && e.data.id === id) setAuto(Math.min(e.data.height, 1200));
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [kind, id]);
  useEffect(() => {
    if (tab !== 'code' || code) return;
    let alive = true;
    loadSource(file).then((c) => alive && setCode(c));
    return () => {
      alive = false;
    };
  }, [tab, file, code]);

  return (
    <div className="mb-3">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Segmented
          label={`${title}: view`}
          options={[
            ['preview', 'Preview'],
            ['code', 'Code'],
          ]}
          value={tab}
          onChange={setTab}
        />
        {tab === 'preview' && (
          <>
            <Segmented
              label={`${title}: device width`}
              options={DEVICES.map(([n, w]) => [w, n])}
              value={device}
              onChange={setDevice}
            />
            <Segmented label={`${title}: theme`} options={THEMES} value={theme} onChange={setTheme} />
          </>
        )}
        <a
          href={src}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-[12px] font-medium text-primary-text underline-offset-4 hover:underline"
        >
          Open in new tab
        </a>
      </div>
      {tab === 'preview' ? (
        <div className="overflow-hidden rounded-lg border border-border bg-muted/40">
          <iframe
            title={`${title} preview`}
            src={src}
            loading="lazy"
            style={{ width: device, height: kind === 'block' ? (auto ?? height) : height }}
            className="mx-auto block border-0 bg-background transition-[width] duration-200 motion-reduce:transition-none"
          />
        </div>
      ) : (
        <CodeBlock code={code || '// loading…'} open />
      )}
    </div>
  );
}
