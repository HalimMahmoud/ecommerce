import { Suspense } from 'react';
import HeroSection from '@/components/features/products/hero-section';
import FeaturesSection from '@/components/features/products/features-section';
import FiltersWrapper from '@/components/features/products/filters-wrapper';
import GridWrapper from '@/components/features/products/grid-wrapper';
import { ProductGridSkeleton, FiltersSkeleton } from '@/components/features/products/product-skeleton';
import { searchParamsCache } from '@/lib/search-params';

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = searchParamsCache.parse(await searchParams);
  
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <Suspense fallback={<FiltersSkeleton />}>
              <FiltersWrapper />
            </Suspense>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <Suspense fallback={<ProductGridSkeleton />}>
              <GridWrapper params={{
                search: params.search ?? null,
                category: params.category ?? null,
                sort: params.sort ?? null,
                minPrice: params.minPrice ?? null,
                maxPrice: params.maxPrice ?? null,
                rating: params.rating ?? null,
              }} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

