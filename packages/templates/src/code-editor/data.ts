import type { CodeFile, CodeProblem } from '@gntik-ai/blocks';
import { FileCode, FileJson, FileText, Folder, FolderOpen } from '@gntik-ai/icons';
import type { BreadcrumbItem, TreeNode } from '@gntik-ai/ui';

export const editorProject = {
  title: 'projects-api',
  status: 'draft',
  branch: 'feature/pagination',
};

export const editorBreadcrumbs: BreadcrumbItem[] = [
  { label: 'Services', href: '/services' },
  { label: 'projects-api', mono: true },
];

const handlerBefore = `import { db } from './db';

export async function handler(req: Request) {
  const projects = await db.projects.list();
  return Response.json(projects);
}
`;

const handlerAfter = `import { db } from './db';
import { parseQuery } from './query';

export async function handler(req: Request) {
  const { page, pageSize } = parseQuery(req.url);
  const projects = await db.projects.list({ page, pageSize });
  return Response.json({ items: projects, page });
}
`;

export const editorFiles: CodeFile[] = [
  { path: 'src/handler.ts', language: 'typescript', content: handlerAfter, original: handlerBefore },
  {
    path: 'src/query.ts',
    language: 'typescript',
    content: `export function parseQuery(url: string) {
  const params = new URL(url).searchParams;
  return { page: Number(params.get('page') ?? 1), pageSize: Number(params.get('pageSize') ?? 20) };
}
`,
  },
  { path: 'src/db.ts', language: 'typescript', content: `export const db = { projects: { list: async (_opts?: unknown) => [] as unknown[] } };\n` },
  {
    path: 'config/deploy.yaml',
    language: 'yaml',
    content: `name: projects-api
region: eu-west
replicas: 2
`,
  },
  { path: 'config/settings.json', language: 'json', content: `{\n  "timeoutMs": 30000,\n  "retries": 3\n}\n` },
  { path: 'README.md', language: 'markdown', content: `# projects-api\n\nLists the projects of a workspace, paginated.\n` },
];

export const editorProblems: CodeProblem[] = [
  { id: 'p1', severity: 'error', message: "Property 'page' does not exist on the list options type.", file: 'src/handler.ts', line: 6, column: 45, source: 'tsc' },
  { id: 'p2', severity: 'warning', message: 'pageSize is not clamped; very large pages are possible.', file: 'src/query.ts', line: 3, column: 42, source: 'lint' },
  { id: 'p3', severity: 'info', message: 'replicas: 2 is below the recommended minimum of 3 for production.', file: 'config/deploy.yaml', line: 3, column: 1, source: 'schema' },
];

export const editorDefaultOpen = ['src/handler.ts', 'src/query.ts'];

const iconFor = (path: string) => (path.endsWith('.json') ? FileJson : path.endsWith('.md') ? FileText : FileCode);

/** Folder tree of the file paths: folders first, then files, each alphabetical. Folder ids end in "/". */
export function filesToTree(paths: readonly string[]): TreeNode[] {
  type Dir = { dirs: Map<string, Dir>; files: string[] };
  const root: Dir = { dirs: new Map(), files: [] };
  for (const path of paths) {
    const parts = path.split('/');
    let dir = root;
    for (const part of parts.slice(0, -1)) {
      let next = dir.dirs.get(part);
      if (!next) {
        next = { dirs: new Map(), files: [] };
        dir.dirs.set(part, next);
      }
      dir = next;
    }
    dir.files.push(path);
  }
  const build = (dir: Dir, prefix: string): TreeNode[] => [
    ...[...dir.dirs.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, sub]) => ({ id: `${prefix}${name}/`, label: name, icon: Folder, openIcon: FolderOpen, children: build(sub, `${prefix}${name}/`) })),
    ...[...dir.files].sort().map((path) => ({ id: path, label: path.split('/').pop() ?? path, icon: iconFor(path) })),
  ];
  return build(root, '');
}
