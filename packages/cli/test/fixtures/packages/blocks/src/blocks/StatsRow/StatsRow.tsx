import { Button } from '../../../../ui/src/components/Button';
import { cn } from '../../../../ui/src/utils/cn';
import { StatCard } from '../StatCard/StatCard';

export function StatsRow({ stats, className }: { stats: Array<{ label: string; value: string }>; className?: string }) {
  return (
    <section className={cn('grid gap-4 sm:grid-cols-3', className)}>
      {stats.map((s) => (
        <StatCard key={s.label} {...s} />
      ))}
      <Button variant="ghost">View all</Button>
    </section>
  );
}
