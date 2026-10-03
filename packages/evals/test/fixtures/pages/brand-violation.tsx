import { Card } from '@gntik-ai/ui';

export default function Promo() {
  return (
    <Card>
      <p className="bg-red-500 text-white">Limited offer</p>
      <div style={{ background: '#ff0000' }}>Sale</div>
    </Card>
  );
}
