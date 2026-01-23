import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[180px]" />
      </div>

      {/* Dashboard grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4 p-6 border rounded-lg">
            <Skeleton className="h-5 w-[140px]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-[80px] w-full" />
            <Skeleton className="h-9 w-[100px]" />
          </div>
        ))}
      </div>
    </div>
  );
}
