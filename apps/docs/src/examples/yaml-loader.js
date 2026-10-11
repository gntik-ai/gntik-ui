// Consumer-owned integration: no published kit package imports monaco-yaml or its workers.
import { configureMonacoWorkers } from '@gntik-ai/editor';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import YamlWorker from 'monaco-yaml/yaml.worker?worker';
import { yamlMonaco } from './yaml-monaco.js';

configureMonacoWorkers((_id, label) => (label === 'yaml' ? new YamlWorker() : new EditorWorker()));

let cached;
export function yamlLoader() {
  cached ??= Promise.all([import('monaco-editor'), import('monaco-yaml')]).then(([monaco, { configureMonacoYaml }]) => {
    configureMonacoYaml(yamlMonaco(monaco), {
      enableSchemaRequest: false,
      validate: true,
      schemas: [
        {
          uri: 'https://schemas.example.invalid/workflow.json',
          fileMatch: ['*'],
          schema: {
            type: 'object',
            required: ['count'],
            properties: { count: { type: 'integer' } },
          },
        },
      ],
    });
    return monaco;
  });
  return cached;
}
