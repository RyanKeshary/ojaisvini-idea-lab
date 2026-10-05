import { SkeletonCard } from "@/components/ui/SkeletonCard";

export default function Loading() {
  return (
    <main className="mx-auto grid w-full max-w-3xl gap-3 px-4 py-6" aria-label="Loading">
      <SkeletonCard label="Loading content" />
      <SkeletonCard label="Loading content" />
    </main>
  );
}
