import { Skeleton } from "@/components/ui/skeleton";

export default function PlanLoading() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-5">
      <div>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-1 h-4 w-52" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
