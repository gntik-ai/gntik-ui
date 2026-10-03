import { ArrowLeft } from 'lucide-react';
import { useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '../../utils/cn';
import { Button } from '../../components/Button';
import { ResizablePanel, ResizablePanelGroup, ResizeHandle } from '../../components/Resizable';
import { useI18n } from '../../i18n/I18nProvider';
import { splitLayoutVariants } from './split-layout.variants';

export interface SplitLayoutProps {
  className?: string;
  /** The list pane (records, threads, files…). */
  list: ReactNode;
  /** The detail pane for the selected item. */
  detail: ReactNode;
  /** Header of the list pane (title, search, filters). */
  listHeader?: ReactNode;
  /** Header of the detail pane, after the Back button. */
  detailHeader?: ReactNode;
  /** Small screens: which pane is visible. Large screens always show both. */
  showDetail?: boolean;
  defaultShowDetail?: boolean;
  onShowDetailChange?: (showDetail: boolean) => void;
  /** Accessible names of the two regions. */
  listLabel?: string;
  detailLabel?: string;
  backLabel?: string;
  /** List pane size in % of the width (large screens). */
  defaultListSize?: number;
  minListSize?: number;
  maxListSize?: number;
  /** Remembers the pane sizes in localStorage. */
  autoSaveId?: string;
  fullScreen?: boolean;
}

/**
 * Master–detail layout: a resizable list pane beside a detail pane (ResizablePanelGroup). Below lg
 * only one pane shows: the list, or the detail with a Back button (`showDetail`, controllable).
 */
export function SplitLayout({
  className,
  list,
  detail,
  listHeader,
  detailHeader,
  showDetail: showDetailProp,
  defaultShowDetail = false,
  onShowDetailChange,
  listLabel: listLabelProp,
  detailLabel: detailLabelProp,
  backLabel: backLabelProp,
  defaultListSize = 35,
  minListSize = 20,
  maxListSize = 60,
  autoSaveId,
  fullScreen = false,
}: SplitLayoutProps) {
  const { t } = useI18n();
  const listLabel = listLabelProp ?? t('split.list');
  const detailLabel = detailLabelProp ?? t('split.details');
  const backLabel = backLabelProp ?? t('common.back');
  const id = useId();
  const listRef = useRef<HTMLElement>(null);
  const [showDetailState, setShowDetailState] = useState(defaultShowDetail);
  const showDetail = showDetailProp ?? showDetailState;
  const s = splitLayoutVariants({ fullScreen, showDetail });

  function back() {
    setShowDetailState(false);
    onShowDetailChange?.(false);
    // The list pane becomes visible again: take focus there so keyboard users don't land on <body>.
    requestAnimationFrame(() => listRef.current?.focus());
  }

  return (
    <div className={cn(s.root(), className)} data-show-detail={showDetail || undefined}>
      <ResizablePanelGroup className={s.group()} autoSaveId={autoSaveId}>
        <ResizablePanel id={`${id}-list`} defaultSize={defaultListSize} minSize={minListSize} maxSize={maxListSize} className={s.list()}>
          <section ref={listRef} tabIndex={-1} aria-label={listLabel} className={s.pane()}>
            {listHeader && <div className={s.paneHeader()}>{listHeader}</div>}
            <div className={s.paneBody()}>{list}</div>
          </section>
        </ResizablePanel>
        <ResizeHandle aria-label={`Resize ${listLabel.toLowerCase()}`} className={s.handle()} />
        <ResizablePanel id={`${id}-detail`} className={s.detail()}>
          <section aria-label={detailLabel} className={s.pane()}>
            <div className={cn(s.paneHeader(), !detailHeader && 'lg:hidden')}>
              <Button variant="ghost" size="sm" icon={ArrowLeft} className={s.back()} onClick={back}>
                {backLabel}
              </Button>
              {detailHeader}
            </div>
            <div className={s.paneBody()}>{detail}</div>
          </section>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
