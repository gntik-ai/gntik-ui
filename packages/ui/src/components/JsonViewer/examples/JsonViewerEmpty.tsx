import { JsonViewer } from '../JsonViewer';

export default function JsonViewerEmpty() {
  return <JsonViewer label="Empty result" data="" maxDisplayChars={4096} className="w-full max-w-lg" />;
}
