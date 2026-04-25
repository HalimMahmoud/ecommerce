

export function ProductCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="pt-2">
          <div className="h-8 bg-muted rounded w-full" />
        </div>
      </div>
    </div>
  );
}

export function FiltersSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-10 bg-muted rounded w-full" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 bg-muted rounded w-full" />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-10 bg-muted rounded w-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
