import { Skeleton } from "@/components/ui/skeleton";

export default function SwipeCardSkeleton() {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <Skeleton className="aspect-square w-full rounded-none" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <Skeleton className="h-14 w-14 rounded-full" />
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    </div>
  );
}
