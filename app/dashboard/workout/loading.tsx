import { Skeleton } from "@/components/ui/skeleton";

export default function WorkoutLoading() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-36" />
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-11 w-full rounded-xl" />
    </div>
  );
}
