// Monaco language services run in web workers; Vite bundles them with `?worker`.
// The aliases (vite.config.ts) point at the monaco-editor copy that @gntik-ai/editor depends on.
import { configureMonacoWorkers } from '@gntik-ai/editor';
import EditorWorker from 'sandbox-monaco-worker/editor?worker';
import TsWorker from 'sandbox-monaco-worker/typescript?worker';

configureMonacoWorkers((_id, label) => (label === 'typescript' || label === 'javascript' ? new TsWorker() : new EditorWorker()));
