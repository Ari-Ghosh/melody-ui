import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonMessages() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      <div className="flex justify-start">
        <Skeleton className="h-10 w-3/5 rounded-2xl rounded-bl-md" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-8 w-2/5 rounded-2xl rounded-br-md" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-12 w-4/5 rounded-2xl rounded-bl-md" />
      </div>
      <div className="flex justify-end">
        <Skeleton className="h-8 w-1/3 rounded-2xl rounded-br-md" />
      </div>
      <div className="flex justify-start">
        <Skeleton className="h-10 w-1/2 rounded-2xl rounded-bl-md" />
      </div>
    </div>
  );
}
