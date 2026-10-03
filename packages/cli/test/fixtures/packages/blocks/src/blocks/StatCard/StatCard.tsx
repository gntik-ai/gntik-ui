import { Card } from '@gntik-ai/ui';
import { TrendingUp } from 'lucide-react';

export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
      <TrendingUp size={16} className="text-success-text" />
    </Card>
  );
}
