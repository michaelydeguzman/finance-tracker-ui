import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route-level fallback. The list has its own in-card spinner for the data
 * fetch; this covers the moment before the client bundle is on screen at all,
 * so the page is never a blank frame.
 */
export default function Loading() {
  return (
    <div className="flex w-full gap-6">
      <div className="min-w-0 flex-1 space-y-3">
        <Skeleton className="h-10 w-[220px]" />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>

      <div className="hidden w-80 shrink-0 space-y-3 lg:block">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}
