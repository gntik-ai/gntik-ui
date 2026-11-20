import type { ReactNode, RefObject } from 'react';

export function AutoSizeBody({
  enabled,
  viewportRef,
  children,
}: {
  enabled: boolean;
  viewportRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  if (!enabled) return children;
  return (
    <div className="min-h-0 flex-1">
      {/* A zero-width percentage-height probe has no intrinsic height. In a content-sized
        parent it stays zero, so row count cannot feed back into the measurement. */}
      <div
        ref={viewportRef}
        data-auto-page-size-viewport
        aria-hidden
        className="pointer-events-none float-left h-full w-0"
      />
      {children}
    </div>
  );
}
