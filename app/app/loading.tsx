import { SkeletonCard } from "@/components/ui/SkeletonCard";

/** Route-level loading skeleton for app sections. */
export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3 py-4" aria-label="Loading">
      <SkeletonCard label="Loading content" />
      <SkeletonCard label="Loading content" />
    </main>
  );
}
