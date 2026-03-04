import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 p-5">
      <Skeleton className="h-8 w-20" />
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </div>
      <Skeleton className="h-6 w-24" />
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  );
}
