import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonLogin() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#1B1B1B] p-6 md:p-0">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <Skeleton className="h-108.5 w-full rounded-md" />
      </div>
    </div>
  );
}
