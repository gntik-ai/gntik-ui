import { DiffViewer } from '../DiffViewer';

const before = `server:
  port: 8080
  host: 0.0.0.0
  timeout: 30s
logging:
  level: info
  format: text
cache:
  enabled: true
  ttl: 300
  size: 512
retries:
  max: 3
  backoff: linear
features:
  search: true
  export: false
`;

const after = `server:
  port: 8443
  host: 0.0.0.0
  timeout: 30s
  tls: true
logging:
  level: info
  format: json
cache:
  enabled: true
  ttl: 300
  size: 512
retries:
  max: 5
features:
  search: true
  export: false
`;

export default function DiffViewerText() {
  return <DiffViewer oldValue={before} newValue={after} oldLabel="config.yaml · v12" newLabel="config.yaml · v13" context={1} maxHeight={360} />;
}
