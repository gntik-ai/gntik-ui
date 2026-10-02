import { Skeleton } from '../Skeleton';

export default function SkeletonList() {
  return (
    <div role="status" aria-label="Loading members" className="max-w-xl overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-7 w-20" />
      </div>
      <ul className="divide-y divide-border">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3.5">
            <Skeleton shape="circle" className="size-9" />
            <Skeleton shape="text" lines={2} className="flex-1" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
