import { ResizablePanelGroup, ResizablePanel, ResizeHandle } from '../Resizable';

const PROJECTS = ['Billing API', 'Search', 'Mobile app', 'Data pipeline'];

export default function ResizableWorkspace() {
  return (
    <div className="h-72 max-w-[720px] overflow-hidden rounded-xl border border-border bg-card">
      <ResizablePanelGroup autoSaveId="example-workspace">
        <ResizablePanel id="workspace-nav" defaultSize={28} minSize={18} maxSize={45} collapsible>
          <nav aria-label="Projects" className="h-full p-3">
            <p className="px-2 pb-2 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">Projects</p>
            <ul className="grid gap-0.5">
              {PROJECTS.map((p, i) => (
                <li key={p}>
                  <a
                    href={`#project-${i}`}
                    aria-current={i === 0 ? 'page' : undefined}
                    className="block truncate rounded-md px-2 py-1.5 text-[13px] text-foreground hover:bg-secondary/70 aria-[current=page]:bg-primary/14 aria-[current=page]:text-primary-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
                  >
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </ResizablePanel>
        <ResizeHandle withHandle aria-label="Resize project list" />
        <ResizablePanel minSize={40}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={65} minSize={30}>
              <div className="h-full p-4">
                <p className="text-[15px] font-semibold tracking-tight text-foreground">Billing API</p>
                <p className="mt-1 text-[13px] text-muted-foreground">Last deployed 12 minutes ago to production.</p>
              </div>
            </ResizablePanel>
            <ResizeHandle aria-label="Resize logs" />
            <ResizablePanel minSize={20} collapsible>
              <pre className="h-full bg-secondary/40 p-4 font-mono text-[12px] text-muted-foreground">
                {'12:04:11  build   ok\n12:04:39  deploy  eu-west-1 ok\n12:05:02  deploy  us-east-2 ok'}
              </pre>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
