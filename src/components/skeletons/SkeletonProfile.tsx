import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonProfile() {
  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
        <div className="flex items-start gap-4 mb-4">
          <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-2/5" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>
    </div>
  );
}
