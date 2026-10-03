import { CodePanel, type CodeFile, type CodeProblem } from '@gntik-ai/blocks';
import type { MonacoLoader } from '@gntik-ai/editor';
import { Copy, ExternalLink, Save, Trash2, X } from '@gntik-ai/icons';
import {
  Badge,
  Breadcrumbs,
  Button,
  CanvasLayout,
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  MenuItem,
  MenuSeparator,
  StatusTag,
  TreeList,
  type BreadcrumbItem,
} from '@gntik-ai/ui';
import { useState, type MouseEvent } from 'react';
import { editorBreadcrumbs, editorDefaultOpen, editorFiles, editorProblems, editorProject, filesToTree } from './data';

export interface CodeEditorPageProps {
  title: string;
  /** StatusTag key next to the title. */
  status: string;
  /** Branch or version shown as a badge. */
  branch: string;
  files: CodeFile[];
  problems: CodeProblem[];
  /** Paths open as tabs initially (the first one is active). */
  defaultOpen: string[];
  /** Receives the edited files (path → new content). A returned promise shows the saving state. */
  onSave: (changes: Record<string, string>) => void | Promise<void>;
  /** Called after "Delete" in a file's context menu; the file leaves the tree and the tabs. */
  onDeleteFile: (path: string) => void;
  /** Monaco loader (self-hosting, tests). Monaco loads lazily by default. */
  loader: MonacoLoader;
  breadcrumbs: BreadcrumbItem[];
  fullScreen: boolean;
}

/**
 * Code editor page: CanvasLayout with a file TreeList (context menu: open, copy path, close,
 * delete) in the palette and the CodePanel block (file tabs, editor / diff, problems) as the
 * canvas. Opening a file from the tree focuses its tab; edits survive reopening and Save
 * hands them over.
 */
export default function CodeEditorPage(props: Partial<CodeEditorPageProps>) {
  const {
    title = editorProject.title,
    status = editorProject.status,
    branch = editorProject.branch,
    files: initialFiles = editorFiles,
    problems = editorProblems,
    defaultOpen = editorDefaultOpen,
    onSave,
    onDeleteFile,
    loader,
    breadcrumbs = editorBreadcrumbs,
    fullScreen = true,
  } = props;
  const [deleted, setDeleted] = useState<string[]>([]);
  const [open, setOpen] = useState(() => defaultOpen.filter((p) => initialFiles.some((f) => f.path === p)));
  const [active, setActive] = useState(open[0] ?? '');
  const [nonce, setNonce] = useState(0);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [target, setTarget] = useState<string | null>(null);

  const files = initialFiles.filter((f) => !deleted.includes(f.path));
  const isFile = (id: string | null | undefined): id is string => !!id && files.some((f) => f.path === id);
  const openFiles = open.flatMap((p) => {
    const f = files.find((x) => x.path === p);
    return f ? [{ ...f, content: edits[p] ?? f.content }] : [];
  });
  const dirty = Object.keys(edits).filter((p) => edits[p] !== files.find((f) => f.path === p)?.content);

  const openFile = (path: string) => {
    if (!isFile(path)) return;
    setOpen((list) => (list.includes(path) ? list : [...list, path]));
    setActive(path);
    // CodePanel only takes an initial file: remount it on the requested tab (edits live here).
    setNonce((n) => n + 1);
  };
  const closeFile = (path: string) => {
    const rest = open.filter((p) => p !== path);
    setOpen(rest);
    if (active === path) setActive(rest[0] ?? '');
    setNonce((n) => n + 1);
  };
  const deleteFile = (path: string) => {
    closeFile(path);
    setDeleted((d) => [...d, path]);
    onDeleteFile?.(path);
    setNote(`Deleted ${path}`);
  };
  const copyPath = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      setNote(`Copied ${path}`);
    } catch {
      setNote('Copy failed');
    }
  };
  const save = async () => {
    setSaving(true);
    try {
      await onSave?.(Object.fromEntries(dirty.map((p) => [p, edits[p] ?? ''])));
      setNote('All changes saved');
    } finally {
      setSaving(false);
    }
  };

  // Right click: the row under the pointer. Keyboard (Shift+F10): the focused row.
  const pickTarget = (event: MouseEvent<HTMLElement>) => {
    const fromPointer = (event.target as HTMLElement).closest<HTMLElement>('[role="treeitem"]');
    const fromFocus = document.activeElement?.closest<HTMLElement>('[role="treeitem"]');
    setTarget((fromPointer ?? fromFocus)?.dataset.id ?? null);
  };
  const menuFile = isFile(target) ? target : null;

  return (
    <CanvasLayout
      fullScreen={fullScreen}
      mainLabel={`${title} editor`}
      smallScreenNotice={null}
      paletteLabel="Files"
      palette={
        <ContextMenu>
          <ContextMenuTrigger tabIndex={-1} role="group" aria-label="Project files" hint="Shift+F10 opens file actions" onContextMenu={pickTarget} className="block border-0 bg-transparent p-0">
            <TreeList
              aria-label="Files"
              nodes={filesToTree(files.map((f) => f.path))}
              defaultExpanded={['src/', 'config/']}
              selected={active ? [active] : []}
              onSelectedChange={(ids) => ids[0] && openFile(ids[0])}
              onAction={(node) => openFile(node.id)}
            />
          </ContextMenuTrigger>
          <ContextMenuContent className="w-52">
            <MenuItem icon={ExternalLink} disabled={!menuFile} onClick={() => menuFile && openFile(menuFile)}>
              Open
            </MenuItem>
            <MenuItem icon={Copy} disabled={!menuFile} onClick={() => menuFile && void copyPath(menuFile)}>
              Copy path
            </MenuItem>
            <MenuItem icon={X} disabled={!menuFile || !open.includes(menuFile)} onClick={() => menuFile && closeFile(menuFile)}>
              Close tab
            </MenuItem>
            <MenuSeparator />
            <MenuItem icon={Trash2} destructive disabled={!menuFile} onClick={() => menuFile && deleteFile(menuFile)}>
              Delete file
            </MenuItem>
          </ContextMenuContent>
        </ContextMenu>
      }
      header={
        <>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Breadcrumbs items={breadcrumbs} className="hidden min-w-0 md:flex" />
            <h1 className="truncate font-mono text-[14px] font-semibold text-foreground">{title}</h1>
            <StatusTag status={status} />
            <Badge size="sm" className="hidden font-mono sm:inline-flex">
              {branch}
            </Badge>
            <p aria-live="polite" className="hidden truncate text-[12px] text-muted-foreground sm:block">
              {note || (dirty.length ? `${dirty.length} unsaved ${dirty.length === 1 ? 'file' : 'files'}` : '')}
            </p>
          </div>
          <Button size="sm" icon={Save} loading={saving} disabled={dirty.length === 0} onClick={() => void save()}>
            Save
          </Button>
        </>
      }
    >
      <div className="h-full overflow-auto p-3 sm:p-4">
        {/* CodePanel titles its problems list h3 and has no heading level prop. */}
        <h2 className="sr-only">Open files</h2>
        {openFiles.length === 0 ? (
          <p className="p-6 text-center text-[13px] text-muted-foreground">Open a file from the tree to edit it.</p>
        ) : (
          <CodePanel
            key={`${nonce}`}
            files={openFiles}
            problems={problems.filter((p) => open.includes(p.file))}
            defaultFile={active}
            height={420}
            loader={loader}
            onChange={(path, value) => setEdits((e) => ({ ...e, [path]: value }))}
          />
        )}
      </div>
    </CanvasLayout>
  );
}
