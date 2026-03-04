import { Skeleton } from "@/components/ui/skeleton";

export default function ProgressLoading() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 p-5">
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-10 w-full rounded-[10px]" />
      <Skeleton className="h-52 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    </div>
  );
}
