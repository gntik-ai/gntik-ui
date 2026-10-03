import { ResizablePanelGroup, ResizablePanel, ResizeHandle } from '../Resizable';

export default function ResizableSplit() {
  return (
    <div className="h-40 max-w-[560px] overflow-hidden rounded-xl border border-border">
      <ResizablePanelGroup>
        <ResizablePanel defaultSize={50} minSize={20}>
          <div className="flex h-full items-center justify-center text-[13px] text-muted-foreground">Draft</div>
        </ResizablePanel>
        <ResizeHandle aria-label="Resize draft and preview" />
        <ResizablePanel minSize={20}>
          <div className="flex h-full items-center justify-center bg-secondary/40 text-[13px] text-muted-foreground">Preview</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
