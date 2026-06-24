import { cn } from '@/lib/utils';

type SkeletonVariant = 'card' | 'row' | 'text';

export default function Skeleton({
  variant = 'text',
  className,
}: {
  variant?: SkeletonVariant;
  className?: string;
}) {
  if (variant === 'card') {
    return (
      <div className={cn('overflow-hidden rounded-2xl bg-white shadow-sm', className)}>
        <div className="aspect-[4/3] animate-pulse bg-gray-200" />
        <div className="space-y-3 p-5">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-1/3 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className={cn('flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm', className)}>
        <div className="h-16 w-24 animate-pulse rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
      </div>
    );
  }

  return <div className={cn('h-4 w-full animate-pulse rounded bg-gray-200', className)} />;
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="card" />
      ))}
    </div>
  );
}
