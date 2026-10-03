export interface CodeFile {
  /** File path, shown as the tab label. */
  path: string;
  /** Monaco language id. */
  language: string;
  content: string;
  /** Previous version; enables the diff view for this file. */
  original?: string;
}

export type ProblemSeverity = 'error' | 'warning' | 'info';

export interface CodeProblem {
  id: string;
  severity: ProblemSeverity;
  message: string;
  /** Path of the file the problem belongs to. */
  file: string;
  line: number;
  column?: number;
  /** Tool that reported it, e.g. "tsc" or "schema". */
  source?: string;
}

const handlerBefore = `import { listProjects } from './store';

export async function handler(req: Request) {
  const projects = await listProjects();
  return Response.json(projects);
}
`;

const handlerAfter = `import { listProjects } from './store';

export async function handler(req: Request) {
  const limit = Number(new URL(req.url).searchParams.get('limit') ?? 20);
  const projects = await listProjects({ limit });
  return Response.json({ items: projects, limit });
}
`;

export const codeFiles: CodeFile[] = [
  { path: 'src/handler.ts', language: 'typescript', content: handlerAfter, original: handlerBefore },
  {
    path: 'deploy.yaml',
    language: 'yaml',
    content: `name: projects-api
region: eu-west
replicas: 2
resources:
  cpu: 500m
  memory: 512Mi
`,
  },
  {
    path: 'settings.json',
    language: 'json',
    content: `{
  "timeoutMs": 30000,
  "retries": 3,
  "logLevel": "info"
}
`,
  },
];

export const codeProblems: CodeProblem[] = [
  { id: 'p1', severity: 'error', message: "Expected 0 arguments, but got 1.", file: 'src/handler.ts', line: 5, column: 43, source: 'tsc' },
  { id: 'p2', severity: 'warning', message: "'req' is declared but only read once; consider a typed query parser.", file: 'src/handler.ts', line: 3, column: 31, source: 'lint' },
  { id: 'p3', severity: 'info', message: 'replicas: 2 is below the recommended minimum of 3 for production.', file: 'deploy.yaml', line: 3, column: 1, source: 'schema' },
];
