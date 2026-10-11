/** Consumer adapter for monaco-worker-manager 2.x's pre-0.57 worker API. */
export function yamlMonaco(monaco) {
  return {
    ...monaco,
    editor: {
      ...monaco.editor,
      createWebWorker({ createData, label, host, keepIdleModels }) {
        const worker = Promise.resolve(
          globalThis.MonacoEnvironment.getWorker("workerMain.js", label),
        ).then((worker) => {
          // The legacy YAML bootstrap consumes one message before initialize() accepts its options.
          worker.postMessage("-please-ignore-");
          worker.postMessage(createData);
          return worker;
        });
        return monaco.editor.createWebWorker({ worker, host, keepIdleModels });
      },
    },
  };
}
