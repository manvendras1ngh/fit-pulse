import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-5">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-20" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      {/* Today card skeleton */}
      <Skeleton className="h-52 w-full rounded-2xl" />

      {/* Weekly summary skeleton */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <div className="flex justify-around">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
