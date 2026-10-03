import { JsonViewer } from '../JsonViewer';

const EVENT = {
  type: 'invoice.paid',
  data: { invoice: { id: 'inv_2041', total: 1290, lines: [{ sku: 'seat', qty: 12 }], customer: { id: 'cus_77', address: { country: 'ES' } } } },
};

export default function JsonViewerDepth() {
  return <JsonViewer label="Webhook event" data={EVENT} defaultExpandDepth={3} maxDepth={3} toolbar={false} className="w-full max-w-lg" />;
}
