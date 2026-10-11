import { JsonViewer } from '../JsonViewer';

const PAYLOAD = { records: Array.from({ length: 80 }, (_, id) => ({ id, message: 'Completed processing' })) };

export default function JsonViewerCapped() {
  return (
    <JsonViewer
      label="Capped result payload"
      data={PAYLOAD}
      maxDisplayChars={4096}
      maxHeight={160}
      className="w-full max-w-lg"
    />
  );
}
