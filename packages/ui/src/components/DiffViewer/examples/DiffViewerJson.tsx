import { DiffViewer } from '../DiffViewer';

const previous = { name: 'ingest-worker', replicas: 2, env: { LOG_LEVEL: 'info', REGION: 'eu-west' }, ports: [8080] };
// Same keys in a different order: only real changes show up.
const next = { ports: [8080, 9090], env: { REGION: 'eu-west', LOG_LEVEL: 'debug' }, replicas: 3, name: 'ingest-worker' };

export default function DiffViewerJson() {
  return <DiffViewer format="json" oldValue={previous} newValue={next} defaultMode="split" oldLabel="Revision 41" newLabel="Revision 42" aria-label="Revision changes" />;
}
