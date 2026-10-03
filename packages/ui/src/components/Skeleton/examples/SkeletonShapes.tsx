import { Skeleton } from '../Skeleton';

export default function SkeletonShapes() {
  return (
    <div role="status" aria-label="Loading content" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
      <Skeleton shape="text" lines={3} />
      <Skeleton shape="circle" className="size-11" />
      <Skeleton className="aspect-[4/3] h-auto rounded-lg" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}
