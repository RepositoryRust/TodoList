import { Skeleton } from "../ui/skeleton";

export default function SkeletonTodo() {
  return (
    <div className="flex h-svh gap-4 overflow-hidden bg-[#1b1b1b] p-4">
      {/* Sidebar Skeleton */}
      <Skeleton className="hidden md:block w-72 rounded-lg" />

      {/* Content Skeleton */}
      <Skeleton className="flex-1 rounded-lg" />
    </div>
  );
}
