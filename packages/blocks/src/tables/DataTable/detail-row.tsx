import { TableCell, TableRow } from '@gntik-ai/ui';
import { useCallback, type ReactNode } from 'react';

/** Measure the scroll viewport, rather than the wider table, for a readable sticky panel. */
export function DetailRow({
  id,
  labelledBy,
  span,
  children,
}: {
  id: string;
  labelledBy: string;
  span: number;
  children: ReactNode;
}) {
  const measure = useCallback((panel: HTMLDivElement | null) => {
    const viewport = panel?.closest('table')?.parentElement;
    if (!panel || !viewport) return;
    const resize = () => {
      panel.style.width = `${viewport.clientWidth}px`;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);
  return (
    <TableRow data-detail-row="" className="hover:bg-transparent">
      <TableCell colSpan={span} className="p-0">
        <div
          ref={measure}
          id={id}
          role="region"
          aria-labelledby={labelledBy}
          className="sticky start-0 box-border max-w-full whitespace-normal bg-card p-4"
        >
          {children}
        </div>
      </TableCell>
    </TableRow>
  );
}
