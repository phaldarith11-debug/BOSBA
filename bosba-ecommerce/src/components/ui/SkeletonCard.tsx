export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card">
      <div className="aspect-square skeleton" />
      <div className="p-3.5 space-y-2.5">
        <div className="h-2 w-14 skeleton rounded-full" />
        <div className="h-3.5 w-full skeleton rounded-md" />
        <div className="h-3 w-3/4 skeleton rounded-md" />
        <div className="h-4 w-2/5 skeleton rounded-md mt-1" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
