import { useState } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { useVirtualWindow } from '../index';

const COUNT = 1000;
const ROW = 32;
const VIEWPORT = 160;
const sizeOf = () => ROW;

export default function VirtualWindowExample() {
  const { t } = useI18n();
  const [scrollTop, setScrollTop] = useState(0);
  const { start, end, total } = useVirtualWindow(COUNT, sizeOf, scrollTop, VIEWPORT, 1);
  const rows = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  return (
    <div className="flex flex-col gap-3 text-sm text-foreground">
      <p aria-live="polite">{t('hooksExample.virtualWindow.rows', { start, end, total: COUNT })}</p>
      <div
        tabIndex={0}
        role="region"
        aria-label={t('hooksExample.virtualWindow.list')}
        className="max-w-sm overflow-auto rounded-md border border-border bg-card focus-ring"
        style={{ height: VIEWPORT }}
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
      >
        <div className="relative" style={{ height: total }}>
          {rows.map((index) => (
            <div key={index} className="absolute inset-x-0 px-3 leading-8" style={{ top: index * ROW, height: ROW }}>
              {t('hooksExample.virtualWindow.row', { number: index + 1 })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
